import { createSharedComposable } from '@vueuse/core'

const _useCookieConsent = () => {
  const cookie = useCookie('cookie-consent')

  const isAccepted = computed(() => cookie.value === 'accepted')

  return {
    cookie,
    isAccepted,
  }
}

export const useCookieConsent = createSharedComposable(_useCookieConsent)
