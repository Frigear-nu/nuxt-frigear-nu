<script setup lang="ts">
import { projectApplicationForm } from '#shared/schema/forms/project-application'

const textAreaKeys = ['background', 'purpose'] as const

const formResult = reactive({})

const onSubmit = (data: unknown) => {
  Object.assign(formResult, data)
}
</script>

<template>
  <div class="max-w-md mx-auto mt-8">
    <FormSteppedForm
      :form="projectApplicationForm"
      @submit="onSubmit"
    >
      <template
        v-for="name in textAreaKeys"
        :key="name"
        #[name]="{ field, state: stateValue }"
      >
        <UTextarea
          v-model="stateValue[field]"
          class="w-full"
        />
      </template>
    </FormSteppedForm>
    <pre>{{ formResult }}</pre>
  </div>
</template>
