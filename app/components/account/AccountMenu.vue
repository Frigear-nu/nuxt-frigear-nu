<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'
import type { NuxtLinkProps } from '#app'
import { useAuth, useSiteI18n } from '#imports'
import { allows } from 'nuxt-authorization/utils'
import { isAdmin } from '#shared/abilities/admin'

const route = useRoute()
const { t, localePath } = useSiteI18n()
const { signOut, currentUser } = useAuth()
const { clearCart } = useShoppingCart()

const onSignOut = async () => {
  clearCart()
  await signOut()

  if (!route.path.startsWith('/account')) {
    // FIXME: This should probably be handled in a better way.
    document.location.reload()
    return
  }
  await navigateTo(localePath('/'))
}

const { data: items } = await useAsyncData('account-menu-items', async () => {
  const baseItems: ButtonProps[] = [
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
  ]

  if (await allows(isAdmin, currentUser.value)) {
    baseItems.unshift({
      label: 'Admin',
      to: localePath('/admin'),
      icon: 'i-lucide-shield-question-mark',
    })
  }

  return baseItems
})
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
      :aria-label="t('account.menu.label')"
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
