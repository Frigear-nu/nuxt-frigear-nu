<script lang="ts" setup>
const toast = useToast()
const { currentUser, authMode, signOut } = useAuth()

async function onSignOut() {
  await signOut()
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
        <div class="flex flex-col">
          <div>
            <UBadge color="error">
              Auth: <b>{{ authMode.toUpperCase() }}</b>
            </UBadge>
            <pre>{{ currentUser }}</pre>
          </div>
        </div>
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
