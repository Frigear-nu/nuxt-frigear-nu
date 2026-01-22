<script setup lang="ts">
import { useAuth, useSiteI18n } from '#imports'
import type { FormSubmitEvent } from '@nuxt/ui'
import { updateUserProfileSchema, type UpdateUserProfileSchema } from '#shared/schema/user'

const { t } = useSiteI18n()
const { currentUser } = useAuth()
const toast = useToast()

// todo: implement file upload in future
const fileRef = ref<HTMLInputElement>()

// FIXME: Move to #shared/schema when this gets implemented server side.

const state = reactive<Partial<UpdateUserProfileSchema>>({
  name: '',
  email: '',
  avatar: undefined,
})

watch(currentUser, (newUser) => {
  if (!newUser) return

  state.name = newUser.name
  state.email = newUser.email
}, { immediate: true })

async function onSubmit(event: FormSubmitEvent<UpdateUserProfileSchema>) {
  toast.add({
    title: 'Success',
    description: 'Your settings have been updated.',
    icon: 'i-lucide-check',
    color: 'success',
  })
  console.log(event.data)
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement

  if (!input.files?.length) {
    return
  }

  state.avatar = URL.createObjectURL(input.files[0]!)
  // FIXME: Add upload functionality to R2
}

function onFileClick() {
  fileRef.value?.click()
}
</script>

<template>
  <UForm
    id="settings"
    :schema="updateUserProfileSchema"
    :state="state"
    @submit="onSubmit"
  >
    <UPageCard
      variant="subtle"
      :title="t('account.settings.title')"
    >
      <UFormField
        name="name"
        :label="t('account.settings.name.label')"
        :description="t('account.settings.name.description')"
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput
          v-model="state.name"
          autocomplete="off"
        />
      </UFormField>
      <USeparator />
      <UFormField
        name="email"
        :label="t('account.settings.email.label')"
        :description="t('account.settings.email.description')"
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput
          v-model="state.email"
          type="email"
          autocomplete="off"
        />
      </UFormField>
      <USeparator />
      <UFormField
        name="avatar"
        :label="t('account.settings.avatar.label')"
        :description="t('account.settings.avatar.description')"
        class="flex max-sm:flex-col justify-between sm:items-center gap-4"
      >
        <div class="flex flex-wrap items-center gap-3">
          <UAvatar
            v-if="currentUser && currentUser.avatarUrl"
            :src="currentUser.avatarUrl"
            :alt="state.name"
            size="lg"
          />
          <UButton
            :label="t('actions.select')"
            color="neutral"
            @click="onFileClick"
          />
          <input
            ref="fileRef"
            type="file"
            class="hidden"
            accept=".jpg, .jpeg, .png, .gif"
            @change="onFileChange"
          >
        </div>
      </UFormField>
    </UPageCard>
    <UPageCard
      title=" "
      variant="naked"
      orientation="horizontal"
      class="mt-4"
    >
      <UButton
        form="settings"
        :label="t('actions.save')"
        color="neutral"
        type="submit"
        class="w-fit lg:ms-auto"
      />
    </UPageCard>
  </UForm>
</template>
