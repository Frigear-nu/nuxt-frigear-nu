<script setup lang="ts">

</script>

<template>
  <UPopover
    :content="{ align: 'end' }"
  >
    <UButton
      color="neutral"
      variant="ghost"
      class="size-8"
    >
      <template #trailing>
        <span class="text-lg">
          {{ getEmojiFlag(locale) }}
        </span>
      </template>
    </UButton>

    <template #content>
      <ul class="flex flex-col">
        <li
          v-for="localeItem in locales"
          :key="localeItem.code"
        >
          <NuxtLink
            class="flex justify-between py-1.5 px-2 gap-1 hover:bg-muted"
            :to="switchLocalePath(localeItem.code) as string"
            :aria-label="localeItem.name"
          >
            <span class="text-sm">
              {{ localeItem.name }}
            </span>
            <span class="size-5 text-center">
              {{ getEmojiFlag(localeItem.code) }}
            </span>
          </NuxtLink>
        </li>
      </ul>
    </template>
  </UPopover>
</template>
