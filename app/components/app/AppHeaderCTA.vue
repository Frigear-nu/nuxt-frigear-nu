<script lang="ts" setup>
import { useSiteI18n } from '#imports'

const { t } = useSiteI18n()

const user = useSupabaseUser()
</script>

<template>
  <UButton
    v-if="user"
    to="/account"
    trailing-icon="i-lucide-layout-dashboard"
  >
    Dashboard
  </UButton>
  <UButton
    v-else
    :label="t('Sign In') || 'Logg Ind'"
    to="/sign-in"
    trailing-icon="i-lucide-lock"
  />
</template>
