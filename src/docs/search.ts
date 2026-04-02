import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, basename, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DOCS_DIR = join(__dirname, '..', '..', 'dist', 'docs')

export interface DocEntry {
  name: string
  filename: string
  content: string
}

export function listDocs(): string[] {
  if (!existsSync(DOCS_DIR)) return []
  return readdirSync(DOCS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => basename(f, '.md'))
}

export function getDoc(name: string): string | null {
  const filePath = join(DOCS_DIR, `${name}.md`)
  if (!existsSync(filePath)) return null
  return readFileSync(filePath, 'utf-8')
}

export function searchDocs(query: string): DocEntry[] {
  if (!existsSync(DOCS_DIR)) return []

  const terms = query.toLowerCase().split(/\s+/)
  const files = readdirSync(DOCS_DIR).filter((f) => f.endsWith('.md'))
  const results: DocEntry[] = []

  for (const file of files) {
    const content = readFileSync(join(DOCS_DIR, file), 'utf-8')
    const lower = content.toLowerCase()
    const nameMatch = terms.some((t) => file.toLowerCase().includes(t))
    const contentMatch = terms.some((t) => lower.includes(t))

    if (nameMatch || contentMatch) {
      results.push({
        name: basename(file, '.md'),
        filename: file,
        content,
      })
    }
  }

  // Sort: name matches first
  results.sort((a, b) => {
    const aName = terms.some((t) => a.name.toLowerCase().includes(t)) ? 0 : 1
    const bName = terms.some((t) => b.name.toLowerCase().includes(t)) ? 0 : 1
    return aName - bName
  })

  return results
}
