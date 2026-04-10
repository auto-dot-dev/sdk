# Plan: CLI Command Factory + Listings Dual-Mode

> Source PRD: https://github.com/auto-dot-dev/sdk/issues/3

## Architectural decisions

Durable decisions that apply across all phases:

- **Factory module**: `src/cli/factory.ts` — exports `makeCommand()`, owns all internal helpers (`apiGet`, `getApiKey`, `formatOutput`, `colorizeJson`, `shouldSuppressSpinner`, `getFormat`, `outputOptions`)
- **Declarations module**: `src/cli/commands.ts` — pure declarations array using `makeCommand()`, exports `buildApiCommands()`
- **Interface**: `CommandDef` with `name`, `description`, `endpoint` (string or function), optional `args`, `extraOptions`, `queryParams`
- **Default args**: When `args` is omitted, defaults to a single required VIN argument
- **Endpoint resolution**: String endpoints auto-interpolate with args (e.g., `'/vin'` + VIN arg → `/vin/${vin}`). Function endpoints receive args as parameters.
- **Optional args**: `ArgDef.optional: true` — if provided, appends to path; if omitted, uses query params only
- **Query param mapping**: `queryParams` maps camelCase option keys to API query parameter names (e.g., `{ make: 'vehicle.make' }`)

---

## Phase 1: Factory core + simple VIN commands

**User stories**: 1, 7, 8, 9

### What to build

Create `factory.ts` with the `makeCommand()` function and the `CommandDef` interface. Move `apiGet`, `getApiKey`, `formatOutput`, `colorizeJson`, `shouldSuppressSpinner`, `getFormat`, `outputOptions`, and related helpers from `commands.ts` into `factory.ts`. The factory accepts a `CommandDef`, creates a Commander command with `outputOptions` wired, default VIN argument injected, and the standard action handler (get key → spinner → fetch → format → output).

Migrate the 6 simple VIN-only commands to one-liner declarations: decode, photos, specs, build, recalls, open-recalls. These commands have no extra options or query params — just `name`, `description`, and `endpoint`.

Update existing test import paths (`formatOutput`, `shouldSuppressSpinner`, `colorizeJson`) to point to `factory.ts`.

### Acceptance criteria

- [ ] `src/cli/factory.ts` exists with `makeCommand()` exported
- [ ] `CommandDef` interface with `name`, `description`, `endpoint`, `args` (defaults to VIN)
- [ ] 6 simple commands (decode, photos, specs, build, recalls, open-recalls) declared as one-liners via `makeCommand()`
- [ ] `auto decode <vin>` works identically to before (spinner, formatting, suppression)
- [ ] All existing tests pass with updated import paths
- [ ] No TypeScript errors

---

## Phase 2: Extra options + query params

**User stories**: 1, 3, 9, 10

### What to build

Add `extraOptions` and `queryParams` support to `makeCommand()`. The factory registers extra CLI options via Commander's `.option()` and builds a `URLSearchParams` object from the `queryParams` mapping at action time.

Migrate the remaining 7 commands:
- **VIN + options**: payments, apr, tco, taxes (VIN arg + extra query params)
- **Multi-arg**: plate (state + plate → dynamic endpoint function)
- **No-arg**: usage (no arguments, no options)
- **No-arg + options**: listings (search mode only — dual-mode in Phase 3)

After this phase, all 13 commands go through the factory. The old inline command builders in `commands.ts` are fully replaced.

### Acceptance criteria

- [ ] `extraOptions` on `CommandDef` registers additional CLI flags
- [ ] `queryParams` mapping builds URLSearchParams from option values
- [ ] payments, apr, tco, taxes work with VIN + extra options
- [ ] plate works with two positional args and function endpoint
- [ ] usage works with no args
- [ ] listings works in search mode with all filter options
- [ ] All 13 commands go through `makeCommand()`
- [ ] `commands.ts` contains only declarations (no inline action handlers)
- [ ] All tests pass, no TypeScript errors

---

## Phase 3: Listings dual-mode

**User stories**: 5, 6, 11

### What to build

Add optional argument support to the factory. When an `ArgDef` has `optional: true`, the argument is registered with Commander as `[arg]` instead of `<arg>`. At action time, if the optional arg is provided, it's appended to the endpoint path. If omitted, the command uses query params for search.

Update the listings declaration to include an optional VIN argument. `auto listings <vin>` hits `/listings/${vin}` for a single vehicle lookup. `auto listings --make Toyota --limit 3` searches as before.

### Acceptance criteria

- [ ] `ArgDef.optional` supported in factory
- [ ] `auto listings 4T1C11AK7RU892944` returns single vehicle data
- [ ] `auto listings --make Toyota --year 2024 --limit 3` returns search results (existing behavior)
- [ ] `auto listings` with no args and no filters returns default search results
- [ ] All tests pass, no TypeScript errors

---

## Phase 4: Cleanup + TypeScript fixes

**User stories**: 2, 4, 12

### What to build

Remove any dead code left in `commands.ts` from the migration. Run `tsc --noEmit` and fix all TypeScript errors across the codebase. Verify the full test suite passes. Add any missing factory tests for edge cases discovered during implementation.

### Acceptance criteria

- [ ] No dead code in `commands.ts` (only declarations + `buildApiCommands()` export)
- [ ] `pnpm typecheck` passes with zero errors
- [ ] All 108+ tests pass
- [ ] Manual smoke test: run each of the 13 commands and verify output
