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

const { t, locale } = useSiteI18n()
const { translatedProperty } = useContent()

const model = computed({
  get: () => props.state[props.field.name],
  set: (val: unknown) => emit('update:state', props.field.name, val),
})

const asMarkdownValue = computed(() => {
  return props.field.type === 'markdown-value'
    ? props.field
    : null
})

const { data: parsedMarkdown } = await useAsyncData(
  () => `forms:${locale.value}:${props.i18nPrefix}${props.field.name}:mdc`,
  async () => {
    if (!props.field.meta?.content) return undefined
    const md = translatedProperty(props.field.meta?.content)

    if (!md) return undefined
    return await parseMarkdown(md)
  },
  { watch: [locale, () => props.field.name] },
)

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

const translated = (property: string) => {
  const definedValue = props.field[property as keyof typeof props.field] as string | undefined
  if (definedValue) {
    return t(definedValue)
  }

  const autoKey = `${props.i18nPrefix}${property}`
  const autoTranslated = t(autoKey)

  // TODO: Might want to not include the automatic field name in some cases?
  // for labels, there is an auto mapper for this

  // not the i18n key, or if this is the label, we want it anyways.
  if (autoTranslated !== autoKey || (property === 'label' && definedValue !== '')) {
    return autoTranslated
  }

  if (property === 'label' && definedValue !== '') {
    return autoTranslated
  }

  return undefined
}

const hiddenFormFieldTypes: FormFieldDef['type'][] = ['checkbox', 'markdown-value']
const formFieldProps = computed(() => {
  const withLabel = !hiddenFormFieldTypes.includes(props.field.type)
  const withDescription = !hiddenFormFieldTypes.includes(props.field.type)

  return {
    label: withLabel ? translated('label') : undefined,
    description: withDescription ? translated('description') : undefined,
    required: props.field.required,
  }
})

const fieldProps = computed(() => {
  const isHiddenFormField = hiddenFormFieldTypes.includes(props.field.type)
  const withPlaceholder
    = !isHiddenFormField
      && !toValue(asRadio)
      && !toValue(asDate)
      && !toValue(asFile)

  return {
    placeholder: withPlaceholder ? translated('placeholder') : undefined,
    label: !isHiddenFormField ? translated('label') : undefined,
    description: !isHiddenFormField ? translated('description') : undefined,
  }
})
</script>

<template>
  <UFormField
    :key="field.name"
    :name="field.name"
    v-bind="formFieldProps"
    :ui="{ hint: 'flex flex-row' }"
  >
    <template
      v-if="field.meta && field.meta.hint"
      #hint
    >
      <UModal
        :title="$t('common.information')"
        :ui="{ footer: 'justify-end' }"
      >
        <UButton
          size="sm"
          icon="i-lucide-info"
          variant="link"
          color="neutral"
          :title="translatedProperty(field.meta.hint)"
        />
        <template #body>
          {{ translatedProperty(field.meta.hint) }}
        </template>
        <template #footer="{ close }">
          <UButton
            :label="$t('common.close')"
            @click="close"
          />
        </template>
      </UModal>
    </template>
    <div v-if="asMarkdownValue && parsedMarkdown">
      <ContentRenderer
        :value="parsedMarkdown"
        unwrap="div"
      />
    </div>
    <UInput
      v-else-if="field.type === 'text' || field.type === 'email' || field.type === 'password'"
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
