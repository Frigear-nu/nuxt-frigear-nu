<script lang="ts" setup>
// use shared data available in all components:
const { data: footer } = await useSiteFooter()
// const { data: header } = await useSiteHeader()
</script>

<template>
  <UPageBody>
    <UContainer class="flex  flex-col gap-4">
      <UEmpty
        icon="i-lucide-info"
        title="Custom page"
        :actions="[
          {
            icon: 'i-lucide-home',
            label: 'Back home',
            color: 'neutral',
            variant: 'subtle',
            to: '/',
          },
        ]"
      >
        <template #description>
          This page can be edited in <code>app/pages/pricing.vue</code>.
        </template>
      </UEmpty>
      <UCard>
        There is some more shit you can do:
        e.g get all socials that can be changed in: <code class="border border-muted rounded p-0.5">content/footer.yml</code>
        <pre>{{ footer && footer.socials }}</pre>
      </UCard>
    </UContainer>
  </UPageBody>
</template>
