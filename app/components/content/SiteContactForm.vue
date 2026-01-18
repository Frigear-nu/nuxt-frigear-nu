<script setup lang="ts">
import type { FormSubmitEvent, FormErrorEvent } from '@nuxt/ui'
import {
  createContactFormSchema,
  contactSubjectSelectItems,
  contactSubjectKeys,
  type ContactFormOutput,
  type ContactFormSubjectKey,
} from '#shared/forms/contact/forms'

const schema = createContactFormSchema()

type ContactFormState = Partial<ContactFormOutput>

const DEFAULT_STATE: ContactFormState = {
  name: undefined,
  email: undefined,
  phone: undefined,
  subject: undefined,
  subjectOther: undefined,
  message: undefined,
}

const isSubmitting = ref(false)
const state = reactive<ContactFormState>({ ...DEFAULT_STATE })
const toast = useToast()

async function onSubmit(event: FormSubmitEvent<ContactFormOutput>) {
  isSubmitting.value = true
  try {
    await $fetch('/api/send', { method: 'POST', body: event.data })

    toast.add({
      icon: 'lucide-check-circle',
      title: 'Besked sendt!',
      description: 'Vi vender tilbage hurtigst muligt.',
      color: 'success',
    })

    Object.assign(state, DEFAULT_STATE)
  }
  catch (err: Error) {
    toast.add({
      icon: 'lucide-alert-circle',
      title: 'Noget gik galt',
      description: err?.data?.message ?? err?.message ?? 'Ukendt fejl. Prøv igen senere.',
      color: 'error',
    })
    throw err
  }
  finally {
    isSubmitting.value = false
  }
}

function isSubjectKey(v: unknown): v is ContactFormSubjectKey {
  return typeof v === 'string' && (contactSubjectKeys as readonly string[]).includes(v)
}

// Prefill subject from query (?subject=volunteering|support|other|...)
const route = useRoute()
const router = useRouter()

watch(
  () => route.query.subject,
  (raw) => {
    const candidate = Array.isArray(raw) ? raw[0] : raw
    if (!isSubjectKey(candidate)) return

    state.subject = candidate

    const q = { ...route.query }
    delete (q as any).subject
    router.replace({ query: q })
  },
  { immediate: true },
)

function onError(event: FormErrorEvent) {
  const id = event?.errors?.[0]?.id
  if (!id) return
  const el = document.getElementById(id)
  el?.focus()
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
</script>

<template>
  <UPageCard
    title="Kontakt"
    class="w-full max-w-lg"
  >
    <UForm
      :schema="schema"
      :state="state"
      class="flex flex-col gap-2"
      :loading-auto="true"
      @submit="onSubmit"
      @error="onError"
    >
      <UFormField
        label="Dit seje navn"
        name="name"
        autocomplete="name"
      >
        <UInput
          v-model="state.name"
          class="w-full"
          placeholder="Hej, hva hedder du? .. put her"
        />
      </UFormField>

      <UFormField
        label="Din awesome E-mail"
        name="email"
      >
        <UInput
          v-model="state.email"
          class="w-full"
          placeholder="volunteerHero@someDomain.lol"
          autocomplete="email"
        />
      </UFormField>

      <UFormField
        label="Telefon"
        name="phone"
      >
        <div class="flex gap-2">
          <div class="w-16 shrink-0 rounded-md border px-3 py-2 text-sm text-muted-foreground flex items-center justify-center">
            +45
          </div>
          <UInput
            v-model="state.phone"
            class="flex-1"
            placeholder="12345678"
            inputmode="numeric"
            autocomplete="tel"
          />
        </div>
        <div class="text-xs text-muted-foreground mt-1">
          Telefon skal være 8 cifre (valgfrit).
        </div>
      </UFormField>

      <UFormField
        label="Emne"
        name="subject"
      >
        <USelect
          v-model="state.subject"
          class="w-full"
          placeholder="Vælg emne"
          :items="contactSubjectSelectItems"
        />
      </UFormField>

      <UFormField
        v-show="state.subject === 'other'"
        label="Andet (uddyb)"
        name="subjectOther"
        class="w-full"
      >
        <UInput
          v-model="state.subjectOther"
          class="w-full"
          placeholder="Hvad drejer det sig om?"
        />
      </UFormField>

      <UFormField
        label="Besked"
        name="message"
      >
        <UTextarea
          v-model="state.message"
          placeholder="Jeg vil snakke om et awesome Frigear projekt..."
          class="w-full"
        />
      </UFormField>
      <UButton
        type="submit"
        class="justify-center flex"
        size="xl"
      >
        Send besked
      </UButton>
    </UForm>
  </UPageCard>
</template>
