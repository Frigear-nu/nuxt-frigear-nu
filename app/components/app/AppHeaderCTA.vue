<script lang="ts" setup>
import { useSiteI18n } from '#imports'

const { localePath } = useSiteI18n()

const { isLoggedIn } = useAuth()
</script>

<template>
  <ClientOnly>
    <AccountMenu v-if="isLoggedIn" />
    <UButton
      v-else
      :label="$t('auth.signIn')"
      :to="localePath('/sign-in')"
      trailing-icon="i-lucide-lock"
    />
    <template #fallback>
      <div :class="[isLoggedIn ? 'w-8' : 'w-23', 'h-8 animate-pulse bg-neutral-200 dark:bg-neutral-800 rounded-md']" />
    </template>
  </ClientOnly>
</template>
