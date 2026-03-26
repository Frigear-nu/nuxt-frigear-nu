<script setup lang="ts">
interface HeroCarouselImage {
  src: string
  alt: string
}

const props = withDefaults(defineProps<{
  images: HeroCarouselImage[]
  autoplayDelay?: number
  showDots?: boolean
  showArrows?: boolean
  quality?: number
}>(), {
  autoplayDelay: 3200,
  showDots: true,
  showArrows: false,
  quality: 70,
})

const normalizedImages = computed(() =>
  props.images
    .filter((image): image is HeroCarouselImage => Boolean(image?.src))
    .slice(0, 7),
)

const hasMultipleSlides = computed(() => normalizedImages.value.length > 1)
const firstImageSrc = computed(() => normalizedImages.value[0]?.src ?? '')
</script>

<template>
  <div class="mx-auto w-full max-w-115 md:mx-0">
    <div class="gradient-linear-br-teal-purple rounded-full p-5 shadow-2xl">
      <div class="relative overflow-hidden rounded-full bg-linear-to-bl from-45% from-teal via-25% via-purple-600/10 to-transparent-700/20 dark:bg-linear-to-bl dark:from-45% from-transparent dark:via-25% dark:via-lime-600/10 to-cyan-700/20">
        <UCarousel
          v-if="normalizedImages.length"
          v-slot="{ item }"
          :items="normalizedImages"
          :loop="hasMultipleSlides"
          :dots="showDots && hasMultipleSlides"
          :arrows="showArrows && hasMultipleSlides"
          :autoplay="hasMultipleSlides ? { delay: autoplayDelay } : false"
          fade
          class="w-full"
          :ui="{
            item: 'basis-full',
            dots: 'absolute inset-x-0 bottom-4',
            controls: 'absolute inset-x-1 top-1/2 -translate-y-1/2',
          }"
          aria-label="Frigear hero image carousel"
        >
          <div class="relative">
            <NuxtImg
              :src="item.src"
              :alt="item.alt"
              width="rounded-full"
              height="rounded-full"
              format="webp"
              :quality="quality"
              sizes="(max-width: 768px) 80vw, 380px, md:max-w-115"
              :loading="item.src === firstImageSrc ? 'eager' : 'lazy'"
              class="block aspect-square w-full object-cover"
            />
            <div class="pointer-events-none absolute inset-0 gradient-linear-br-teal-purple" />
          </div>
        </UCarousel>

        <div
          v-else
          class="aspect-square w-full bg-neutral-300 dark:bg-neutral-900"
          aria-hidden="true"
        />
      </div>
    </div>
  </div>
</template>
