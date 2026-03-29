<script setup lang="ts">
const { hasResponded, accept, reject } = useCookieConsent()

const open = computed(() => !hasResponded.value)
</script>

<template>
  <USlideover
    v-model:open="open"
    side="bottom"
    :dismissible="false"
    :modal="false"
    :close="false"
    :ui="{
      content: 'h-[15vh] min-h-24',
      body: 'flex items-center justify-between gap-4 sm:flex-row flex-col',
    }"
  >
    <template #body>
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
    </template>
  </USlideover>
</template>
