import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'
import { fileURLToPath } from 'node:url'

const sharedAlias = {
  '#shared': fileURLToPath(new URL('./shared', import.meta.url)),
  '~/composables/useSteppedForm': fileURLToPath(new URL('./app/composables/useSteppedForm', import.meta.url)),
}

export default defineConfig({
  test: {
    projects: [
      {
        resolve: { alias: sharedAlias },
        test: {
          name: 'unit',
          include: ['test/unit/*.{test,spec}.ts'],
          environment: 'node',
          globals: true,
        },
      },
      {
        test: {
          name: 'e2e',
          include: ['test/e2e/*.{test,spec}.ts'],
          environment: 'node',
        },
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/*.{test,spec}.ts'],
          environment: 'nuxt',
        },
      }),
    ],
  },
})
