<script setup lang="ts">
import { Section, Container, Img } from '@vue-email/components'
import { computed } from 'vue'

interface Props {
  logoUrl?: string
}

const props = withDefaults(defineProps<Props>(), {
  logoUrl: '/logo.png',
})

const { app: { baseURL } } = useRuntimeConfig()
const logoWithBaseUrl = computed(() => {
  if (baseURL && !props.logoUrl.startsWith('http')) {
    return `${baseURL}${props.logoUrl}`
  }
  return props.logoUrl
})
</script>

<template>
  <Section class="bg-gray-100 py-5">
    <Container class="text-center">
      <Img
        :src="logoWithBaseUrl"
        alt="Logo"
        width="150"
        class="mx-auto block"
      />
    </Container>
  </Section>
</template>
