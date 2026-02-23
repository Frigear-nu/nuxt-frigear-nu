<script setup lang="ts">
import type { CardProps } from '@nuxt/ui'
import { useIntervalFn } from '@vueuse/core'
import { vElementHover } from '@vueuse/components'

type Item = {
  title: string
  description?: string
  tags: string[]
  image?: string
}

const props = withDefaults(defineProps<{
  items: Item[]
  reversed?: boolean
  play?: boolean
  playInterval?: number
  defaultImage?: string
} & Pick<CardProps, 'variant'>>(), {
  play: true,
  playInterval: 5000,
  defaultImage: 'https://plus.unsplash.com/premium_photo-1661877737564-3dfd7282efcb?q=80&w=1500&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
})

const $emits = defineEmits<{
  (e: 'select', item: Item): void
}>()

const initialLoad = ref(true)
const currentIndex = ref<number>(0)


// Ensure there is always an image - even if not provided.
const currentImageUrl = computed(() => {
  const currentItem = props.items[currentIndex.value]

  if (currentItem && currentItem?.image) {
    return currentItem.image
  }

  return props.defaultImage
})


// Carousel
const { pause, resume, isActive } = useIntervalFn(() => {
  currentIndex.value = (currentIndex.value + 1) % props.items.length
}, props.playInterval, {
  immediate: props.play,
})

const onClickItem = (item: Item, index: number) => {
  $emits('select', item)
  currentIndex.value = index
}

const onHover = (hovering: boolean): void => {
  if (hovering) pause()
  else resume()
}

//
defineExpose({ pause, resume, isActive, currentIndex })

onMounted(() => {
  initialLoad.value = false
})
</script>

<template>
  <UCard
    v-element-hover="onHover"
    :ui="{ body: 'p-0 sm:p-0' }"
    :variant="variant"
  >
    <div :class="['flex gap-0 overflow-hidden', reversed ? 'flex-row-reverse' : 'flex-row']">
      <div class="relative w-1/2 md:w-2/3 shrink-0 min-h-full">

      <Transition
          enter-active-class="transition-opacity duration-300 ease-in-out"
          leave-active-class="transition-opacity duration-300 ease-in-out"
          enter-from-class="opacity-0"
          leave-to-class="opacity-0"
        >
          <NuxtImg
            :key="currentImageUrl"
            :src="currentImageUrl"
            class="absolute inset-0 w-full h-full object-cover"
          />
        </Transition>

        <div class="absolute top-2 right-2 z-10" v-if="!initialLoad && !isActive">
          <UIcon name="i-lucide-pause" class="w-6 h-6 text-muted" />
        </div>
      </div>

      <!-- List panel -->
      <div class="flex-1 min-w-0">
        <UPageList class="gap-0 flex flex-col h-full">
          <UPageCard
            v-for="(item, index) in items"
            :key="item.title"
            :title="item.title"
            :description="item.description"
            variant="naked"
            :class="[
              'w-full p-4 rounded-none flex-1 cursor-pointer transition-colors',
              currentIndex === index ? 'bg-secondary/10' : 'hover:bg-secondary/5',
            ]"
            :ui="{
              root: currentIndex === index ? 'border-s border-s-primary border-s-4' : '',
              title: 'text-2xl font-bold',
              description: currentIndex === index ? 'text-white' : '',
            }"
            @click="onClickItem(item, index)"
          >
            <template #footer>
              <div class="flex gap-2 flex-wrap">
                <template
                  v-for="tag in item.tags"
                  :key="tag"
                >
                  <slot
                    name="tag"
                    v-bind="{ item, tag, index, isCurrent: index === currentIndex }"
                  >
                    <UBadge
                      :color="currentIndex === index ? 'primary' : 'secondary'"
                      :variant="currentIndex === index ? 'solid' : 'outline'"
                    >
                      #{{ tag }}
                    </UBadge>
                  </slot>
                </template>
              </div>
            </template>
          </UPageCard>
        </UPageList>
      </div>
    </div>
  </UCard>
</template>
