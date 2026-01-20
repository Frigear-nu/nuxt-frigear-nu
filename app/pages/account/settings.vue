<script setup lang="ts">
import { useAuth, useSiteI18n } from '#imports'
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const { t } = useSiteI18n()
const { currentUser } = useAuth()
const toast = useToast()

// todo: implement file upload in future
const fileRef = ref<HTMLInputElement>()

// FIXME: Move to #shared/schema when this gets implemented server side.
const profileSchema = z.object({
  name: z.string().min(2, 'Too short'),
  email: z.email('Invalid email'),
  avatar: z.string().optional(),
})

type ProfileSchema = z.output<typeof profileSchema>

const profile = reactive<Partial<ProfileSchema>>({
  name: '',
  email: '',
  avatar: undefined,
})

async function onSubmit(event: FormSubmitEvent<ProfileSchema>) {
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

  profile.avatar = URL.createObjectURL(input.files[0]!)
}

function onFileClick() {
  fileRef.value?.click()
}
</script>

<template>
  <UForm
    id="settings"
    :schema="profileSchema"
    :state="profile"
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
          v-model="profile.name"
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
          v-model="profile.email"
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
            :alt="profile.name"
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
