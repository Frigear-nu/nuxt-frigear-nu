<script setup lang="ts">
import type { PublicPrice } from '#shared/types/membership'

const { locale } = useSiteI18n()
const { loggedIn } = useUserSession()
const { clearCart, addToCart } = useShoppingCart()

defineProps<{
  mode: 'list' | 'tabs'
  orientation?: 'horizontal' | 'vertical'
}>()

const onSelectMembership = (price: PublicPrice) => {
  clearCart()

  // we store the item in the localStorage cart - so it will persist as long as it is the same browser.
  addToCart({
    qty: 1,
    maxQty: 1,
    id: price.id,
    price: price.price,
    // @ts-expect-error This is not typed
    title: price?.[`title_${locale.value}`] || price.title,
    // @ts-expect-error This is not typed
    description: price?.[`description_${locale.value}`] || price.description || undefined,
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
  />
</template>
