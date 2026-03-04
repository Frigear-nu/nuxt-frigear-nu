<script setup lang="ts">
import { useSiteHeader } from '#imports'

const appConfig = useAppConfig()
const device = useDevice()
const { data: header } = await useSiteHeader()

const appLogo = computed(() => appConfig.header?.logo)
const headerLogo = computed(() => header.value?.logo)

const smallLogo = computed(() => header.value?.meta?.smallLogo || undefined)

const logoLight = computed(() => {
  if (smallLogo.value && device.isMobile && smallLogo.value.light) {
    return smallLogo.value.light
  }
  return headerLogo.value?.light || appLogo.value?.light || appLogo.value?.dark
})

const logoDark = computed(() => {
  if (smallLogo.value && device.isMobile && smallLogo.value.dark) {
    return smallLogo.value.dark
  }
  return headerLogo.value?.dark || headerLogo.value?.light || appLogo.value?.dark || appLogo.value?.light
})

const logoAlt = computed(() => headerLogo.value?.alt || appLogo.value?.alt || header.value?.title)
const logoClass = computed(() => headerLogo.value?.class || [])

const showLogo = computed(() => !!(headerLogo.value || appLogo.value?.dark || appLogo.value?.light))
const title = computed(() => header.value?.title || appConfig.header?.title || '{appConfig.header.title}')
</script>

<template>
  <UColorModeImage
    v-if="showLogo"
    :light="logoLight"
    :dark="logoDark"
    :alt="logoAlt"
    :class="logoClass"
    loading="eager"
  />
  <span v-else>{{ title }}</span>
</template>
