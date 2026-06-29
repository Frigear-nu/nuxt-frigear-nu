<script lang="ts" setup>
import { useSiteI18n, useAuth } from '#imports'

const { currentUser } = useAuth()
const { t, localePath } = useSiteI18n()
const route = useRoute()

const basePath = 'account'

const isAccountRoot = computed(() => route.path.endsWith(`/${basePath}`))

const headerTitle = computed(() => {
  const lastPath = route.path.split('/').pop()
  if (toValue(isAccountRoot) || !lastPath || lastPath === basePath) {
    return t(`${basePath}.title`)
  }

  return t(`${basePath}.${lastPath}.title`)
})

const headerDescription = computed(() => {
  const lastPath = route.path.split('/').pop()
  if (toValue(isAccountRoot) || !lastPath || lastPath === basePath) {
    return undefined
  }

  return t(`${basePath}.${lastPath}.description`)
})
</script>

<template>
  <div>
    <UContainer>
      <UPageHeader
        :title="headerTitle"
        :description="headerDescription"
        :ui="{
          wrapper: 'flex-row items-center justify-between gap-4',
          description: 'mt-2',
        }"
      >
        <template
          #default
        >
          <UButton
            v-if="!isAccountRoot"
            variant="link"
            icon="i-lucide-arrow-left"
            :to="localePath(`/${basePath}`)"
            :label="`${t('actions.backTo')} ${t('account.title')}`"
            class="-ml-3 mt-2"
          />
        </template>

        <template #links>
          <div
            v-if="currentUser"
            class="flex flex-col"
          >
            <div class="text-sm text-muted">
              {{ $t('auth.signedInAs') }}:
            </div>
            <div class="text-primary">
              {{ currentUser.email }}
            </div>
            <div class="flex justify-end mt-1">
              <UBadge
                variant="soft"
              >
                Frigear ID: <code>{{ currentUser.id }}</code>
              </UBadge>
            </div>
          </div>
        </template>
      </UPageHeader>
    </UContainer>

    <UContainer>
      <UPageBody>
        <ClientOnly>
          <NuxtPage />
        </ClientOnly>
      </UPageBody>
    </UContainer>
  </div>
</template>
