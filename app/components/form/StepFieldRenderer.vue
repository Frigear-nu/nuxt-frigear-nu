<!-- components/StepFieldRenderer.vue -->
<script lang="ts" generic="TField extends FormFieldDef, TState extends Record<string, unknown>" setup>
import { CalendarDate } from '@internationalized/date'
import type { FormFieldDef } from '#shared/types/form'

const props = withDefaults(defineProps<{
  field: TField
  state: TState
  i18nPrefix?: string
}>(), {
  i18nPrefix: 'form.',
})

const emit = defineEmits<{
  'update:state': [name: string, value: unknown]
}>()

const { t } = useSiteI18n()

const model = computed({
  get: () => props.state[props.field.name],
  set: (val: unknown) => {
    emit('update:state', props.field.name, val)
  },
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

// TODO: Might want to provide options for number field, e.g "steps" "input" etc...
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

function addEntry() {
  console.log('addEntry')
  const current = (model.value as Record<string, unknown>[]) ?? []
  model.value = [...current, {}]
}

function removeEntry(index: number) {
  console.log('removeEntry', { index })
  const current = [...((model.value as Record<string, unknown>[]) ?? [])]
  current.splice(index, 1)
  model.value = current
}

function updateEntry(index: number, name: string, val: unknown) {
  console.log('updateEntry', { index, name, val })
  const current = [...toRaw(((model.value as Record<string, unknown>[]) ?? []))]
  current[index] = toRaw({ ...current[index], [name]: val })
  model.value = current
  console.log('updated', { model: toRaw(current) })
}

const translated = (property: string) => {
  const definedValue = props.field[property as keyof typeof props.field] || props.field.meta[property as keyof typeof props.field] as string | undefined
  if (definedValue) {
    return t(definedValue)
  }

  const autoKey = `${props.i18nPrefix}${property}`
  const autoTranslated = t(autoKey)

  // TODO: Might want to not include the automatic field name in some cases?
  // for labels, there is an auto mapper for this

  const whiteListed = ['label', 'add']

  // not the i18n key, or if this is the label, we want it anyways.
  if (autoTranslated !== autoKey || (whiteListed.includes(property) && definedValue !== '')) {
    return autoTranslated
  }

  if (whiteListed.includes(property) && definedValue !== '') {
    return autoTranslated
  }

  return undefined
}

const formFieldProps = computed(() => {
  const withLabel = props.field.type !== 'checkbox'
  const withDescription = props.field.type !== 'checkbox'

  const label = withLabel ? translated('label') : undefined
  const description = withDescription ? translated('description') : undefined
  return {
    _name: props.field.name,
    label,
    description,
    required: props.field.required,
  }
})

const fieldProps = computed(() => {
  const isCheckbox = props.field.type === 'checkbox'
  const withPlaceholder
    = !isCheckbox
      && !toValue(asRadio)
      && !toValue(asDate)
      && !toValue(asFile)

  const withLabel = props.field.type === 'checkbox'
  const withDescription = props.field.type === 'checkbox'
  return {
    _name: props.field.name,
    placeholder: withPlaceholder ? translated('placeholder') : undefined,
    label: withLabel ? translated('label') : undefined,
    description: withDescription ? translated('description') : undefined,
  }
})
</script>

<template>
  <UFormField
    v-if="field.repeatable && field.fields"
    v-bind="formFieldProps"
  >
    <div class="flex flex-col gap-3">
      <div
        v-for="(entry, index) in (model as Record<string, unknown>[])"
        :key="index"
        class="relative rounded-lg border border-default p-4"
      >
        <!-- Remove button -->
        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          size="xs"
          class="absolute top-2 right-2"
          @click="removeEntry(index)"
        />

        <!-- Sub-fields for this entry -->
        <div class="flex flex-col gap-3">
          <StepFieldRenderer
            v-for="subField in field.fields"
            :key="subField.name"
            :field="subField"
            :state="entry"
            :i18n-prefix="`${i18nPrefix}${subField.name}.`"
            @update:state="(name, val) => updateEntry(index, name, val)"
          />
        </div>
      </div>

      <!-- Add button -->
      <UButton
        icon="i-lucide-plus"
        color="neutral"
        variant="outline"
        :label="translated('add')"
        @click="addEntry"
      />
    </div>
  </UFormField>
  <UFormField
    v-else
    :key="field.name"
    :name="field.name"
    v-bind="formFieldProps"
  >
    <UInput
      v-if="field.type === 'text' || field.type === 'email' || field.type === 'password'"
      v-model="model"
      :type="field.type"
      v-bind="fieldProps"
      :disabled="field.disabled"
      class="w-full"
    />

    <UTextarea
      v-else-if="asTextarea"
      v-model="model"
      v-bind="fieldProps"
      :disabled="field.disabled"
      :rows="asTextarea.rows ?? 4"
      class="w-full"
    />

    <USelect
      v-else-if="asSelect"
      v-model="model"
      :items="asSelect.options"
      v-bind="fieldProps"
      :disabled="field.disabled"
      class="w-full"
    />

    <UInputMenu
      v-else-if="asCombobox"
      v-model="model"
      :items="asCombobox.options"
      v-bind="fieldProps"
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
      v-bind="fieldProps"
      :required="field.required"
      :disabled="field.disabled"
    >
      <template
        v-if="field.label"
        #label
      >
        <MDC
          :value="translated('label')"
          unwrap
        />
      </template>
      <template
        v-if="field.description"
        #description
      >
        <MDC
          :value="translated('description')"
          unwrap
        />
      </template>
    </UCheckbox>

    <UInputDate
      v-else-if="asDate"
      v-model="dateModel"
      :disabled="field.disabled"
      v-bind="fieldProps"
      :min-value="asDate.minValue ? toCalendarDate(asDate.minValue) : undefined"
      :max-value="asDate.maxValue ? toCalendarDate(asDate.maxValue) : undefined"
      class="w-full"
    />

    <UFileUpload
      v-else-if="asFile"
      v-model="model"
      type="file"
      v-bind="fieldProps"
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
      v-bind="fieldProps"
      :disabled="field.disabled"
      class="w-full"
    />
  </UFormField>
</template>
