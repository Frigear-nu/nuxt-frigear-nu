<script lang="ts" setup>
// This is a kind of "layout" for pages inside /account
import { useAuth, useSiteI18n } from '#imports'

const { t, localePath } = useSiteI18n()
const { signOut } = useAuth()
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

const onSignOut = async () => {
  await signOut()

  await navigateTo('/')
}
</script>

<template>
  <div>
    <UContainer>
      <UPageHeader
        :title="headerTitle"
        :description="headerDescription"
        :ui="{
          // this is to keep the header-link section aligned
          wrapper: 'flex-row items-center justify-between gap-4',
        }"
      >
        <template #links>
          <UButton
            icon="i-lucide-log-out"
            class="mr-2 float-right"
            variant="subtle"
            @click="onSignOut"
          >
            {{ t('auth.signOut') }}
          </UButton>
        </template>
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
