/**
 * Turns an OpenAPI 3 document into TypeScript source: one type per component schema plus one
 * `${Path}Params` interface per operation with query parameters. Pure; the caller writes the file.
 */

export interface OpenApiParameter {
  name: string
  in: 'path' | 'query' | 'header'
  required?: boolean
  description?: string
  schema?: JsonSchema
}

export interface OpenApiOperation {
  parameters?: OpenApiParameter[]
  responses?: Record<string, { content?: Record<string, { schema: JsonSchema }> }>
}

export interface OpenApiSpec {
  paths: Record<string, Record<string, OpenApiOperation>>
  components?: { schemas?: Record<string, JsonSchema> }
}

export type JsonSchema = {
  type?: string | string[]
  properties?: Record<string, JsonSchema>
  required?: string[]
  additionalProperties?: boolean | JsonSchema
  items?: JsonSchema
  $ref?: string
  enum?: unknown[]
  const?: unknown
  anyOf?: JsonSchema[]
  oneOf?: JsonSchema[]
  not?: JsonSchema
  description?: string
}

const INDENT = '  '

export function renderSpec(spec: OpenApiSpec): string {
  const schemas = spec.components?.schemas ?? {}

  let output = '// Auto-generated from OpenAPI spec — do not edit manually\n'
  output += '// Run: pnpm generate\n\n'
  output += '// ── Response Types ──────────────────────────────────────────────────\n\n'

  for (const [name, schema] of Object.entries(schemas)) {
    output += renderComponent(name, schema)
  }

  output += '// ── Request Parameter Types ─────────────────────────────────────────\n\n'

  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      output += renderParams(path, method, operation)
    }
  }

  output += '// ── Discovered Paths ────────────────────────────────────────────────\n'
  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const method of Object.keys(methods)) {
      output += `// ${method.toUpperCase()} ${path}\n`
    }
  }
  output += '\n'

  return output
}

/** A component becomes an interface when it is a plain object with properties; anything else is a type alias. */
export function renderComponent(name: string, schema: JsonSchema): string {
  if (schema.properties && typeof schema.additionalProperties !== 'object') {
    return `${jsDoc(schema.description, '')}export interface ${name} ${renderObjectBody(schema, '')}\n\n`
  }
  return `${jsDoc(schema.description, '')}export type ${name} = ${schemaToTs(schema, '')}\n\n`
}

/** `/listings` GET with query params → `ListingsParams`; operations without query params emit nothing. */
export function renderParams(path: string, method: string, operation: OpenApiOperation): string {
  const params = operation.parameters?.filter((p) => p.in === 'query') ?? []
  if (params.length === 0) return ''

  let out = `/** ${method.toUpperCase()} ${path} query parameters */\n`
  out += `export interface ${toPascalCase(path)}Params {\n`
  for (const param of params) {
    out += jsDoc(param.description, INDENT)
    out += `${INDENT}${propertyKey(param.name)}${param.required ? '' : '?'}: ${schemaToTs(param.schema ?? {}, INDENT)}\n`
  }
  return out + '}\n\n'
}

export function schemaToTs(schema: JsonSchema, indent: string): string {
  if (schema.$ref) return refName(schema.$ref)
  if (schema.not) return 'never'
  if (schema.const !== undefined) return literal(schema.const)
  if (schema.enum) return schema.enum.map(literal).join(' | ')
  const variants = schema.anyOf ?? schema.oneOf
  if (variants) return variants.map((v) => schemaToTs(v, indent)).join(' | ')
  if (Array.isArray(schema.type)) return schema.type.map(scalarToTs).join(' | ')
  if (schema.type === 'object' && !schema.properties && typeof schema.additionalProperties !== 'object')
    return 'Record<string, unknown>'
  if (schema.properties) return renderObjectBody(schema, indent)
  if (typeof schema.additionalProperties === 'object') {
    return `Record<string, ${schemaToTs(schema.additionalProperties, indent)}>`
  }
  if (schema.type === 'array') return `${arrayItemToTs(schema.items, indent)}[]`
  return scalarToTs(schema.type)
}

function renderObjectBody(schema: JsonSchema, indent: string): string {
  const required = new Set(schema.required ?? [])
  const inner = indent + INDENT
  let out = '{\n'
  for (const [key, prop] of Object.entries(schema.properties ?? {})) {
    out += jsDoc(prop.description, inner)
    out += `${inner}${propertyKey(key)}${required.has(key) ? '' : '?'}: ${schemaToTs(prop, inner)}\n`
  }
  return out + `${indent}}`
}

/** `#/components/schemas/Build` → `Build`. */
const refName = (ref: string): string => ref.split('/').pop() ?? 'unknown'

function arrayItemToTs(items: JsonSchema | undefined, indent: string): string {
  if (!items) return 'unknown'
  const inner = schemaToTs(items, indent)
  return inner.includes(' ') ? `(${inner})` : inner
}

/** One-line descriptions stay `/** … *\/`; multiline ones get the ` * ` prefix per line. */
function jsDoc(description: string | undefined, indent: string): string {
  if (!description) return ''
  const lines = description.replace(/\*\//g, '* /').split('\n')
  if (lines.length === 1) return `${indent}/** ${lines[0]} */\n`
  return `${indent}/**\n${lines.map((l) => `${indent} *${l ? ' ' + l : ''}`).join('\n')}\n${indent} */\n`
}

const propertyKey = (key: string): string => (/^[A-Za-z_$][\w$]*$/.test(key) ? key : literal(key))

/** A JSON literal as a TS literal type; strings single-quoted to match the repo's prettier style. */
const literal = (value: unknown): string =>
  typeof value === 'string' ? `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'` : JSON.stringify(value)

function scalarToTs(type: string | undefined): string {
  switch (type) {
    case 'integer':
    case 'number':
      return 'number'
    case 'boolean':
      return 'boolean'
    case 'string':
      return 'string'
    case 'null':
      return 'null'
    default:
      return 'unknown'
  }
}

function toPascalCase(str: string): string {
  return str
    .replace(/[{}]/g, '')
    .split(/[/\-_]/)
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('')
}
