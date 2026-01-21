<script lang="ts" setup>
import { useSiteI18n } from '#imports'

const { localePath } = useSiteI18n()

const { isLoggedIn } = useAuth()
</script>

<template>
  <AccountMenu v-if="isLoggedIn" />
  <UButton
    v-else
    :label="$t('auth.signIn')"
    :to="localePath('/sign-in')"
    trailing-icon="i-lucide-lock"
  />
</template>
