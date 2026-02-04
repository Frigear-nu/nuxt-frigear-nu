<script setup lang="ts">
import type { PageCollections } from '@nuxt/content'
import type { Locale } from 'vue-i18n'
import * as nuxtUiLocales from '@nuxt/ui/locale'

const { seo } = useAppConfig()
const site = useSiteConfig()
const { locale, locales, isEnabled, switchLocalePath } = useSiteI18n()

const lang = computed(() => nuxtUiLocales[locale.value as keyof typeof nuxtUiLocales]?.code || 'en')
const dir = computed(() => nuxtUiLocales[locale.value as keyof typeof nuxtUiLocales]?.dir || 'ltr')
const collectionName = computed(() => isEnabled.value ? `pages_${locale.value}` : 'pages')

useHead({
  meta: [
    // Nuxt includes viewport by default, -parashute mode? ;).
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ],
  link: [
    // 1) Modern browsers: SVG favicon
    // { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    // 2) PNG fallback (96x96)
    // { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon-96x96.png' },
    // 3) Legacy / "make it work everywhere" fallback (Holds both 32x32 & 64x64)
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    // 4) iOS home screen icon
    // { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
    // 5) PWA manifest
    // { rel: 'manifest', href: '/manifest.webmanifest' },
  ],
  htmlAttrs: {
    lang,
    dir,
  },
})

useSeoMeta({
  titleTemplate: seo.titleTemplate,
  title: seo.title,
  description: seo.description,
  ogSiteName: site.name,
  twitterCard: 'summary_large_image',
})

if (isEnabled.value) {
  const route = useRoute()
  const defaultLocale = useRuntimeConfig().public.i18n.defaultLocale! as Locale
  onMounted(() => {
    const currentLocale = route.path.split('/')[1]
    if (!locales.some(locale => locale.code === currentLocale)) {
      return navigateTo(switchLocalePath(defaultLocale) as string)
    }
  })
}

const { data: navigation } = await useAsyncData(() => `navigation_${collectionName.value}`, () => queryCollectionNavigation(collectionName.value as keyof PageCollections), {
  transform: (data) => {
    const rootResult = data.find(item => item.path === '/pages')?.children || data || []

    return rootResult.find(item => item.path === `/${locale.value}`)?.children || rootResult
  },
  watch: [locale],
})
const { data: files } = useLazyAsyncData(`search_${collectionName.value}`, () => queryCollectionSearchSections(collectionName.value as keyof PageCollections), {
  server: false,
})

provide('navigation', navigation)
</script>

<template>
  <UApp
    :locale="nuxtUiLocales[locale as keyof typeof nuxtUiLocales]"
    :toaster="{ position: 'top-right' }"
  >
    <NuxtLoadingIndicator color="var(--ui-primary)" />

    <AppHeader v-if="$route.meta.header !== false" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <AppFooter v-if="$route.meta.footer !== false" />

    <ClientOnly>
      <LazyUContentSearch
        :files="files"
        :navigation="navigation"
      />
    </ClientOnly>
  </UApp>
</template>
