<script setup lang="ts">
import type { PublicPrice } from '#shared/types/membership'
import { useUserMemberships } from '~/store/queries/user'

const { locales, defaultLocale } = useSiteI18n()

const buildTranslatedField = (price: PublicPrice, field: 'title' | 'description'): string | Record<string, string> | undefined => {
  const result: Record<string, string> = {}
  for (const loc of locales.value) {
    const key = loc.code === defaultLocale.value
      ? field
      : `${field}_${loc.code}`
    const value = price[key as keyof PublicPrice] as string | null | undefined
    if (value) result[loc.code] = value
  }
  const keys = Object.keys(result)
  if (keys.length === 0) return undefined
  if (keys.length === 1) return result[keys[0]!]
  return result
}
const { loggedIn } = useUserSession()
const { clearCart, addToCart } = useShoppingCart()
const fetchUserMemberships = ref(false)
const { data: userMemberships } = useUserMemberships({ isEnabled: fetchUserMemberships })

defineProps<{
  mode: 'list' | 'tabs'
  orientation?: 'horizontal' | 'vertical'
}>()

const membershipPriceId = ref<string | undefined>()

watch(loggedIn, async (auth) => {
  if (!auth) {
    fetchUserMemberships.value = false
    membershipPriceId.value = undefined
    return
  }

  if (!fetchUserMemberships.value) {
    membershipPriceId.value = undefined
    fetchUserMemberships.value = true
  }
}, { immediate: true })

watch(userMemberships, (memberships) => {
  if (!memberships) return

  const [current] = memberships
  if (!current || !current.priceId) {
    membershipPriceId.value = undefined
    return
  }

  membershipPriceId.value = current.priceId
}, { immediate: true })

const onSelectMembership = (price: PublicPrice) => {
  clearCart()

  // we store the item in the localStorage cart - so it will persist as long as it is the same browser.
  addToCart({
    qty: 1,
    maxQty: 1,
    id: price.id,
    type: 'membership',
    price: price.price,
    title: buildTranslatedField(price, 'title') || price.title,
    description: buildTranslatedField(price, 'description') || price.description || undefined,
  })

  //
  if (loggedIn.value) return navigateTo(`/account/membership`)
  return navigateTo(`/sign-in?mode=up`)
}
</script>

<template>
  <MembershipTypes
    :mode="mode"
    :orientation="orientation"
    @select="onSelectMembership"
  >
    <template
      v-if="membershipPriceId"
      #button="{ item }"
    >
      <UButton
        :disabled="membershipPriceId === item.id"
        block
        :variant="membershipPriceId === item.id ? 'subtle' : undefined"
        @click="onSelectMembership(item as PublicPrice)"
      >
        {{ membershipPriceId === item.id ? $t('common.current') : $t('actions.select') }}
      </UButton>
    </template>
  </MembershipTypes>
</template>
