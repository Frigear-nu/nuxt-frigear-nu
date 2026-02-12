<script setup lang="ts">
import { projectApplicationForm } from '#shared/schema/forms/project-application'
</script>

<template>
  <FormSteppedForm :form="projectApplicationForm" />
</template>
