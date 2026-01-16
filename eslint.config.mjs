import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  features: {
    tooling: true,
    stylistic: true,
  },
}, {
}).append(
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      'unicorn/throw-new-error': 'off',
    },
  },
)
