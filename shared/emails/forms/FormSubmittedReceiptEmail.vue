<script setup lang="ts">
import {
  Container,
  Section,
  Preview,
  Markdown,
} from '@vue-email/components'
import EmailHeader from '../components/EmailHeader.vue'
import EmailWrapper from '#shared/emails/components/EmailWrapper.vue'

defineProps<{
  preview?: string
  markdown: string
}>()
</script>

<template>
  <EmailWrapper>
    <Preview v-if="preview">
      {{ preview }}
    </Preview>

    <Container class="max-w-lg mx-auto p-4">
      <Section class="bg-white rounded-lg shadow p-6">
        <EmailHeader />

        <Markdown :source="markdown" />
      </Section>
    </Container>
  </EmailWrapper>
</template>
