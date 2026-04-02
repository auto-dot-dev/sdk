/**
 * Convert docs.auto.dev product MDX files to plain markdown.
 * Strips JSX components (TypeTable, Accordion, ClickableCodeBlock) into markdown equivalents.
 *
 * Usage: npx tsx scripts/build-docs.ts [docs-path]
 * Default docs path: DOCS_PATH env var or ../docs.auto.dev (sibling repo)
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs'
import { join, basename, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const DOCS_PATH = process.argv[2]
  ?? process.env.DOCS_PATH
  ?? join(__dirname, '..', '..', 'docs.auto.dev')

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
      const name = entry[1]
      const props = entry[2]
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
