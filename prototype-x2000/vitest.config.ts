import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/types/**',
        'src/**/*.d.ts',
        'src/cli/**',
        'src/web/**',
      ],
      // Note: Coverage thresholds are disabled while building out test suite
      // Current coverage is focused on core modules: memory, guardrails, brains, SDK
      // Once full coverage is implemented, re-enable thresholds
      // thresholds: {
      //   global: {
      //     statements: 80,
      //     branches: 80,
      //     functions: 80,
      //     lines: 80,
      //   },
      // },
    },
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
