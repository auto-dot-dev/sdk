/**
 * Workers-compatible docs search.
 * Uses bundled DOCS_DATA instead of filesystem access.
 * Same API as search.ts but works everywhere.
 */

import { DOCS_DATA } from './data'

const ALIASES: Record<string, string> = {
  decode: 'vin-decode',
  photos: 'vehicle-photos',
  listings: 'vehicle-listings',
  specs: 'specifications',
  build: 'oem-build-data',
  recalls: 'vehicle-recalls',
  payments: 'vehicle-payments',
  apr: 'interest-rates',
  tco: 'total-cost-ownership',
  openRecalls: 'open-recalls',
  'open-recalls': 'open-recalls',
  plate: 'plate-to-vin',
  taxes: 'taxes-fees',
}

export interface DocEntry {
  name: string
  filename: string
  content: string
}

export function listDocs(): string[] {
  return Object.keys(DOCS_DATA)
}

export function getDoc(name: string): string | null {
  const resolved = ALIASES[name] ?? name
  return DOCS_DATA[resolved] ?? null
}

export function searchDocs(query: string): DocEntry[] {
  const terms = query.toLowerCase().split(/\s+/)
  const results: DocEntry[] = []

  for (const [name, content] of Object.entries(DOCS_DATA)) {
    const lower = content.toLowerCase()
    const nameMatch = terms.some((t) => name.toLowerCase().includes(t))
    const contentMatch = terms.some((t) => lower.includes(t))

    if (nameMatch || contentMatch) {
      results.push({ name, filename: `${name}.md`, content })
    }
  }

  const queryLower = query.toLowerCase().replace(/([A-Z])/g, (m) => '-' + m.toLowerCase())
  results.sort((a, b) => {
    const aLower = a.name.toLowerCase()
    const bLower = b.name.toLowerCase()
    const aLastSeg = aLower.split('-').pop() ?? ''
    const bLastSeg = bLower.split('-').pop() ?? ''
    const aScore = aLower === queryLower ? 0
      : aLastSeg === queryLower ? 1
      : aLower.startsWith(queryLower) ? 2
      : aLower.includes(queryLower) ? 3
      : 4
    const bScore = bLower === queryLower ? 0
      : bLastSeg === queryLower ? 1
      : bLower.startsWith(queryLower) ? 2
      : bLower.includes(queryLower) ? 3
      : 4
    if (aScore !== bScore) return aScore - bScore
    return aLower.length - bLower.length
  })

  return results
}
