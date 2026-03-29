<script setup lang="ts">
const props = defineProps<{
  item: CartItem
}>()

const { updateCartItem, removeFromCart } = useShoppingCart()
const { translatedProperty } = useContent()

const qtyInput = computed({
  get: () => props.item.qty,
  set: (qty: number) => updateCartItem(props.item.id, { qty }),
})

const resolvedTitle = computed(() => translatedProperty(props.item.title) ?? '')
const resolvedDescription = computed(() => translatedProperty(props.item.description))
</script>

<template>
  <div
    class="flex flex-col gap-2"
  >
    <div class="flex justify-between">
      <div class="text-lg font-semibold">
        {{ resolvedTitle }}
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
        :value="resolvedDescription"
        unwrap
      >
        <MDCRenderer
          v-if="body"
          :body="body"
          :data="{ ...data, ticket: resolvedTitle }"
          unwrap
        />
      </MDC>
    </div>
    <div class="flex justify-end">
      <UInputNumber
        v-model="qtyInput"
        :max="item.maxQty"
      />
    </div>
  </div>
</template>
