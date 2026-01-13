<script lang="ts" setup>
const toast = useToast()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

async function onSignOut() {
  await supabase.auth.signOut()
  toast.add({
    title: 'You\'re signed out.',
  })
  navigateTo('/')
}
</script>

<template>
  <UContainer class="py-4">
    <UPageCard
      title="Account"
      description="An overview of your account"
    >
      <template #footer>
        <pre>{{ user }}</pre>
      </template>

      <UButton
        icon="i-lucide-log-out"
        @click="onSignOut"
      >
        Sign out
      </UButton>
    </UPageCard>
  </UContainer>
</template>
