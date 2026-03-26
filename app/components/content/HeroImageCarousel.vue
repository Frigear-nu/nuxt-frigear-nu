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
  autoplayDelay: 4200,
  showDots: true,
  showArrows: false,
  quality: 70,
})

const normalizedImages = computed(() =>
  props.images
    .filter((image): image is HeroCarouselImage => Boolean(image?.src))
    .slice(0, 5),
)

const hasMultipleSlides = computed(() => normalizedImages.value.length > 1)
const firstImageSrc = computed(() => normalizedImages.value[0]?.src ?? '')
</script>

<template>
  <div class="mx-auto w-full max-w-95 md:mx-0">
    <div class="rounded-full bg-neutral-200 p-4 dark:bg-neutral-800">
      <div class="relative overflow-hidden rounded-full ring-2 ring-white/80 shadow-2xl dark:ring-white/70">
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
            controls: 'absolute inset-x-3 top-1/2 -translate-y-1/2',
          }"
          aria-label="Frigear hero image carousel"
        >
          <div class="relative">
            <NuxtImg
              :src="item.src"
              :alt="item.alt"
              width="760"
              height="760"
              format="webp"
              :quality="quality"
              sizes="(max-width: 768px) 80vw, 380px"
              :loading="item.src === firstImageSrc ? 'eager' : 'lazy'"
              class="block aspect-square w-full object-cover"
            />
            <div class="pointer-events-none absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-primary/10" />
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
