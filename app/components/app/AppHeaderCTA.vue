<script lang="ts" setup>
import { useSiteI18n } from '#imports'

const { localePath } = useSiteI18n()

const { isLoggedIn } = useAuth()
</script>

<template>
  <UButton
    v-if="isLoggedIn"
    :to="localePath('/account')"
    trailing-icon="i-lucide-layout-dashboard"
  >
    {{ $t('auth.dashboard') }}
  </UButton>
  <UButton
    v-else
    :label="$t('auth.signIn')"
    :to="localePath('/sign-in')"
    trailing-icon="i-lucide-lock"
  />
</template>
