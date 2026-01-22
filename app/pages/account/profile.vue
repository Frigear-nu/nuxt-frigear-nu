<script setup lang="ts">
import { useAuth, useSiteI18n, useAccount } from '#imports'
import type { FormSubmitEvent } from '@nuxt/ui'
import { updateUserProfileSchema, type UpdateUserProfileSchema } from '#shared/schema/user'

const { t } = useSiteI18n()
const { currentUser } = useAuth()
const { updateProfileDetails } = useAccount()
const toast = useToast()
const form = useTemplateRef('form')

const isSubmitting = ref(false)
const avatarEnabled = ref(false)
const displayChangeEmailDialog = ref(false)
// todo: implement file upload in future
const fileRef = ref<HTMLInputElement>()

const state = reactive<Partial<UpdateUserProfileSchema>>({
  name: '',
  avatar: undefined,
})

watch(currentUser, (newUser) => {
  if (!newUser) return

  state.name = newUser.name
}, { immediate: true })

async function onSubmit(event: FormSubmitEvent<UpdateUserProfileSchema>) {
  isSubmitting.value = true
  try {
    await updateProfileDetails(event.data)
    toast.add(formatToastSuccess('Success!', 'Your details have been updated.'))
  }
  catch (err: unknown) {
    toast.add(formatToastError(err as Error))
  }
  finally {
    isSubmitting.value = false
  }
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
    id="profile"
    ref="form"
    :schema="updateUserProfileSchema"
    :state="state"
    :loading-auto="true"
    @submit="onSubmit"
  >
    <UPageCard
      variant="subtle"
      :title="t('account.profile.title')"
    >
      <UFormField
        name="name"
        :label="t('account.profile.name.label')"
        :description="t('account.profile.name.description')"
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
        v-if="currentUser"
        name="email"
        :label="t('account.profile.email.label')"
        :description="t('account.profile.email.description')"
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <div class="flex flex-col gap-2">
          <UInput
            :model-value="currentUser.email"
            readonly
            disabled
          />
          <UButton
            trailing-icon="i-lucide-arrow-right"
            variant="subtle"
            class="flex justify-between"
            size="xs"
            @click="displayChangeEmailDialog = true"
          >
            {{ $t('account.profile.email.button.change') }}
          </UButton>
        </div>
      </UFormField>
      <USeparator v-show="avatarEnabled" />
      <UFormField
        v-show="avatarEnabled"
        name="avatar"
        :label="t('account.profile.avatar.label')"
        :description="t('account.profile.avatar.description')"
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
        v-if="form"
        form="profile"
        :label="t('actions.save')"
        color="neutral"
        size="xl"
        type="submit"
        class="w-fit lg:ms-auto"
        :loading="form.loading"
        icon="i-lucide-save"
      />
    </UPageCard>
    <AccountChangeEmailModal v-model:open="displayChangeEmailDialog" />
  </UForm>
</template>
