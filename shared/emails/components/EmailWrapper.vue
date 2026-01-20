<script lang="ts" setup>
import { Body, Head, Html, Tailwind } from '@vue-email/components'
</script>

<template>
  <Html lang="en">
    <Head />
    <Body>
      <Tailwind>
        <slot />
      </Tailwind>
    </Body>
  </Html>
</template>
