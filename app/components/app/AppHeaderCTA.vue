<script lang="ts" setup>
import { useSiteI18n } from '#imports'

const { t } = useSiteI18n()
</script>

<template>
  <UButton
    :label="t('Sign In') || 'Logg Ind'"
    to="/sign-in"
    trailing-icon="i-lucide-lock"
  />
</template>
