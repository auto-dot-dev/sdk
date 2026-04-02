import { describe, it, expect } from 'vitest'
import { listDocs, getDoc, searchDocs } from '../../src/docs/search'

describe('Docs Search', () => {
  it('listDocs returns array of doc names', () => {
    const docs = listDocs()
    expect(Array.isArray(docs)).toBe(true)
  })

  it('getDoc returns null for nonexistent doc', () => {
    expect(getDoc('nonexistent-doc-xyz')).toBeNull()
  })

  it('searchDocs returns empty array for nonexistent term', () => {
    expect(searchDocs('zzzznonexistent')).toEqual([])
  })
})
