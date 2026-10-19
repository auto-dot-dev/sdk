/**
 * GET /build/{vin} answers the OpenAPI spec leaves out: the 207 partial answer and `missing[]` on a 200.
 * Hand-maintained from apis types/responses/build.vin.ts and the docs.auto.dev reference (auto-dot-dev/sdk#14).
 */

import type { Build, BuildResponse as GeneratedBuildResponse } from './types.generated'

export type { Build }

/** The 200. `missing` is present only when a field below is absent for this VIN; `build` is unchanged. */
export interface BuildResponse extends GeneratedBuildResponse {
  missing?: MissingField[]
}

/** A build field no source held for this VIN; a base vehicle's options are never one. */
export interface MissingField {
  field: 'interiorColor' | 'exteriorColor' | 'options'
  /** `not_yet_available` when the model year is ahead of the catalog; else no source held it for this VIN. */
  reason: 'no_vin_record' | 'not_yet_available'
}

/** Why there is no build for a VIN. Only `not_yet_available` is worth asking about again. */
export type BuildMissReason =
  | 'no_build_record'
  | 'not_yet_available'
  | 'invalid_vin'
  | 'market_not_covered'
  | 'class_not_covered'

/**
 * The 207 Multi-Status partial answer: a car we can name but no record builds. Not an error, not billed.
 * Most HTTP clients treat a 207 as ok, so branch on `build === null` (see `isPartialBuild`) before reading `build`.
 */
export interface BuildPartialResponse {
  /** What a decoder said about this VIN. `msrp` only when the catalog lists one style. */
  vehicle: { vin: string; year: number; make: string; model: string; trim?: string; body?: string; msrp?: number }
  build: null
  /** What the matched style ships with; null when no style is known or the miss is coverage. */
  catalog: BuildCatalog | null
  reason: BuildMissReason
  retryable: boolean
}

/** The style-level catalog on a 207: not VIN-specific, never a fabricated build. */
export interface BuildCatalog {
  vinSpecific: false
  styles: BuildCatalogStyle[]
  standardEquipment: string[]
  availableOptions: BuildCatalogOption[]
  exteriorColors: BuildCatalogColor[]
  interiorColors: BuildCatalogColor[]
}

export interface BuildCatalogStyle {
  styleId: string
  name: string
  trim?: string
  confidence?: number
  msrp?: number
}

/** `code` is null when the option name has no manufacturer code in the dictionary. */
export interface BuildCatalogOption {
  code: string | null
  name: string
}

export interface BuildCatalogColor {
  name: string
  colorCode?: string
}

/** What `build(vin)` resolves with: the 200 or the 207. */
export type BuildResult = BuildResponse | BuildPartialResponse

export const isPartialBuild = (result: BuildResult): result is BuildPartialResponse => result.build === null
