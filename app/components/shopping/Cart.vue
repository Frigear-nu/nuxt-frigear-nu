<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'

const { data: cartItems, hasAnyItems, isOpen } = useShoppingCart()

const emptyActions = computed<ButtonProps[]>(() => [{
  label: 'Browse events',
  variant: 'soft',
  trailingIcon: 'i-lucide-arrow-right',
  onClick() {
    isOpen.value = false
    navigateTo('/events')
  },
}])
</script>

<template>
  <div class="flex flex-col gap-4">
    <template v-if="hasAnyItems">
      <ShoppingCartItem
        v-for="(item, index) in cartItems"
        :key="index"
        :item="item"
      />
    </template>
    <UEmpty
      v-else
      icon="i-lucide-shopping-cart"
      title="No items :/"
      description="Add some items to your cart."
      :actions="emptyActions"
    />
  </div>
</template>
