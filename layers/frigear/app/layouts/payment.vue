<script lang="ts" setup>
import { useNuxtApp, useClientStripe } from '#imports'

const { loadStripe, stripe } = useClientStripe()
const app = useNuxtApp()

// handles the manual loading of stripe client sdk only on pages that use the "payment" layout.
if (import.meta.client) {
  onMounted(async () => {
    if (!app.$config.public.stripe.key) {
      throw new Error('Stripe public key is not defined.')
    }
    stripe.value = await loadStripe(app.$config.public.stripe.key)
  })
}
</script>

<template>
  <NuxtPage />
</template>
