<script lang="ts" setup>
import { useIntervalFn } from '@vueuse/core'

defineEmits<{
  close: []
}>()

const isOpen = ref(false)

const { data, refresh, status } = useFetch('/api/account/id-code')

const idString = computed(() => data.value?.idCode || '')
const expiresInSecondsInitial = computed(() => data.value?.expiresIn)

const expiresInSeconds = ref<number | undefined>()

watch(data, () => {
  expiresInSeconds.value = expiresInSecondsInitial.value
}, { immediate: true })

const isRefreshing = ref(false)

useIntervalFn(async () => {
  if (expiresInSecondsInitial.value === undefined || typeof expiresInSeconds.value !== 'number') return
  if (expiresInSeconds.value <= 0) {
    if (isRefreshing.value) return
    isRefreshing.value = true
    try {
      await refresh()
    } finally {
      isRefreshing.value = false
    }
    return
  }

  expiresInSeconds.value -= 1
}, 1000)
  }

  expiresInSeconds.value -= 1
}, 1000)
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :title="$t('account.identificationCode.title')"
    :ui="{
      footer: 'justify-end gap-4',
    }"
  >
    <template #body>
      <ClientOnly>
        <div
          v-if="idString"
          class="flex flex-col gap-2"
        >
          <LazyQrcode
            :value="`urn:frigear:id:${idString || 'undefined'}`"
          />
          <div class="flex justify-center">
            <UBadge
              color="warning"
              size="xl"
              class="text-2xl font-bold"
            >
              {{ $t('common.expiresIn', { time: expiresInSeconds }) }}
            </UBadge>
          </div>
        </div>
        <UEmpty v-else>
          <template #description>
            <UIcon
              name="i-lucide-refresh-cw"
              class="animate animate-spin"
            />
          </template>
        </UEmpty>
      </ClientOnly>
    </template>
    <template #footer>
      <UButton
        icon="i-lucide-refresh-cw"
        :loading="status === 'pending'"
        :disabled="status ==='pending'"
        @click="refresh()"
      >
        {{ $t('common.refresh') }}
      </UButton>
      <UButton
        variant="subtle"
        icon="i-lucide-x"
        @click="$emit('close')"
      >
        {{ $t('common.close') }}
      </UButton>
    </template>
  </UModal>
</template>
