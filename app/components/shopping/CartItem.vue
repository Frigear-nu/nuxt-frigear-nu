<script setup lang="ts">
const props = defineProps<{
  item: CartItem
}>()

const { updateCartItem, removeFromCart } = useShoppingCart()

const qtyInput = computed({
  get: () => props.item.qty,
  set: (qty: number) => updateCartItem(props.item.id, { qty }),
})
</script>

<template>
  <div
    class="flex flex-col gap-2"
  >
    <div class="flex justify-between">
      <div class="text-lg font-semibold">
        {{ item.title }}
      </div>
      <div>
        <UButton
          icon="i-lucide-trash"
          @click="removeFromCart(item.id)"
        />
      </div>
    </div>
    <div>
      <MDC
        v-slot="{ body, data }"
        class="text-muted"
        :value="item.description"
        unwrap
      >
        <MDCRenderer
          v-if="body"
          :body="body"
          :data="{ ...data, ticket: item.title }"
          unwrap
        />
      </MDC>
    </div>
    <div class="flex justify-end">
      <UInputNumber
        v-model="qtyInput"
      />
    </div>
  </div>
</template>
