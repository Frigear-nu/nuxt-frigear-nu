import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

const ignores = ['./app/components/content/TypewriterEffect.vue']

export default createConfigForNuxt({
  features: {
    tooling: true,
    stylistic: true,
  },
}, {
  ignores,
}).append(
  {
    rules: {
      'vue/multi-word-component-names': 'off',
    },
    ignores,
  },
)
