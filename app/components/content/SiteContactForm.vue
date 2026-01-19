<script setup lang='ts'>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { LocationQueryRaw } from 'vue-router'

import {
  contactFormSchema,
  contactSubjectKeys,
  contactSubjectSelectItems,
  type ContactFormSchema,
  type ContactSubjectKey,
} from '#shared/schema/forms/contact'

const isSubmitting = ref(false)
const toast = useToast()
const route = useRoute()
const router = useRouter()

const DEFAULT_STATE: Partial<ContactFormSchema> = {
  name: undefined,
  email: undefined,
  phone: undefined,
  subject: undefined,
  subjectOther: undefined,
  message: undefined,
}

const state = reactive<typeof DEFAULT_STATE>({ ...DEFAULT_STATE })

async function onSubmit(event: FormSubmitEvent<ContactFormSchema>) {
  isSubmitting.value = true
  try {
    await $fetch('/api/contact', { method: 'POST', body: event.data })

    toast.add({
      icon: 'lucide-check-circle',
      title: 'Whooop!, -Besked fyret afsted!',
      description: 'Vi vender tilbage så snart en frivillig har set den.',
      color: 'success',
    })

    Object.assign(state, DEFAULT_STATE)
  }
  catch (err: unknown) {
    let description = 'Ukendt fejl. Prøv lige igen senere.'
    if (typeof err === 'object' && err !== null) {
      const e = err as { data?: { message?: string }, message?: string }
      description = e.data?.message ?? e.message ?? description
    }
    toast.add({
      icon: 'lucide-alert-circle',
      title: 'Noget gik galt, -Beskeden blev ikke sendt.',
      description,
      color: 'error',
    })
    throw err
  }
  finally {
    isSubmitting.value = false
  }
}

function isSubjectKey(v: unknown): v is ContactSubjectKey {
  return typeof v === 'string' && (contactSubjectKeys as readonly string[]).includes(v)
}

watch(
  () => route.query.subject,
  (raw) => {
    const candidate = Array.isArray(raw) ? raw[0] : raw
    if (!isSubjectKey(candidate)) return

    state.subject = candidate

    const q: LocationQueryRaw = { ...route.query }
    delete q.subject
    router.replace({ query: q })
  },
  { immediate: true },
)

function onError(event: unknown) {
  let id: string | undefined

  if (typeof event === 'object' && event !== null) {
    const e = event as { error?: Array<{ id?: string }>, errors?: Array<{ id?: string }> }
    id = e.error?.[0]?.id ?? e.errors?.[0]?.id
  }

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
      :schema="contactFormSchema"
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
