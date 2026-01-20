<script setup lang="ts">
import { Section, Container, Img } from '@vue-email/components'

interface Props {
  logoUrl?: string
}

withDefaults(defineProps<Props>(), {
  // this must be a hardcoded default since we cannot access runtimeconfig in the email render.
  logoUrl: 'https://nuxt.frigear.nu/logo.png',
})
</script>

<template>
  <Section class="bg-gray-100 py-5">
    <Container class="text-center">
      <Img
        :src="logoUrl"
        alt="Logo"
        width="150"
        class="mx-auto block"
      />
    </Container>
  </Section>
</template>
