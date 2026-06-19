<script setup lang="ts">
import { type AdminCreateUserSchema, adminCreateUserSchema } from '#shared/schema/admin/user'
import { useAdminCreateUser } from '~/store/mutations/admin'

const isOpen = ref(false)
const form = useTemplateRef('form')
const { createUser } = useAdminCreateUser()

const $emits = defineEmits<{
  close: [{ created: boolean, user?: { id: number } }]
}>()

const onSubmit = async (payload: AdminCreateUserSchema) => {
  try {
    const createdUser = await createUser(payload)
    useToast().add({
      title: 'User created',
      icon: 'i-lucide-check',
      description: JSON.stringify(createdUser, null, 2),
      color: 'success',
    })
    $emits('close', { created: true, user: createdUser as { id: number } })
  }
  catch (error) {
    // TODO: Maybe include what the server says...?
    useToast().add({
      title: 'Error',
      description: error && error.message ? error.message : 'Unknown error',
      color: 'error',
    })
    $emits('close', { created: false })
  }
  finally {
    // ...
  }
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    title="Create User"
    :ui="{
      footer: 'justify-end gap-4',
    }"
  >
    <template #body>
      <AutoForm
        ref="form"
        :schema="adminCreateUserSchema"
        @submit="onSubmit"
      />
    </template>
    <template #footer>
      <UButton
        variant="subtle"
        @click="$emit('close', { created: false })"
      >
        Cancel
      </UButton>
      <UButton @click="form?.submit()">
        Create
      </UButton>
    </template>
  </UModal>
</template>
