# @auto.dev/sdk

SDK, MCP server and CLI over the auto.dev API. One client (`src/core/client.ts`), one endpoint table (`src/core/endpoints.ts`) that the SDK, the MCP tools and the CLI all read; an endpoint's `description` is the MCP tool description and the CLI help line.

## Types

- `src/core/types.generated.ts` is written by `pnpm generate` from `https://api.auto.dev/openapi`. Never edit it; change the converter in `scripts/openapi-to-ts.ts`.
- That spec documents one 200 per route. Anything the API answers besides that (the `/build` 207, `missing[]`) is hand-kept in `src/core/types.build.ts`, against the published contract in the docs.auto.dev repo, `src/v2.openapi.json`.

## Checks and release

- `pnpm format:check && pnpm typecheck && pnpm test` is CI. `pnpm test` also typechecks `test/**/*.test.ts`, so `expectTypeOf` assertions count.
- `pnpm release` bumps, tags, pushes and publishes. It runs `prepublishOnly` (docs + build) by itself. Needs `npm login` as a package owner.
