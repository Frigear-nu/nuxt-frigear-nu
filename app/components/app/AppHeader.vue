<script setup lang="ts">
import { useSiteHeader, useSiteI18n } from '#imports'

const { data: header } = await useSiteHeader()

const appConfig = useAppConfig()
const site = useSiteConfig()
const { data: cartItems, hasAnyItems, isOpen: cartIsOpen, checkout } = useShoppingCart()

const { localePath, isEnabled, locales } = useSiteI18n()
</script>

<template>
  <UHeader
    :ui="{ center: header?.navigation && header.navigation.length > 0 ? '' : 'flex-1' }"
    :to="localePath('/')"
    :title="header?.title || appConfig.header?.title || site.name"
  >
    <template #title>
      <AppHeaderLogo class="h-6 w-auto shrink-0" />
    </template>

    <AppHeaderCenter />
    <template #right>
      <template v-if="isEnabled && locales.length > 1">
        <ClientOnly>
          <LanguageSelect />

          <template #fallback>
            <div class="h-8 w-8 animate-pulse bg-neutral-200 dark:bg-neutral-800 rounded-md" />
          </template>
        </ClientOnly>

        <USeparator
          orientation="vertical"
          class="h-8"
        />
      </template>

      <!--      <UContentSearchButton class="lg:hidden" /> -->

      <AppHeaderCTA />
      <UChip
        v-if="cartItems.length > 0"
        :text="cartItems.length"
        size="xl"
        :ui="{ base: 'p-1 size-3 dark:ring-primary dark:bg-red-500' }"
      >
        <UButton
          v-if="hasAnyItems"
          icon="i-lucide-shopping-cart"
          variant="solid"
          @click="cartIsOpen = !cartIsOpen"
        />
      </UChip>
      <ClientOnly>
        <UColorModeButton />

        <template #fallback>
          <div class="h-8 w-8 animate-pulse bg-neutral-200 dark:bg-neutral-800 rounded-md" />
        </template>
      </ClientOnly>
    </template>

    <template #toggle="{ open, toggle }">
      <IconMenuToggle
        :open="open"
        class="lg:hidden"
        @click="toggle"
      />
    </template>

    <template #body>
      <AppHeaderBody />
    </template>
  </UHeader>
  <USlideover
    v-model:open="cartIsOpen"
    :title="$t('cart.title')"
    :ui="{ footer: 'justify-between' }"
  >
    <template #body>
      <ShoppingCart class="h-full" />
    </template>
    <template #footer="{ close }">
      <UButton
        :label="$t('common.close')"
        color="neutral"
        variant="outline"
        icon="i-lucide-x"
        size="xl"
        @click="close"
      />
      <UButton
        :label="$t('cart.continueToPayment')"
        color="neutral"
        size="xl"
        @click="checkout"
      />
    </template>
  </USlideover>
</template>
