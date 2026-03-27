<script lang="ts" setup>
definePageMeta({
  header: false,
  layout: 'auth',
})

const route = useRoute()

// Backward compatibility: redirect ?mode=up to the dedicated sign-up page
onMounted(() => {
  if (route.query.mode === 'up') {
    const { localePath } = useSiteI18n()
    const query = route.query.redirect ? { redirect: route.query.redirect } : undefined
    navigateTo(localePath('/sign-up'), { replace: true, query })
  }
})
</script>

<template>
  <AuthCard mode="in" />
</template>
