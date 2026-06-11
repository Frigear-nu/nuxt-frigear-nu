<script setup lang="ts">
import { useAdminUpdateUser } from '~/store/mutations/admin'
import { type AdminUpdateUserSchema, adminUpdateUserSchema } from '#shared/schema/admin/user'

const { updateUser } = useAdminUpdateUser()

const props = defineProps<{
  user: AdminUpdateUserSchema & { id: number }
}>()

const $emits = defineEmits<{
  close: [{ updated: boolean, user?: { id: number } }]
}>()

const form = useTemplateRef('form')
const isOpen = ref(false)

const onSubmit = async (payload: AdminUpdateUserSchema) => {
  try {
    const updated = await updateUser({
      userId: props.user.id,
      user: payload,
    })
    useToast().add({
      title: 'User updated',
      icon: 'i-lucide-check',
      color: 'success',
    })
    $emits('close', { updated: true, user: updated as { id: number } })
  }
  catch (err) {
    useToast().add({
      title: 'Error',
      description: err && err.message ? err.message : 'Unknown error',
      color: 'error',
    })
    $emits('close', { updated: false })
  }
  finally {
    // ..
  }
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    title="Edit User"
    :ui="{
      footer: 'justify-end gap-4',
    }"
  >
    <template #body>
      <div class="flex flex-col gap-4">
        <UFormField
          label="ID"
          hint="Cannot be changed."
        >
          <UInput
            :model-value="user.id"
            class="w-full"
            disabled
          />
        </UFormField>
        <AutoForm
          ref="form"
          :schema="adminUpdateUserSchema as never"
          :initial-state="user as never"
          @submit="onSubmit"
        />
        <div>
          //TODO: Add changing membership / tickets etc... maybe in own "page"?
        </div>
      </div>
    </template>
    <template #footer>
      <UButton variant="subtle">
        Cancel
      </UButton>
      <UButton
        color="primary"
        icon="i-lucide-save"
        @click="form?.submit()"
      >
        Save
      </UButton>
    </template>
  </UModal>
</template>
