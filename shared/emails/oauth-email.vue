<script setup lang="ts">
import {
  Container,
  Section,
  Heading,
  Text,
  Preview,
  Hr,
} from '@vue-email/components'
import EmailHeader from './components/EmailHeader.vue'
import EmailWrapper from '#shared/emails/components/EmailWrapper.vue'

defineProps<{
  subject: string
  message: string
}>()
</script>

<template>
  <EmailWrapper>
    <Preview>
      {{ subject }}
    </Preview>

    <Container class="max-w-lg mx-auto p-4">
      <Section class="bg-white rounded-lg shadow p-6">
        <EmailHeader />

        <Heading
          level="2"
          class="text-xl font-bold mb-4"
        >
          {{ subject }}
        </Heading>

        <Hr class="border-t border-gray-200 my-4" />

        <Text class="mb-4 text-gray-700">
          {{ message }}
        </Text>

        <Hr class="border-t border-gray-200 my-4" />

        <Text class="text-xs text-gray-400">
          This email was sent automatically.
        </Text>
      </Section>
    </Container>
  </EmailWrapper>
</template>
