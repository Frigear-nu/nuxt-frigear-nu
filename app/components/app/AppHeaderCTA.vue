<script lang="ts" setup>
import { useSiteI18n } from '#imports'

const { localePath } = useSiteI18n()

const { isLoggedIn } = useAuth()
</script>

<template>
  <UButton
    v-if="isLoggedIn"
    :to="localePath('/account')"
    icon="i-lucide-user"
    variant="ghost"
    color="neutral"
  />
  <UButton
    v-else
    :label="$t('auth.signIn')"
    :to="localePath('/sign-in')"
    trailing-icon="i-lucide-lock"
  />
</template>
