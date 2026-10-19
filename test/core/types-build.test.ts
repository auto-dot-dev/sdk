import { describe, expect, expectTypeOf, it, vi } from 'vitest'
import {
  AutoDev,
  isPartialBuild,
  type BuildPartialResponse,
  type BuildResponse,
  type BuildResult,
} from '../../src/index'

describe('build() result types', () => {
  it('resolves with the 200 or the 207 shape', async () => {
    const sdk = new AutoDev({ apiKey: 'ad_sk_test123' })
    expectTypeOf(sdk.build('1HGCM82633A004352')).resolves.toHaveProperty('data').toEqualTypeOf<BuildResult>()
    expectTypeOf<BuildResponse['missing']>().toEqualTypeOf<
      | { field: 'interiorColor' | 'exteriorColor' | 'options'; reason: 'no_vin_record' | 'not_yet_available' }[]
      | undefined
    >()
    expectTypeOf<BuildPartialResponse['build']>().toEqualTypeOf<null>()
  })

  it('isPartialBuild narrows a 207 so callers never read a null build', async () => {
    const partial: BuildPartialResponse = {
      vehicle: { vin: 'WP1AA2A58JLB02099', year: 2018, make: 'Porsche', model: 'Cayenne' },
      build: null,
      catalog: {
        vinSpecific: false,
        styles: [],
        standardEquipment: [],
        availableOptions: [{ code: null, name: 'Panoramic Roof' }],
        exteriorColors: [],
        interiorColors: [],
      },
      reason: 'no_build_record',
      retryable: false,
    }
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify(partial), { status: 207, headers: { 'content-type': 'application/json' } }),
      )

    const { data } = await new AutoDev({ apiKey: 'ad_sk_test123' }).build('WP1AA2A58JLB02099')

    expect(isPartialBuild(data)).toBe(true)
    if (isPartialBuild(data)) {
      expectTypeOf(data.catalog).toEqualTypeOf<BuildPartialResponse['catalog']>()
      expect(data.reason).toBe('no_build_record')
    } else {
      expectTypeOf(data.build.vin).toBeString()
    }
    fetchSpy.mockRestore()
  })
})
