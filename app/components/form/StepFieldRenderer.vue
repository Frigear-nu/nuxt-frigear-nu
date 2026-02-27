<!-- components/StepFieldRenderer.vue -->
<script lang="ts" generic="TField extends FormFieldDef, TState extends Record<string, unknown>" setup>
import { CalendarDate } from '@internationalized/date'
import type { FormFieldDef } from '#shared/types/form'

// Unknown-based instead of any

const props = defineProps<{
  field: TField
  state: TState
}>()

const emit = defineEmits<{
  'update:state': [name: string, value: unknown]
}>()

const model = computed({
  get: () => props.state[props.field.name],
  set: (val: unknown) => emit('update:state', props.field.name, val),
})

// Narrow helpers for typed template access
const asSelect = computed(() =>
  props.field.type === 'select' ? props.field : null,
)
const asCombobox = computed(() =>
  props.field.type === 'combobox' ? props.field : null,
)
const asRadio = computed(() =>
  props.field.type === 'radio' ? props.field : null,
)
const asTextarea = computed(() =>
  props.field.type === 'textarea' ? props.field : null,
)
const asFile = computed(() =>
  props.field.type === 'file' ? props.field : null,
)
const asDate = computed(() =>
  props.field.type === 'date' ? props.field : null,
)
const asNumber = computed(() =>
  props.field.type === 'number' ? props.field : null,
)

function toCalendarDate(iso?: string) {
  if (!iso) return undefined
  const [y, m, d] = iso.split('-').map(Number)
  return new CalendarDate(y!, m!, d!)
}

const dateModel = computed({
  get: () => {
    if (asDate.value && model.value) {
      return toCalendarDate(model.value as string)
    }
    return undefined
  },
  set: (val: CalendarDate | undefined) => {
    if (asDate.value) {
      if (val) {
        model.value = val.toString()
      }
    }
  },
})
</script>

<template>
  <UFormField
    :name="field.name"
    :label="field.type !== 'checkbox' && field.label ? $t(field.label) : undefined"
    :description="field.type !== 'checkbox' && field.description ? $t(field.description) : undefined"
    :required="field.required"
  >
    <UInput
      v-if="field.type === 'text' || field.type === 'email' || field.type === 'password'"
      v-model="model"
      :type="field.type"
      :placeholder="field.placeholder ? $t(field.placeholder): undefined"
      :disabled="field.disabled"
      class="w-full"
    />

    <UTextarea
      v-else-if="asTextarea"
      v-model="model"
      :placeholder="field.placeholder ? $t(field.placeholder): undefined"
      :disabled="field.disabled"
      :rows="asTextarea.rows ?? 4"
      class="w-full"
    />

    <USelect
      v-else-if="asSelect"
      v-model="model"
      :items="asSelect.options"
      :placeholder="field.placeholder ? $t(field.placeholder): undefined"
      :disabled="field.disabled"
      class="w-full"
    />

    <UInputMenu
      v-else-if="asCombobox"
      v-model="model"
      :items="asCombobox.options"
      :placeholder="field.placeholder ? $t(field.placeholder): undefined"
      :disabled="field.disabled"
      class="w-full"
    />

    <URadioGroup
      v-else-if="asRadio"
      v-model="model"
      :items="asRadio.options"
      :disabled="field.disabled"
    />

    <UCheckbox
      v-else-if="field.type === 'checkbox'"
      v-model="model"
      :label="field.label ? $t(field.label) : undefined"
      :description="field.description ? $t(field.description): undefined"
      :required="field.required"
      :disabled="field.disabled"
    />

    <UInputDate
      v-else-if="asDate"
      v-model="dateModel"
      :disabled="field.disabled"
      :min-value="toCalendarDate(asDate.minValue)"
      :max-value="toCalendarDate(asDate.maxValue)"
      class="w-full"
    />

    <UFileUpload
      v-else-if="asFile"
      v-model="model"
      type="file"
      :accept="asFile?.meta?.accept || undefined"
      :multiple="asFile?.meta?.multiple || false"
      :disabled="field.disabled"
      class="w-full"
      layout="list"
      :interactive="false"
    >
      <template #actions="{ open }">
        <UButton
          label="Select files"
          icon="i-lucide-upload"
          color="neutral"
          variant="outline"
          @click="open()"
        />
      </template>

      <template #files-bottom="{ removeFile, files }">
        <UButton
          v-if="files?.length"
          label="Remove all files"
          color="neutral"
          @click="removeFile()"
        />
      </template>
    </UFileUpload>

    <UInputNumber
      v-else-if="asNumber"
      v-model="model"
      :placeholder="field.placeholder ? $t(field.placeholder): undefined"
      :disabled="field.disabled"
      class="w-full"
    />
  </UFormField>
</template>
