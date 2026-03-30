<script lang="ts" setup>
import type { PageCardProps } from '@nuxt/ui'

import useFormAsAdmin from '~/composables/admin/useFormAsAdmin'
import { withLeadingSlash } from 'ufo'
import { upperFirst } from 'scule'

const { localePath } = useSiteI18n()
const { data: form } = await useFormAsAdmin()

const formDetailTitle = computed(() => {
  if (!form.value) return 'n/a'
  return form.value.name
})

// features
const isResubmittable = computed(() => typeof form.value?.resubmittable === 'object')
const isDeliverable = computed(() => form.value?.delivery?.length > 0 || false)

const formFeatures = computed(() => {
  const features = []
  if (toValue(isResubmittable)) features.push('resubmittable')
  if (toValue(isDeliverable)) features.push('deliverable')

  return features
})

// Actions
const actions = computed<PageCardProps[]>(() => {
  return [
    {
      title: 'Submissions',
      description: 'View all submissions for this form',
      to: localePath(`/admin/forms${withLeadingSlash(form.value.path)}/submissions`),
    },
  ]
})
</script>

<template>
  <UContainer>
    <UPageHeader :title="formDetailTitle" />
    <div class="flex gap-4 flex-col mt-4">
      <UPageList>
        <UPageCard
          title="Features"
          :ui="{
            body: 'flex flex-col gap-2',
            description: 'flex gap-4',
          }"
        >
          <template #description>
            <UBadge
              v-for="feature in formFeatures"
              :key="feature"
              :label="upperFirst(feature)"
              variant="outline"
            />
          </template>
        </UPageCard>
      </UPageList>
      <UPageGrid class="lg:grid-cols-2">
        <UPageCard
          v-for="card in actions"
          :key="card.title"
          v-bind="card"
          orientation="horizontal"
        >
          <template #default>
            <div class="flex justify-between items-center gap-4">
              <div class="hidden lg:block" />
              <UButton
                :to="card.to"
                size="xl"
                trailing-icon="i-lucide-arrow-right"
                class="justify-between gap-4 lg:w-auto hidden lg:flex"
                variant="outline"
                color="neutral"
              >
                {{ $t('actions.view') }}
              </UButton>
            </div>
          </template>
        </UPageCard>
      </UPageGrid>
    </div>
  </UContainer>
</template>
