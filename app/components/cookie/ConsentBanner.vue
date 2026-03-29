<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'

const { hasResponded, accept, reject } = useCookieConsent()

const open = computed(() => !hasResponded.value)

const { y } = useWindowScroll()
const scrolledDown = computed(() => y.value > 80)
const isManuallyExpanded = ref(false)
const collapsed = computed(() => scrolledDown.value && !isManuallyExpanded.value)

watch(scrolledDown, (isDown) => {
  if (!isDown) isManuallyExpanded.value = false
})
</script>

<template>
  <!-- FAB bubble (collapsed when scrolled) -->
  <Transition name="cookie-fab">
    <span
      v-if="open && collapsed"
      class="fixed bottom-4 right-4 z-50"
    >
      <UButton
        class="size-14 rounded-full shadow-lg"
        icon="i-lucide-cookie"
        size="xl"
        variant="soft"
        color="primary"
        :aria-label="$t('cookieConsent.expand')"
        data-testid="cookie-consent-fab"
        @click="isManuallyExpanded = true"
      />
    </span>
  </Transition>

  <!-- Full expanded banner -->
  <Transition name="cookie-slide">
    <div
      v-if="open && !collapsed"
      class="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
      data-testid="cookie-consent-banner"
    >
      <div class="relative w-[92vw] rounded-t-2xl border border-primary/70 bg-(--ui-bg) shadow-xl">
        <!-- Cookie icon badge top-left -->
        <div class="absolute -top-3.5 left-4 rounded-full border border-primary/70 bg-(--ui-bg) p-1">
          <UIcon
            name="i-lucide-cookie"
            class="size-5 text-primary"
          />
        </div>

        <!-- Banner body -->
        <div class="flex flex-col items-center justify-between gap-4 p-4 pt-5 sm:flex-row">
          <p class="text-sm text-muted">
            {{ $t('cookieConsent.description') }}
          </p>
          <div class="flex shrink-0 gap-2">
            <UButton
              color="neutral"
              variant="outline"
              :label="$t('cookieConsent.reject')"
              @click="reject"
            />
            <UButton
              color="primary"
              :label="$t('cookieConsent.accept')"
              @click="accept"
            />
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Full banner: slide up from bottom */
.cookie-slide-enter-active,
.cookie-slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.cookie-slide-enter-from,
.cookie-slide-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* FAB bubble */
.cookie-fab-enter-active,
.cookie-fab-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.cookie-fab-enter-from,
.cookie-fab-leave-to {
  opacity: 0;
  transform: scale(0.5);
}
</style>
