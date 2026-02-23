<script setup lang="ts">
import ListCarousel from '~/components/ListCarousel.vue'

const featuredProducts = ref([
  {
    title: 'One',
    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quod, quia.',
    tags: ['nuxt', 'vue', 'typescript'],
  },
  {
    title: 'Two',
    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quod, quia.',
    tags: ['nuxt', 'vue', 'typescript'],
    image: 'https://madewithnetworkfra.fra1.digitaloceanspaces.com/spatie-space-production/31972/vuetify-snips.jpg',
  },
  {
    title: 'Three',
    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quod, quia.',
    tags: ['nuxt', 'vue', 'typescript'],
  },
])
</script>

<template>
      <ListCarousel :items="featuredProducts">
        <template #tag="{ tag, isCurrent }">
          <NuxtLink :to="`/tags/${tag}`">
            <UBadge
              :color="isCurrent ? 'primary' : 'secondary'"
              :variant="isCurrent ? 'solid' : 'outline'"
            >
              #{{ tag }}
            </UBadge>
          </NuxtLink>
        </template>
      </ListCarousel>
</template>
