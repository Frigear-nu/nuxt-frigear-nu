import { describe, it } from 'vitest'

// import {
//   mountSuspended,
//   // mockNuxtImport,
// } from '@nuxt/test-utils/runtime'
//
// import App from '~/app.vue'

describe('routing', () => {
  it('defaults to index page', async ({ expect }) => {
    expect(useRoute().matched[0]!.meta).toMatchInlineSnapshot(`
      {
        "layout": "page",
      }
    `)
  })

  it('allows pushing to other pages', async ({ expect }) => {
    await navigateTo('/sign-in')
    expect(useNuxtApp().$router.currentRoute.value.path).toEqual('/sign-in')
    await nextTick()
    expect(useRoute().path).toEqual('/sign-in')
  })
})
