<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'

interface OAuthClient {
  id: string
  name: string
  websiteUrl: string
  previewUrlPattern: string | null
  callbackUrl: string
  isActive: boolean
  createdAt: string
  ownerName: string | null
}

useSeoMeta({
  title: 'OAuth Clients',
  description: 'Manage your registered OAuth client applications.',
})

definePageMeta({
  middleware: 'auth',
})

const { user } = useUserSession()

// Redirect non-admins to dashboard
if (user.value?.role !== 'admin') {
  await navigateTo('/')
}

const { data: clients, refresh } = await useFetch<OAuthClient[]>('/api/admin/oauth/clients')

const showCreateModal = ref(false)
const newClient = ref({
  name: '',
  websiteUrl: '',
  previewUrlPattern: '',
})
const createdSecret = ref<string | null>(null)
const createdClientId = ref<string | null>(null)
const creating = ref(false)
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
    return `Invalid URL format`
  }
  // eslint-disable-next-line regexp/no-unused-capturing-group
  if (!url.startsWith('https://') && !/^http:\/\/localhost(:\d+)?($|\/)/.test(url)) {
    return 'Must use HTTPS (http://localhost allowed for development)'
  }
}

function validateForm(): boolean {
  const errs: typeof errors.value = {}

  if (!newClient.value.name.trim()) {
    errs.name = 'Client name is required'
  }

  if (!newClient.value.websiteUrl.trim()) {
    errs.websiteUrl = 'Website URL is required'
  }
  else {
    const urlError = validateUrl(newClient.value.websiteUrl, 'Website URL')
    if (urlError) errs.websiteUrl = urlError
  }

  if (newClient.value.previewUrlPattern.trim()) {
    const pattern = newClient.value.previewUrlPattern
    // Replace wildcards with a valid placeholder for URL validation
    const testUrl = pattern.replace(/\*/g, 'placeholder')
    const patternError = validateUrl(testUrl, 'Preview URL pattern')
    if (patternError) errs.previewUrlPattern = patternError
  }

  errors.value = errs
  return Object.keys(errs).length === 0
}

async function createClient() {
  if (!validateForm()) return

  creating.value = true
  try {
    const result = await $fetch<OAuthClient & { secret: string }>('/api/admin/oauth/clients', {
      method: 'POST',
      body: {
        name: newClient.value.name,
        websiteUrl: newClient.value.websiteUrl,
        previewUrlPattern: newClient.value.previewUrlPattern || undefined,
      },
    })

    createdSecret.value = result.secret
    createdClientId.value = result.id
    errors.value = {}
    await refresh()

    newClient.value = {
      name: '',
      websiteUrl: '',
      previewUrlPattern: '',
    }
  }
  catch (error: unknown) {
    // Handle server validation errors
    const message = error?.data?.message || error?.message || ''
    if (message.toLowerCase().includes('url')) {
      errors.value = { websiteUrl: message }
    }
    else if (message.toLowerCase().includes('name')) {
      errors.value = { name: message }
    }
  }
  finally {
    creating.value = false
  }
}

function closeModal() {
  showCreateModal.value = false
  createdSecret.value = null
  createdClientId.value = null
  copiedField.value = null
  errors.value = {}
}

function copyToClipboard(text: string, field: string) {
  navigator.clipboard.writeText(text)
  copiedField.value = field
  setTimeout(() => copiedField.value = null, 2000)
}

const envFormat = computed(() => {
  if (!createdClientId.value || !createdSecret.value) return ''
  return `FRIGEAR_SSO_URL=${ssoUrl}\nFRIGEAR_SSO_CLIENT_ID=${createdClientId.value}\nFRIGEAR_SSO_CLIENT_SECRET=${createdSecret.value}`
})

const confirm = useConfirmDialog()

async function deleteClient(id: string) {
  const confirmed = await confirm({
    title: 'Delete client',
    description: 'Are you sure you want to delete this client? This action cannot be undone.',
    confirmLabel: 'Delete',
  })
  if (!confirmed) return

  try {
    await $fetch(`/api/admin/oauth/clients/${id}`, { method: 'DELETE' })
    await refresh()
  }
  catch (error) {
    console.error('Failed to delete client:', error)
  }
}

const headerActions = computed<ButtonProps[]>(() => [
  { label: 'New Client', icon: 'i-heroicons-plus', onClick: () => { showCreateModal.value = true } },
])
</script>

<template>
  <UContainer class="py-8">
    <UPageHeader
      title="OAuth Clients"
      description="Manage your registered OAuth client applications."
      :links="headerActions"
    />

    <!-- Empty state -->
    <UEmpty
      v-if="clients?.length === 0"
      icon="i-heroicons-key"
      title="No clients yet"
      description="Create your first OAuth client to enable authentication for your Nuxt Studio sites."
      :actions="[{ label: 'Create Your First Client', icon: 'i-heroicons-plus', onClick: () => { showCreateModal = true } }]"
    />

    <!-- Client list -->
    <UPageBody
      v-else
      class="grid gap-4"
    >
      <UCard
        v-for="client in clients"
        :key="client.id"
      >
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-2">
              <div class="p-2 bg-primary/10 rounded-lg inline-flex shrink-0">
                <UIcon
                  name="i-heroicons-key"
                  class="size-5 text-primary"
                />
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <h3 class="font-semibold text-highlighted truncate">
                    {{ client.name }}
                  </h3>
                  <UBadge
                    v-if="client.isActive"
                    color="success"
                    variant="subtle"
                    size="sm"
                  >
                    Active
                  </UBadge>
                  <UBadge
                    v-else
                    color="error"
                    variant="subtle"
                    size="sm"
                  >
                    Inactive
                  </UBadge>
                </div>
                <p class="text-xs text-muted font-mono truncate">
                  {{ client.id }}
                </p>
              </div>
            </div>

            <div class="ml-11 space-y-1">
              <UButton
                :to="client.websiteUrl"
                :label="client.websiteUrl"
                target="_blank"
                external
                size="xs"
                trailing-icon="i-lucide-arrow-up-right"
                variant="link"
                color="neutral"
                square
              />
              <p
                v-if="client.previewUrlPattern"
                class="text-xs text-dimmed truncate px-1"
              >
                Preview: {{ client.previewUrlPattern }}
              </p>
              <p
                v-if="client.ownerName"
                class="text-xs text-dimmed px-1"
              >
                Created by {{ client.ownerName }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 ml-11 lg:ml-0">
            <UButton
              :to="`/admin/oauth/clients/${client.id}`"
              color="neutral"
              variant="soft"
              size="sm"
              leading-icon="i-heroicons-pencil"
            >
              Edit
            </UButton>
            <UButton
              color="error"
              variant="ghost"
              size="sm"
              icon="i-heroicons-trash"
              @click="deleteClient(client.id)"
            />
          </div>
        </div>
      </UCard>
    </UPageBody>

    <!-- Create Modal -->
    <UModal
      v-model:open="showCreateModal"
      :title="createdSecret ? 'Client Created Successfully' : 'Create New Client'"
      :ui="{ footer: 'justify-end' }"
      @close="closeModal"
    >
      <template #body>
        <!-- Success state -->
        <div
          v-if="createdSecret"
          class="space-y-4"
        >
          <UAlert
            color="warning"
            icon="i-heroicons-exclamation-triangle"
            title="Save your client secret"
            variant="subtle"
            description="This secret will only be shown once. Make sure to copy and store it securely."
          />

          <UFormField>
            <template #label>
              <span class="flex items-center gap-1.5">
                FRIGEAR_SSO_URL
                <UButton
                  :icon="copiedField === 'key-url' ? 'i-lucide-clipboard-check' : 'i-lucide-clipboard'"
                  :color="copiedField === 'key-url' ? 'success' : 'neutral'"
                  variant="link"
                  size="xs"
                  class="-my-1"
                  @click="copyToClipboard('FRIGEAR_SSO_URL', 'key-url')"
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
                    :color="copiedField === 'val-url' ? 'success' : 'neutral'"
                    variant="link"
                    size="sm"
                    :icon="copiedField === 'val-url' ? 'i-lucide-clipboard-check' : 'i-lucide-clipboard'"
                    aria-label="Copy to clipboard"
                    @click="copyToClipboard(ssoUrl, 'val-url')"
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
              :model-value="createdClientId"
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
                    @click="copyToClipboard(createdClientId!, 'val-id')"
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
              :model-value="createdSecret"
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
                    @click="copyToClipboard(createdSecret!, 'val-secret')"
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

        <!-- Create form -->
        <form
          v-else
          class="space-y-4"
          @submit.prevent="createClient"
        >
          <UFormField
            label="Client Name"
            required
            :error="errors.name"
          >
            <UInput
              v-model="newClient.name"
              placeholder="My Nuxt Studio Site"
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
              v-model="newClient.websiteUrl"
              placeholder="https://docs.example.com"
              type="url"
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
              v-model="newClient.previewUrlPattern"
              placeholder="https://my-docs-*.vercel.app"
              class="w-full"
              @input="errors.previewUrlPattern = undefined"
            />
          </UFormField>
        </form>
      </template>

      <template #footer>
        <template v-if="createdSecret">
          <UButton
            block
            @click="closeModal"
          >
            Done
          </UButton>
        </template>
        <template v-else>
          <UButton
            color="neutral"
            variant="outline"
            @click="closeModal"
          >
            Cancel
          </UButton>
          <UButton
            :loading="creating"
            @click="createClient"
          >
            Create Client
          </UButton>
        </template>
      </template>
    </UModal>
  </UContainer>
</template>
