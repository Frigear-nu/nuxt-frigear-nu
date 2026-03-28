<script setup lang="ts">
import * as Sentry from '@sentry/nuxt'
import { useRoute } from '#imports'

type HeroCarouselImage = {
  src: string
  alt?: string
}

type HeroCarouselFormat = | 'webp'
  | 'avif'
  | 'jpeg'
  | 'jpg'
  | 'png'
  | 'gif'
  | 'svg'

const props = withDefaults(defineProps<{
  images: HeroCarouselImage[]
  width?: number
  height?: number
  sizes?: string
  quality?: number
  format?: HeroCarouselFormat
  densities?: string
  autoplay?: boolean
  autoplayDelay?: number
  loop?: boolean
  fade?: boolean
  showArrows?: boolean
  showDots?: boolean
  overlay?: boolean
  overlayClass?: string
  ariaLabel?: string
  maxWidthClass?: string
  frameClass?: string
  surfaceClass?: string
  prevIcon?: string
  nextIcon?: string
}>(), {
  width: 1200,
  height: 1200,
  sizes: '90vw md:460px',
  quality: 82,
  format: 'webp',
  densities: 'x1 x2',
  autoplay: true,
  autoplayDelay: 3200,
  loop: true,
  fade: true,
  showArrows: false,
  showDots: true,
  overlay: true,
  overlayClass: '',
  ariaLabel: 'Frigear hero image carousel',
  maxWidthClass: 'max-w-115',
  frameClass: 'hero-carousel-frame-fancy',
  surfaceClass: 'hero-carousel-surface',
  prevIcon: 'i-lucide-chevron-left',
  nextIcon: 'i-lucide-chevron-right',
})

const normalizedImages = computed(() =>
  props.images
    .filter((image): image is HeroCarouselImage =>
      Boolean(image && typeof image.src === 'string' && image.src.trim()),
    )
    .map(image => ({
      src: image.src,
      alt: image.alt ?? '',
    })),
)

const hasMultipleSlides = computed(() => normalizedImages.value.length > 1)
const firstImageSrc = computed(() => normalizedImages.value[0]?.src ?? '')

const carouselAutoplay = computed(() => {
  if (!props.autoplay || !hasMultipleSlides.value) {
    return false
  }

  return { delay: props.autoplayDelay }
})

const carouselLoop = computed(() => props.loop && hasMultipleSlides.value)
const carouselArrows = computed(() => props.showArrows && hasMultipleSlides.value)
const carouselDots = computed(() => props.showDots && hasMultipleSlides.value)

const failedImages = ref<Record<string, boolean>>({})
const route = useRoute()

const activeImages = computed(() =>
  normalizedImages.value.filter(image => !failedImages.value[image.src]),
)

const handleImageError = (src: string) => {
  failedImages.value[src] = true
  console.warn(`Image failed to load: ${src}`)

  try {
    if (Sentry && typeof Sentry.captureException === 'function') {
      Sentry.captureException(new Error(`HeroImageCarousel image load failed: ${src}`), {
        extra: {
          src,
          page: route.fullPath,
          component: 'HeroImageCarousel',
        },
      })
    }
  }
  catch (sentryError) {
    console.warn('Sentry capture failed', sentryError)
  }
}

const arrowButtonProps = {
  size: 'md',
  color: 'secondary',
  variant: 'link',
  class: 'hero-carousel-arrow ',
} as const

const overlayClasses = computed(() => [
  'hero-carousel-glass',
  props.overlayClass,
])

const carouselUi = {
  item: 'basis-full',
  controls: 'pointer-events-none absolute inset-0 z-20',
  prev: 'pointer-events-auto absolute start-2 top-1/2 -translate-y-1/2',
  next: 'pointer-events-auto absolute end-2 top-1/2 -translate-y-1/2',
  dots: 'absolute inset-x-0 bottom-4',
} as const
</script>

<template>
  <div
    class="mx-auto w-full md:mx-0"
    :class="maxWidthClass"
  >
    <div :class="frameClass">
      <UCarousel
        v-if="activeImages.length"
        v-slot="{ item }"
        :items="activeImages"
        :loop="carouselLoop"
        :dots="carouselDots"
        :arrows="carouselArrows"
        :autoplay="carouselAutoplay"
        :fade="fade"
        :prev="arrowButtonProps"
        :next="arrowButtonProps"
        :prev-icon="prevIcon"
        :next-icon="nextIcon"
        :ui="carouselUi"
        class="relative w-full"
        :aria-label="ariaLabel"
      >
        <div :class="surfaceClass">
          <NuxtImg
            v-if="!failedImages[item.src]"
            :src="item.src"
            :alt="item.alt"
            :width="width"
            :height="height"
            :format="format"
            :densities="densities"
            :quality="quality"
            :sizes="sizes"
            :loading="item.src === firstImageSrc ? 'eager' : 'lazy'"
            class="block aspect-square w-full object-cover"
            @error="handleImageError(item.src)"
          />

          <div
            v-else
            class="absolute inset-0 bg-neutral-300 dark:bg-neutral-700 flex items-center justify-center rounded-full"
            role="img"
            :aria-label="`Failed to load: ${item.alt || 'image'}`"
          >
            <div class="flex flex-col items-center gap-2">
              <svg
                class="w-8 h-8 text-neutral-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p class="text-xs text-neutral-600 dark:text-neutral-400 text-center">
                Image failed to load
              </p>
            </div>
          </div>

          <div
            v-if="overlay"
            class="pointer-events-none absolute inset-0"
            :class="overlayClasses"
          />
        </div>
      </UCarousel>
    </div>
  </div>
</template>
