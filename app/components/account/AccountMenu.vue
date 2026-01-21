<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'
import type { NuxtLinkProps } from '#app'
import { useAuth, useSiteI18n } from '#imports'

const { t, localePath } = useSiteI18n()
const { signOut } = useAuth()

const onSignOut = async () => {
  await signOut()
  await navigateTo(localePath('/'))
}

const items = computed<ButtonProps[]>(() => ([
  {
    label: t('auth.dashboard'),
    to: localePath('/account'),
    icon: 'i-lucide-layout-dashboard',
  },
  {
    label: t('auth.signOut'),
    icon: 'i-lucide-log-out',
    to: '#',
    onClick: onSignOut,
  },
]))
</script>

<template>
  <UPopover
    :mode="$device.isMobile ? 'click' : 'hover'"
    :content="{ align: 'end' }"
  >
    <UButton
      color="neutral"
      variant="ghost"
      class="size-8"
      icon="i-lucide-user"
    />

    <template #content>
      <ul class="flex flex-col">
        <li
          v-for="linkItem in items"
          :key="linkItem.label"
        >
          <NuxtLink
            class="flex justify-between py-1.5 px-2 gap-1 hover:bg-muted"
            :aria-label="linkItem.label"
            v-bind="linkItem as NuxtLinkProps"
          >
            <span class="text-sm">
              {{ linkItem.label }}
            </span>
            <span class="size-5 text-center">
              <UIcon :name="linkItem.icon || 'i-lucide-x'" />
            </span>
          </NuxtLink>
        </li>
      </ul>
    </template>
  </UPopover>
</template>
