<script setup lang="ts">
import { useSiteI18n } from '#imports'

const { t } = useSiteI18n()
</script>

<template>
  <UPageCard :title="t('account.membership.title')" />
</template>
