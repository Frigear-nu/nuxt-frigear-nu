<template>
  <ESection style="background-color: #f8f9fa; padding: 20px;">
    <EContainer>
      <EImg
        :src="logoUrl"
        alt="Company Logo"
        :width="150"
        style="display: block; margin: 0 auto;"
      />
    </EContainer>
  </ESection>
</template>

<script setup lang="ts">
interface Props {
  logoUrl?: string
}

withDefaults(defineProps<Props>(), {
  logoUrl: '/logo.png',
})
</script>
