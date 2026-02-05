import { createSharedComposable, useLocalStorage } from '@vueuse/core'
import type { CartItem } from '#shared/types/shopping-cart'

type OptionalKeys = 'qty'
type AddCartItem = Omit<CartItem, OptionalKeys> & Partial<Pick<CartItem, OptionalKeys>>
type UpdateCartItem = Omit<AddCartItem, 'id'>

const _useShoppingCart = () => {
  const data = useLocalStorage<CartItem[]>('cart', [])

  const hasAnyItems = computed(() => data.value.length > 0)
  const clearCart = () => data.value = []

  const addToCart = (item: AddCartItem) => {
    const existingItem = data.value.find(i => i.id === item.id)

    if (existingItem) {
      existingItem.qty += item.qty ?? 1
      return
    }
    return data.value.push({
      qty: 1,
      ...item,
    })
  }

  const updateCartItem = (id: CartItem['id'], item: UpdateCartItem) => {
    const existing = data.value.find(i => i.id === id)

    if (existing) {
      return Object.assign(existing, item)
    }

    return addToCart({ ...item, id })
  }

  const removeFromCart = (id: string) => {
    const index = data.value.findIndex(i => i.id === id)
    if (index === -1) return
    data.value.splice(index, 1)
  }

  return {
    data,
    clearCart,
    hasAnyItems,
    addToCart,
    updateCartItem,
    removeFromCart,
  }
}

export const useShoppingCart = createSharedComposable(_useShoppingCart)
