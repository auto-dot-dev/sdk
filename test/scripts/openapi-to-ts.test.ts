import { describe, expect, it } from 'vitest'
import { type JsonSchema, type OpenApiSpec, renderSpec } from '../../scripts/openapi-to-ts'

const spec = (schemas: Record<string, JsonSchema>, paths: OpenApiSpec['paths'] = {}): OpenApiSpec => ({
  paths,
  components: { schemas },
})

describe('renderSpec', () => {
  it('emits an object schema as a TS interface with required and optional properties', () => {
    const out = renderSpec(
      spec({
        Build: {
          type: 'object',
          additionalProperties: false,
          properties: { vin: { type: 'string' }, year: { type: 'number' }, packageCode: { type: 'string' } },
          required: ['vin', 'year'],
        },
      }),
    )

    expect(out).toContain('export interface Build {\n  vin: string\n  year: number\n  packageCode?: string\n}')
    expect(out).not.toContain('"properties"')
  })

  it('resolves $ref, array items and additionalProperties maps', () => {
    const out = renderSpec(
      spec({
        BuildResponse: {
          type: 'object',
          properties: {
            build: { $ref: '#/components/schemas/Build' },
            missing: { type: 'array', items: { $ref: '#/components/schemas/MissingField' } },
            options: { type: 'object', additionalProperties: { type: 'string' } },
          },
          required: ['build', 'options'],
        },
        Options: { type: 'object', additionalProperties: { type: 'string' } },
      }),
    )

    expect(out).toContain(
      'export interface BuildResponse {\n  build: Build\n  missing?: MissingField[]\n  options: Record<string, string>\n}',
    )
    expect(out).toContain('export type Options = Record<string, string>')
  })

  it('emits enums, consts, type lists and anyOf as unions', () => {
    const out = renderSpec(
      spec({
        States: { type: 'string', enum: ['AL', 'AK'] },
        Kind: { type: 'string', const: 'data' },
        Roadside: { type: ['boolean', 'string'] },
        Cell: { anyOf: [{ type: 'string' }, { type: 'number' }, { type: 'null' }] },
        Row: {
          type: 'object',
          properties: {
            price: { type: ['number', 'null'] },
            cells: { type: 'array', items: { $ref: '#/components/schemas/Cell' } },
          },
        },
      }),
    )

    expect(out).toContain("export type States = 'AL' | 'AK'")
    expect(out).toContain("export type Kind = 'data'")
    expect(out).toContain('export type Roadside = boolean | string')
    expect(out).toContain('export type Cell = string | number | null')
    expect(out).toContain('export interface Row {\n  price?: number | null\n  cells?: Cell[]\n}')
  })

  it('keeps descriptions as JSDoc, nests inline objects, and quotes non-identifier keys', () => {
    const out = renderSpec(
      spec({
        Listing: {
          type: 'object',
          description: 'One listing',
          properties: {
            'retailListing.price': { type: 'number', description: 'Asking price in USD' },
            vehicle: { type: 'object', properties: { make: { type: 'string' } }, required: ['make'] },
          },
          required: ['vehicle'],
        },
      }),
    )

    expect(out).toContain(
      "/** One listing */\nexport interface Listing {\n  /** Asking price in USD */\n  'retailListing.price'?: number\n  vehicle: {\n    make: string\n  }\n}",
    )
  })

  it('emits a Params interface per operation with query parameters and lists every path', () => {
    const out = renderSpec(
      spec(
        {},
        {
          '/build/{vin}': { get: { parameters: [{ name: 'vin', in: 'path', required: true }] } },
          '/listings': {
            get: {
              parameters: [
                { name: 'vehicle.make', in: 'query', description: 'Make', schema: { type: 'string' } },
                { name: 'limit', in: 'query', required: true, schema: { type: 'integer' } },
              ],
            },
          },
        },
      ),
    )

    expect(out).toContain(
      "/** GET /listings query parameters */\nexport interface ListingsParams {\n  /** Make */\n  'vehicle.make'?: string\n  limit: number\n}",
    )
    expect(out).not.toContain('BuildVinParams')
    expect(out).toContain('// GET /build/{vin}\n// GET /listings\n')
  })
})
