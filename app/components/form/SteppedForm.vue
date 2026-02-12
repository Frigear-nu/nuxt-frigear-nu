<script setup lang="ts">
// FIXME: Move to separate file.
import type { SteppedForm } from '#shared/schema/forms/project-application'

defineProps<{
  form: SteppedForm
}>()

// TODO: Might want to clone the repo and customize the module ourselves.
</script>

<template>
  <div>
    <pre>{{ form }}</pre>
  </div>
</template>
