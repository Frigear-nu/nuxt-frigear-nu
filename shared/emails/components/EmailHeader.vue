<script setup lang="ts">
import { Section, Container, Img } from '@vue-email/components'

interface Props {
  logoUrl?: string
}

withDefaults(defineProps<Props>(), {
  logoUrl: '/logo.png',
})
</script>

<template>
  <Section class="bg-gray-100 py-5">
    <Container class="text-center">
      <Img
        :src="logoUrl"
        alt="Company Logo"
        width="150"
        class="mx-auto block"
      />
    </Container>
  </Section>
</template>
