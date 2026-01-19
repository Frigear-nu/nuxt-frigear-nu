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
    {{ t('auth.dashboard') }}
  </UButton>
  <UButton
    v-else
    :label="t('auth.signIn')"
    to="/sign-in"
    trailing-icon="i-lucide-lock"
  />
</template>
