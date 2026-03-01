<script setup lang="ts">
const { data: projects } = await useAsyncData('all-projects', () => {
  return queryCollection('projects').all()
}, { default: () => [] })

const { translatedProperty } = useContent()
</script>

<template>
  <UContainer class="mt-8">
    <UPageHeader title="Projects" />
    <UPageGrid class="mt-4">
      <NuxtLink
        v-for="(project, index) in projects"
        :key="index"
        :to="project.path"
      >
        <UPageCard
          :title="translatedProperty(project.name)"
        >
          <template
            v-if="project.description"
            #description
          >
            <MDC :value="translatedProperty(project.description)" />
          </template>
          <NuxtImg :src="project.image" />
        </UPageCard>
      </NuxtLink>
    </UPageGrid>
  </UContainer>
</template>
