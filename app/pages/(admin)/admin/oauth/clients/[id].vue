<script setup lang="ts">
interface OAuthClient {
  id: string
  name: string
  websiteUrl: string
  previewUrlPattern: string | null
  callbackUrl: string
  isActive: boolean
  createdAt: string
}

useSeoMeta({
  title: 'Edit Client',
  description: 'Edit OAuth client settings.',
})

definePageMeta({
  middleware: 'auth',
})

// Redirect non-admins to dashboard
const { user } = useUserSession()
if (user.value?.role !== 'admin') {
  await navigateTo('/')
}

const route = useRoute()
const clientId = route.params.id as string

const { data: client, refresh } = await useFetch<OAuthClient>(`/api/admin/oauth/clients/${clientId}`)

const editForm = ref({
  name: '',
  websiteUrl: '',
  previewUrlPattern: '',
  isActive: true,
})

const toast = useToast()
const saving = ref(false)
const showSecretModal = ref(false)
const newSecret = ref<string | null>(null)
const regenerating = ref(false)
const copiedField = ref<string | null>(null)
const ssoUrl = useRequestURL().origin

// Form validation errors
const errors = ref<{ name?: string, websiteUrl?: string, previewUrlPattern?: string }>({})

function validateUrl(url: string, label: string): string | undefined {
  try {
    const parsed = new URL(url)
    if (parsed.pathname !== '/' && parsed.pathname !== '') {
      return `${label} should not include a path`
    }
  }
  catch {
    return 'Invalid URL format'
  }
  // eslint-disable-next-line regexp/no-unused-capturing-group
  if (!url.startsWith('https://') && !/^http:\/\/localhost(:\d+)?($|\/)/.test(url)) {
    return 'Must use HTTPS (http://localhost allowed for development)'
  }
}

function validateForm(): boolean {
  const errs: typeof errors.value = {}

  if (!editForm.value.name.trim()) {
    errs.name = 'Client name is required'
  }

  if (!editForm.value.websiteUrl.trim()) {
    errs.websiteUrl = 'Website URL is required'
  }
  else {
    const urlError = validateUrl(editForm.value.websiteUrl, 'Website URL')
    if (urlError) errs.websiteUrl = urlError
  }

  if (editForm.value.previewUrlPattern.trim()) {
    const pattern = editForm.value.previewUrlPattern
    const testUrl = pattern.replace(/\*/g, 'placeholder')
    const patternError = validateUrl(testUrl, 'Preview URL pattern')
    if (patternError) errs.previewUrlPattern = patternError
  }

  errors.value = errs
  return Object.keys(errs).length === 0
}

// Initialize form when client loads
watch(client, (value) => {
  if (value) {
    editForm.value = {
      name: value.name,
      websiteUrl: value.websiteUrl,
      previewUrlPattern: value.previewUrlPattern || '',
      isActive: value.isActive,
    }
  }
}, { immediate: true })

async function saveClient() {
  if (!validateForm()) return

  saving.value = true
  try {
    await $fetch(`/api/admin/oauth/clients/${clientId}`, {
      method: 'PATCH',
      body: {
        name: editForm.value.name,
        websiteUrl: editForm.value.websiteUrl,
        previewUrlPattern: editForm.value.previewUrlPattern || null,
        isActive: editForm.value.isActive,
      },
    })

    await refresh()
    toast.add({
      title: 'Client updated',
      description: 'Your changes have been saved successfully.',
      color: 'success',
      icon: 'i-heroicons-check-circle',
    })
  }
  catch (error: unknown) {
    const message = error?.data?.message || 'Something went wrong while saving the client.'
    // Map server errors to form fields
    if (message.toLowerCase().includes('url')) {
      errors.value = { websiteUrl: message }
    }
    else if (message.toLowerCase().includes('name')) {
      errors.value = { name: message }
    }
    else {
      toast.add({
        title: 'Failed to save',
        description: message,
        color: 'error',
        icon: 'i-heroicons-exclamation-circle',
      })
    }
  }
  finally {
    saving.value = false
  }
}

const confirm = useConfirmDialog()

async function regenerateSecret() {
  const confirmed = await confirm({
    title: 'Regenerate secret',
    description: 'Are you sure you want to regenerate the client secret? The old secret will no longer work.',
    confirmLabel: 'Regenerate',
    confirmColor: 'warning',
  })
  if (!confirmed) return

  regenerating.value = true
  try {
    const result = await $fetch<{ secret: string }>(`/api/admin/oauth/clients/${clientId}/secret`, {
      method: 'POST',
    })
    newSecret.value = result.secret
    showSecretModal.value = true
  }
  catch (error) {
    console.error('Failed to regenerate secret:', error)
  }
  finally {
    regenerating.value = false
  }
}

function closeSecretModal() {
  showSecretModal.value = false
  newSecret.value = null
  copiedField.value = null
}

function copyToClipboard(text: string, field: string) {
  navigator.clipboard.writeText(text)
  copiedField.value = field
  setTimeout(() => copiedField.value = null, 2000)
}

const envFormat = computed(() => {
  if (!newSecret.value) return ''
  return `FRIGEAR_SSO_URL=${ssoUrl}\nFRIGEAR_SSO_CLIENT_ID=${clientId}\nFRIGEAR_SSO_CLIENT_SECRET=${newSecret.value}`
})

async function deleteClient() {
  const confirmed = await confirm({
    title: 'Delete client',
    description: 'Are you sure you want to delete this client? This will revoke all tokens and break any sites using it.',
    confirmLabel: 'Delete',
  })
  if (!confirmed) return
  await $fetch(`/api/admin/oauth/clients/${clientId}`, { method: 'DELETE' })
  navigateTo('/admin/oauth/clients')
}
</script>

<template>
  <UContainer class="py-8">
    <!-- Page header -->
    <div class="flex items-center gap-4 mb-8">
      <UButton
        to="/dashboard/clients"
        color="neutral"
        variant="ghost"
        icon="i-heroicons-arrow-left"
      />
      <h1 class="text-2xl font-bold text-highlighted">
        Edit Client
      </h1>
    </div>

    <div
      v-if="!client"
      class="text-center py-12"
    >
      <UEmpty
        icon="i-heroicons-exclamation-triangle"
        title="Client not found"
        :actions="[{ label: 'Back to Clients', to: '/dashboard/clients' }]"
      />
    </div>

    <div
      v-else
      class=" space-y-6"
    >
      <UCard>
        <template #header>
          <h2 class="font-semibold">
            Client Details
          </h2>
        </template>

        <form
          class="space-y-4"
          @submit.prevent="saveClient"
        >
          <UFormField>
            <template #label>
              <span class="flex items-center gap-1.5">
                FRIGEAR_SSO_URL
                <UButton
                  :icon="copiedField === 'key-sso-url' ? 'i-lucide-clipboard-check' : 'i-lucide-clipboard'"
                  :color="copiedField === 'key-sso-url' ? 'success' : 'neutral'"
                  variant="link"
                  size="xs"
                  class="-my-1"
                  @click="copyToClipboard('FRIGEAR_SSO_URL', 'key-sso-url')"
                />
              </span>
            </template>
            <UInput
              :model-value="ssoUrl"
              readonly
              class="font-mono w-full"
              :ui="{ trailing: 'pr-0.5' }"
            >
              <template #trailing>
                <UTooltip
                  text="Copy to clipboard"
                  :content="{ side: 'right' }"
                >
                  <UButton
                    :color="copiedField === 'sso-url' ? 'success' : 'neutral'"
                    variant="link"
                    size="sm"
                    :icon="copiedField === 'sso-url' ? 'i-lucide-clipboard-check' : 'i-lucide-clipboard'"
                    aria-label="Copy to clipboard"
                    @click="copyToClipboard(ssoUrl, 'sso-url')"
                  />
                </UTooltip>
              </template>
            </UInput>
          </UFormField>

          <UFormField>
            <template #label>
              <span class="flex items-center gap-1.5">
                FRIGEAR_SSO_CLIENT_ID
                <UButton
                  :icon="copiedField === 'key-client-id' ? 'i-lucide-clipboard-check' : 'i-lucide-clipboard'"
                  :color="copiedField === 'key-client-id' ? 'success' : 'neutral'"
                  variant="link"
                  size="xs"
                  class="-my-1"
                  @click="copyToClipboard('FRIGEAR_SSO_CLIENT_ID', 'key-client-id')"
                />
              </span>
            </template>
            <UInput
              :model-value="client.id"
              readonly
              class="font-mono w-full"
              :ui="{ trailing: 'pr-0.5' }"
            >
              <template #trailing>
                <UTooltip
                  text="Copy to clipboard"
                  :content="{ side: 'right' }"
                >
                  <UButton
                    :color="copiedField === 'client-id' ? 'success' : 'neutral'"
                    variant="link"
                    size="sm"
                    :icon="copiedField === 'client-id' ? 'i-lucide-clipboard-check' : 'i-lucide-clipboard'"
                    aria-label="Copy to clipboard"
                    @click="copyToClipboard(client.id, 'client-id')"
                  />
                </UTooltip>
              </template>
            </UInput>
          </UFormField>

          <UFormField
            label="Client Name"
            required
            :error="errors.name"
          >
            <UInput
              v-model="editForm.name"
              class="w-full"
              @input="errors.name = undefined"
            />
          </UFormField>

          <UFormField
            label="Website URL"
            description="Any callback path is added automatically."
            required
            :error="errors.websiteUrl"
          >
            <UInput
              v-model="editForm.websiteUrl"
              class="w-full"
              @input="errors.websiteUrl = undefined"
            />
          </UFormField>

          <UFormField
            label="Preview URL Pattern"
            description="Use * as wildcard for preview deployments."
            hint="Optional"
            :error="errors.previewUrlPattern"
          >
            <UInput
              v-model="editForm.previewUrlPattern"
              placeholder="https://*.vercel.app"
              class="w-full"
              @input="errors.previewUrlPattern = undefined"
            />
          </UFormField>

          <UFormField
            v-if="client"
            label="Callback URL"
            help="This is automatically generated from the website URL."
          >
            <UInput
              :model-value="client.callbackUrl"
              readonly
              disabled
              class="font-mono w-full"
            />
          </UFormField>

          <UFormField label="Status">
            <USwitch v-model="editForm.isActive">
              {{ editForm.isActive ? 'Active' : 'Inactive' }}
            </USwitch>
          </UFormField>

          <div class="flex justify-end">
            <UButton
              type="submit"
              :loading="saving"
            >
              Save Changes
            </UButton>
          </div>
        </form>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="font-semibold">
            Client Secret
          </h2>
        </template>

        <p class="text-sm text-muted mb-4">
          The client secret is only shown when the client is created or regenerated.
          If you've lost the secret, you can regenerate it below.
        </p>

        <UButton
          color="warning"
          :loading="regenerating"
          @click="regenerateSecret"
        >
          Regenerate Secret
        </UButton>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="font-semibold text-error-600 dark:text-error-400">
            Danger Zone
          </h2>
        </template>

        <p class="text-sm text-muted mb-4">
          Deleting this client will revoke all tokens and break any sites using it.
        </p>

        <UButton
          color="error"
          variant="outline"
          @click="deleteClient"
        >
          Delete Client
        </UButton>
      </UCard>
    </div>

    <UModal
      v-model:open="showSecretModal"
      title="New Client Secret"
      @close="closeSecretModal"
    >
      <template #body>
        <div class="space-y-4">
          <UAlert
            color="warning"
            variant="subtle"
            title="Save your client secret"
            description="This secret will only be shown once. Make sure to copy it now."
          />

          <UFormField>
            <template #label>
              <span class="flex items-center gap-1.5">
                FRIGEAR_SSO_URL
                <UButton
                  :icon="copiedField === 'modal-key-url' ? 'i-lucide-clipboard-check' : 'i-lucide-clipboard'"
                  :color="copiedField === 'modal-key-url' ? 'success' : 'neutral'"
                  variant="link"
                  size="xs"
                  class="-my-1"
                  @click="copyToClipboard('FRIGEAR_SSO_URL', 'modal-key-url')"
                />
              </span>
            </template>
            <UInput
              :model-value="ssoUrl"
              readonly
              class="font-mono w-full"
              :ui="{ trailing: 'pr-0.5' }"
            >
              <template #trailing>
                <UTooltip
                  text="Copy to clipboard"
                  :content="{ side: 'right' }"
                >
                  <UButton
                    :color="copiedField === 'modal-val-url' ? 'success' : 'neutral'"
                    variant="link"
                    size="sm"
                    :icon="copiedField === 'modal-val-url' ? 'i-lucide-clipboard-check' : 'i-lucide-clipboard'"
                    aria-label="Copy to clipboard"
                    @click="copyToClipboard(ssoUrl, 'modal-val-url')"
                  />
                </UTooltip>
              </template>
            </UInput>
          </UFormField>

          <UFormField>
            <template #label>
              <span class="flex items-center gap-1.5">
                FRIGEAR_SSO_CLIENT_ID
                <UButton
                  :icon="copiedField === 'key-id' ? 'i-lucide-clipboard-check' : 'i-lucide-clipboard'"
                  :color="copiedField === 'key-id' ? 'success' : 'neutral'"
                  variant="link"
                  size="xs"
                  class="-my-1"
                  @click="copyToClipboard('FRIGEAR_SSO_CLIENT_ID', 'key-id')"
                />
              </span>
            </template>
            <UInput
              :model-value="clientId"
              readonly
              class="font-mono w-full"
              :ui="{ trailing: 'pr-0.5' }"
            >
              <template #trailing>
                <UTooltip
                  text="Copy to clipboard"
                  :content="{ side: 'right' }"
                >
                  <UButton
                    :color="copiedField === 'val-id' ? 'success' : 'neutral'"
                    variant="link"
                    size="sm"
                    :icon="copiedField === 'val-id' ? 'i-lucide-clipboard-check' : 'i-lucide-clipboard'"
                    aria-label="Copy to clipboard"
                    @click="copyToClipboard(clientId, 'val-id')"
                  />
                </UTooltip>
              </template>
            </UInput>
          </UFormField>

          <UFormField>
            <template #label>
              <span class="flex items-center gap-1.5">
                FRIGEAR_SSO_CLIENT_SECRET
                <UButton
                  :icon="copiedField === 'key-secret' ? 'i-lucide-clipboard-check' : 'i-lucide-clipboard'"
                  :color="copiedField === 'key-secret' ? 'success' : 'neutral'"
                  variant="link"
                  size="xs"
                  class="-my-1"
                  @click="copyToClipboard('FRIGEAR_SSO_CLIENT_SECRET', 'key-secret')"
                />
              </span>
            </template>
            <UInput
              :model-value="newSecret"
              readonly
              class="font-mono w-full"
              type="text"
              :ui="{ trailing: 'pr-0.5' }"
            >
              <template #trailing>
                <UTooltip
                  text="Copy to clipboard"
                  :content="{ side: 'right' }"
                >
                  <UButton
                    :color="copiedField === 'val-secret' ? 'success' : 'neutral'"
                    variant="link"
                    size="sm"
                    :icon="copiedField === 'val-secret' ? 'i-lucide-clipboard-check' : 'i-lucide-clipboard'"
                    aria-label="Copy to clipboard"
                    @click="copyToClipboard(newSecret!, 'val-secret')"
                  />
                </UTooltip>
              </template>
            </UInput>
          </UFormField>

          <!-- Raw .env format -->
          <USeparator />
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-muted">
                .env format
              </span>
              <UButton
                :icon="copiedField === 'env' ? 'i-lucide-clipboard-check' : 'i-lucide-clipboard'"
                :color="copiedField === 'env' ? 'success' : 'neutral'"
                variant="ghost"
                size="xs"
                :label="copiedField === 'env' ? 'Copied!' : 'Copy all'"
                @click="copyToClipboard(envFormat, 'env')"
              />
            </div>
            <pre class="text-xs font-mono bg-elevated rounded-lg p-3 overflow-x-auto select-all">{{ envFormat }}</pre>
          </div>
        </div>
      </template>
      <template #footer>
        <UButton
          block
          @click="closeSecretModal"
        >
          Done
        </UButton>
      </template>
    </UModal>
  </UContainer>
</template>
