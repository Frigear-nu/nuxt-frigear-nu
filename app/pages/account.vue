<script lang="ts" setup>
// This is a kind of "layout" for pages inside /account
import { useSiteI18n } from '#imports'

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
      </UPageHeader>
    </UContainer>

    <UContainer class="mt-8">
      <NuxtPage />
    </UContainer>
  </div>
</template>
