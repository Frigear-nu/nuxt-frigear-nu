<script setup lang="ts">
import type { FormSubmission } from '@nuxthub/db/schema'
import { withLeadingSlash } from 'ufo'

type FileReference = string | string[]

const props = withDefaults(defineProps<{
  file: FileReference
  submission: FormSubmission
  preview?: boolean
}>(), {
  preview: true,
})

const filesPaths = computed(() => {
  if (!props.file) return []
  if (typeof props.file === 'string') {
    return [props.file]
  }

  return props.file
})

const detectType = (contentType: string) => {
  if (contentType.includes('image')) {
    return 'image'
  }

  if (contentType.includes('video')) {
    return 'video'
  }

  return 'file'
}

const getMediaUrl = (path: string) => {
  return `/api/forms/media${withLeadingSlash(path)}`
}

const files = computed(() => {
  if (!props.submission || !props.submission.files) return []
  const mappedFiles = Object.fromEntries(props.submission.files.map(file => [file.pathname, {
    ...file,
    createdAt: new Date(file?.createdAt),
    type: file.contentType ? detectType(file.contentType) : 'unknown',
    url: getMediaUrl(file.pathname),
  }]))

  return filesPaths.value.map(path => mappedFiles[path]).filter(item => item !== undefined)
})
</script>

<template>
  <div
    v-if="files && files.length > 0"
    class="flex flex-col gap-2"
  >
    <div
      v-for="media in files"
      :key="media.pathname"
      class="flex flex-col gap-2 max-w-dvw"
    >
      <div v-if="media.type === 'image'">
        <UModal fullscreen>
          <div>
            <span v-if="preview">
              {{ media.pathname.split('/').pop() }}
            </span>
            <UButton
              v-else
              icon="i-lucide-eye"
              size="sm"
              class="w-full"
              :ui="{ label: 'truncate' }"
              :label="media.pathname.split('/').pop()"
            />
            <img
              v-if="preview"
              :src="media.url"
              alt="Image"
            >
          </div>
          <template #body>
            <img
              :src="media.url"
              alt="Image"
            >
          </template>
        </UModal>
      </div>
      <div v-else-if="media.type === 'video'">
        <UModal fullscreen>
          <UButton icon="i-lucide-play">
            {{ media.pathname.split('/').pop() }}
          </UButton>
          <template #body>
            <video
              :src="media.url"
              controls
            />
          </template>
        </UModal>
      </div>
      <div class="max-w-dvw">
        <UButton
          icon="i-lucide-download"
          :href="media.url"
          size="sm"
          variant="subtle"
          class="w-full"
          :ui="{ label: 'truncate' }"
          download
        >
          {{ media.pathname.split('/').pop() }}
        </UButton>
      </div>
    </div>
  </div>
</template>
