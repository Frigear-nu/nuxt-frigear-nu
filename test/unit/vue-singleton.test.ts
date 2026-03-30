import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '../..')

const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf-8'))
const lockfileText = readFileSync(resolve(root, 'pnpm-lock.yaml'), 'utf-8')

const VUE_PACKAGES = [
  'vue',
  '@vue/runtime-core',
  '@vue/runtime-dom',
  '@vue/reactivity',
  '@vue/shared',
] as const

describe('package.json', () => {
  it('nuxt is listed in dependencies', () => {
    expect(packageJson.dependencies?.nuxt).toBeDefined()
  })
})

describe('pnpm-lock.yaml (no duplicate Vue versions installed)', () => {
  it.each(VUE_PACKAGES)(
    'only one version of %s is present in the lockfile',
    (pkg) => {
      const escapedPkg = pkg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const re = new RegExp(`^  '?${escapedPkg}@(\\d[^(':]+)`, 'gm')
      const versions = new Set<string>()
      for (const m of lockfileText.matchAll(re)) {
        versions.add(m[1]!)
      }
      expect(
        versions.size,
        `expected only one version of ${pkg} in pnpm-lock.yaml but found: ${[...versions].join(', ')}`,
      ).toBe(1)
    },
  )
})
