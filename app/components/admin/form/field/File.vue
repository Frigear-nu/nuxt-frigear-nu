<script setup lang="ts">
import type { FormSubmission } from '@nuxthub/db/schema'
import type { BlobObject } from '@nuxthub/core/blob'
import { withLeadingSlash } from 'ufo'

type FileReference = string | string[]

const props = defineProps<{
  file: FileReference
  submission: FormSubmission
}>()

const filesPaths = computed(() => {
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
  return withBaseUrl(`/api/forms/media${withLeadingSlash(path)}`)
}

const files = computed<BlobObject[]>(() => {
  const mappedFiles = Object.fromEntries(props.submission.files.map(file => [file.pathname, {
    ...file,
    createdAt: new Date(file.createdAt),
    type: detectType(file.contentType),
    url: getMediaUrl(file.pathname),
  }]))

  return filesPaths.value.map(path => mappedFiles[path])
})
</script>

<template>
  <div class="flex flex-col gap-2">
    <div
      v-for="media in files"
      :key="media.pathname"
    >
      <div v-if="media.type === 'image'">
        {{ media.pathname.split('/').pop() }}
        <ProseImg :src="media.url" />
      </div>
      <div v-else-if="media.type === 'video'">
        <UModal>
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
      <div v-else>
        <UButton
          icon="i-lucide-download"
          :href="media.url"
          download
        >
          <pre>{{ media.pathname.split('/').pop() }}</pre>
        </UButton>
      </div>
    </div>
  </div>
</template>
