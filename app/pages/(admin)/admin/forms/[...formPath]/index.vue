<script lang="ts" setup>
import { withLeadingSlash } from 'ufo'
import type { FormCollectionItem } from '@nuxt/content'

const route = useRoute()

const formPath = computed(() => Array.isArray(route.params.formPath) ? route.params.formPath.join('/') : route.params.formPath)

const { data: form } = await useAsyncData<FormCollectionItem>(() => `admin:forms:${toValue(formPath)}`, async () => {
  return queryCollection('forms').path(withLeadingSlash(toValue(formPath))).first()
})

if (!form.value) {
  throw createError({
    status: 404,
    message: 'Form not found',
  })
}

const formFeatures = computed(() => {
  const isResubmittable = form.value?.resubmittable?.length > 0 || false
  const isDeliverable = form.value?.delivery?.length > 0 || false

  const features = []
  if (isResubmittable) features.push('resubmittable')
  if (isDeliverable) features.push('deliverable')

  return features
})
</script>

<template>
  <UContainer>
    <UPageHeader title="Form Details" />
    <UPageList>
      <UPageCard>
        <UBadge
          v-for="feature in formFeatures"
          :key="feature"
          :label="feature"
        />
      </UPageCard>
    </UPageList>
  </UContainer>
</template>
