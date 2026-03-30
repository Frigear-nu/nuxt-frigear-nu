<script lang="ts" setup>
definePageMeta({
  header: true,
  layout: 'auth',
})

const route = useRoute()
const { localePath } = useSiteI18n()

// Backward compatibility: redirect ?mode=up to the dedicated sign-up page
onMounted(() => {
  if (route.query.mode === 'up') {
    const query = route.query.redirect ? { redirect: route.query.redirect } : undefined
    navigateTo(localePath('/sign-up'), { replace: true, query })
  }
})
</script>

<template>
  <AuthCard mode="in" />
</template>
