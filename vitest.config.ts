/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config'

export default getViteConfig({
  test: {
    passWithNoTests: true,
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['test/unit/**/*.test.ts', 'test/content/**/*.test.ts'],
          env: { TZ: 'UTC' },
        },
      },
      {
        extends: true,
        test: {
          name: 'dist',
          include: ['test/dist/**/*.test.ts'],
          env: { TZ: 'UTC' },
        },
      },
    ],
  },
})
