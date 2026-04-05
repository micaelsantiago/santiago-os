import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: [
        'src/modules/**/types/**',
        'src/modules/**/actions/**',
        'src/lib/**',
      ],
      exclude: [
        'src/lib/supabase/database.types.ts',
        'src/lib/supabase/middleware.ts',
        'src/lib/supabase/client.ts',
        'src/lib/supabase/server.ts',
        'src/lib/supabase/get-user.ts',
      ],
      thresholds: {
        'src/modules/**/types/*.ts': { lines: 100 },
        'src/modules/**/actions/*.ts': { lines: 80 },
        'src/lib/**/*.ts': { lines: 80 },
      },
    },
  },
})
