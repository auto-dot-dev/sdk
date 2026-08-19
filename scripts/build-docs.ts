/**
 * Convert docs.auto.dev product MDX files to plain markdown.
 * Strips JSX components (TypeTable, Accordion, ClickableCodeBlock) into markdown equivalents.
 *
 * Usage: npx tsx scripts/build-docs.ts [docs-path]
 *
 * Source resolution, in order: CLI arg, DOCS_REF, DOCS_PATH, .env, ~/Workspace, sibling repo.
 *
 * DOCS_REF fetches from GitHub instead of the filesystem:
 *   DOCS_REF=main npx tsx scripts/build-docs.ts
 *   DOCS_REF=feat/no-trials-copy npx tsx scripts/build-docs.ts
 *
 * Without it the script needs a local docs.auto.dev checkout, which is why regenerating
 * src/docs/data.ts used to mean pointing .env at a path on one person's machine — and why the
 * committed output could drift from the docs it claims to mirror with nothing to catch it.
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, mkdtempSync } from 'node:fs'
import { join, basename, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'
import { homedir, tmpdir } from 'node:os'

const __dirname = dirname(fileURLToPath(import.meta.url))

const DOCS_REPO = process.env.DOCS_REPO ?? 'drivly/docs.auto.dev'

/**
 * Shallow-clone the docs repo at a ref and return the checkout path.
 *
 * Uses the ambient git credentials — a developer's existing auth locally, or a token-backed
 * remote in CI. docs.auto.dev is private and this SDK is public, so a workflow using this needs
 * a cross-org read token; there is no way around that and no attempt to work around it here.
 */
function cloneDocsAtRef(ref: string): string {
  const dest = join(mkdtempSync(join(tmpdir(), 'autodev-docs-')), 'docs.auto.dev')
  const url = `https://github.com/${DOCS_REPO}.git`
  console.log(`Fetching ${DOCS_REPO}@${ref}`)
  try {
    execSync(`git clone --depth=1 --branch "${ref}" --quiet "${url}" "${dest}"`, {
      stdio: ['ignore', 'ignore', 'pipe'],
      timeout: 120_000,
    })
  } catch (err) {
    const detail = err instanceof Error && 'stderr' in err ? String(err.stderr).trim() : String(err)
    throw new Error(
      `Could not fetch ${DOCS_REPO}@${ref}. Check the ref exists and that you have read access ` +
        `(the repo is private). Underlying error: ${detail}`,
    )
  }
  return dest
}

function findDocsPath(): string {
  // 1. CLI arg — most explicit, wins over everything.
  const arg = process.argv[2]
  if (arg) {
    // Catch `pnpm build:docs DOCS_REF=main`. An env var placed after the command arrives here
    // as a positional, and the arg check above wins, so it would otherwise be treated as a
    // path — failing with "Product docs not found at: DOCS_REF=main/content/..." which names
    // the symptom and not the mistake.
    if (/^[A-Z][A-Z0-9_]*=/.test(arg)) {
      throw new Error(
        `"${arg}" looks like an environment variable, not a path. Put it before the command:\n` +
          `  ${arg} pnpm build:docs`,
      )
    }
    return arg
  }

  // 2. A ref is a more specific request than a path, so it takes precedence over DOCS_PATH.
  if (process.env.DOCS_REF) return cloneDocsAtRef(process.env.DOCS_REF)

  // 3. Env var
  if (process.env.DOCS_PATH) return process.env.DOCS_PATH

  // 4. Load from .env file if present
  const envFile = join(__dirname, '..', '.env')
  if (existsSync(envFile)) {
    const envContent = readFileSync(envFile, 'utf-8')
    const docsPath = envContent.match(/^DOCS_PATH=(.+)$/m)?.[1]
    if (docsPath) return docsPath.trim().replace(/^["']|["']$/g, '')
  }

  // 5. Try to find docs.auto.dev anywhere under ~/Workspace using find
  try {
    const workspace = join(homedir(), 'Workspace')
    const result = execSync(
      `find ${workspace} -maxdepth 5 -type d -name "docs.auto.dev" -exec test -d "{}/content/docs/v2/products" \\; -print -quit 2>/dev/null`,
      { encoding: 'utf-8', timeout: 5000 },
    ).trim()
    if (result) return result
  } catch {
    // find failed or timed out, fall through
  }

  return join(__dirname, '..', '..', 'docs.auto.dev')
}

const DOCS_PATH = findDocsPath()

const PRODUCTS_DIR = join(DOCS_PATH, 'content', 'docs', 'v2', 'products')
const OUTPUT_DIR = join(__dirname, '..', 'dist', 'docs')

function convertMdxToMarkdown(content: string): string {
  let md = content

  // Remove frontmatter
  md = md.replace(/^---[\s\S]*?---\n*/m, '')

  // Remove import statements
  md = md.replace(/^import\s+.*\n/gm, '')

  // Convert <TypeTable type={{ ... }}> to markdown table
  md = md.replace(/<TypeTable\s+type=\{\{([\s\S]*?)\}\}\s*\/>/g, (_match, inner) => {
    const rows: string[] = []
    const entryRegex = /['"]?([\w.]+)['"]?\s*:\s*\{([^}]+)\}/g
    let entry
    while ((entry = entryRegex.exec(inner)) !== null) {
      const name = entry[1] ?? ''
      const props = entry[2] ?? ''
      const desc = props.match(/description:\s*'([^']*)'/)
      const type = props.match(/type:\s*'([^']*)'/)
      const def = props.match(/default:\s*'([^']*)'/)
      rows.push(`| \`${name}\` | ${type?.[1] ?? ''} | ${desc?.[1] ?? ''} | ${def?.[1] ?? ''} |`)
    }
    if (rows.length === 0) return ''
    return `| Parameter | Type | Description | Default |\n|-----------|------|-------------|--------|\n${rows.join('\n')}\n`
  })

  // Convert <Accordion title="X"> to ### X
  md = md.replace(/<Accordion\s+title="([^"]+)"[^>]*>/g, '\n### $1\n')
  md = md.replace(/<\/Accordion>/g, '')
  md = md.replace(/<Accordions[^>]*>/g, '')
  md = md.replace(/<\/Accordions>/g, '')

  // Convert <ClickableCodeBlock code="X" ... lang="Y"> to fenced code block
  // Single line version
  md = md.replace(/<ClickableCodeBlock\s+code='([^']+)'\s+href='[^']+'\s+lang='([^']+)'\s*\/>/g, '\n```$2\n$1\n```\n')
  // Multi-line version
  md = md.replace(/<ClickableCodeBlock\s*\n\s*code='([^']+)'\s*\n\s*href='[^']+'\s*\n\s*lang='([^']+)'\s*\n\s*\/>/g, '\n```$2\n$1\n```\n')

  // Remove any remaining JSX self-closing tags
  md = md.replace(/<[A-Z]\w+[^>]*\/>/g, '')

  // Clean up excess blank lines
  md = md.replace(/\n{3,}/g, '\n\n')

  return md.trim() + '\n'
}

// Main
if (!existsSync(PRODUCTS_DIR)) {
  console.error(`Product docs not found at: ${PRODUCTS_DIR}`)
  console.error('Set DOCS_PATH env var or pass path as argument')
  process.exit(1)
}

mkdirSync(OUTPUT_DIR, { recursive: true })

const files = readdirSync(PRODUCTS_DIR).filter((f) => f.endsWith('.mdx') && f !== 'index.mdx')
let converted = 0

for (const file of files) {
  const content = readFileSync(join(PRODUCTS_DIR, file), 'utf-8')
  const markdown = convertMdxToMarkdown(content)
  const outName = basename(file, '.mdx') + '.md'
  writeFileSync(join(OUTPUT_DIR, outName), markdown, 'utf-8')
  console.log(`  ${file} -> ${outName}`)
  converted++
}

// Copy OpenAPI spec if it exists
const openapiPath = join(DOCS_PATH, 'src', 'v2.openapi.json')
if (existsSync(openapiPath)) {
  const spec = readFileSync(openapiPath, 'utf-8')
  writeFileSync(join(OUTPUT_DIR, 'openapi.json'), spec, 'utf-8')
  console.log('  v2.openapi.json -> openapi.json')
}

console.log(`\nConverted ${converted} docs to ${OUTPUT_DIR}`)
