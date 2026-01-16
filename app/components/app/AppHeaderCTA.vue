<script lang="ts" setup>
import { useSiteI18n } from '#imports'

const { t } = useSiteI18n()

const { isLoggedIn } = useAuth()
</script>

<template>
  <UButton
    v-if="isLoggedIn"
    to="/account"
    trailing-icon="i-lucide-layout-dashboard"
  >
    Dashboard
  </UButton>
  <UButton
    v-else
    :label="t('Sign In') || 'Log Ind'"
    to="/sign-in"
    trailing-icon="i-lucide-lock"
  />
</template>
