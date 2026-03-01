<script setup lang="ts">
import { withLeadingSlash } from 'ufo'

const route = useRoute()
const { data: project } = await useAsyncData(
  () => `project:${route.path}`,
  () => queryCollection('projects').path(withLeadingSlash(route.path)).first(),
  { default: () => undefined },
)

const { translatedProperty } = useContent()

if (!project.value) {
  throw createError({ status: 404, message: 'Not Found' })
}
</script>

<template>
  <UContainer v-if="project">
    <UPageHeader
      :title="translatedProperty(project.name)"
    />
    <UCard>
      <pre>{{ project }}</pre>
    </UCard>
  </UContainer>
</template>
