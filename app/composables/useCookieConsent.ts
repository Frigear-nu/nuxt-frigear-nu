import { createSharedComposable } from '@vueuse/core'

const _useCookieConsent = () => {
  const cookie = useCookie('cookie-consent')

  const isAccepted = computed(() => cookie.value === 'accepted')
  const isRejected = computed(() => cookie.value === 'rejected')
  const hasResponded = computed(() => !!cookie.value)

  function accept() {
    cookie.value = 'accepted'
  }

  function reject() {
    cookie.value = 'rejected'
  }

  return {
    cookie,
    isAccepted,
    isRejected,
    hasResponded,
    accept,
    reject,
  }
}

export const useCookieConsent = createSharedComposable(_useCookieConsent)
