import { describe, expect, it } from 'vitest'

import {
  mountSuspended,
  // mockNuxtImport,
} from '@nuxt/test-utils/runtime'

import App from '~/app.vue'

describe('auth', () => {
  // methods:
  // - /api/auth/sign-in {email, password}
  // - /api/auth/sign-up {name, email, password}

  // Examples of mounting component
  it('allows pushing to other pages', async () => {
    await navigateTo('/sign-in')
    expect(useNuxtApp().$router.currentRoute.value.path).toEqual('/sign-in')
    await nextTick()
    expect(useRoute().path).toEqual('/sign-in')
  })

  it('navigation', async () => {
    const component = await mountSuspended(App, { route: '/sign-in' })
    expect(component.html()).toContain('Log ind')
    await component.find('button').trigger('click')
  })
})
