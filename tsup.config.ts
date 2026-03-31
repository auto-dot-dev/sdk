import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'core/client': 'src/core/client.ts',
    'mcp/server': 'src/mcp/server.ts',
    'cli/index': 'src/cli/index.ts',
  },
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'node18',
  splitting: true,
  banner: ({ format }) => {
    // Add shebang to CLI entry
    return {}
  },
})
