import { describe, it } from 'vitest'

describe('useShoppingCart', () => {
  it('can add a membership item', ({ expect }) => {
    const cart = useShoppingCart()
    cart.clearCart()
    cart.addToCart({ id: 'price_1', type: 'membership', title: 'Basic Membership', price: 1000 })
    expect(cart.data.value[0]?.type).toBe('membership')
  })

  it('can add a product item', ({ expect }) => {
    const cart = useShoppingCart()
    cart.clearCart()
    cart.addToCart({ id: 'prod_1', type: 'product', title: 'Event Ticket', price: 500 })
    expect(cart.data.value[0]?.type).toBe('product')
  })

  it('supports a translated title', ({ expect }) => {
    const cart = useShoppingCart()
    cart.clearCart()
    cart.addToCart({ id: 'price_2', type: 'membership', title: { da: 'Basis', en: 'Basic' }, price: 1000 })
    expect(cart.data.value[0]?.title).toEqual({ da: 'Basis', en: 'Basic' })
  })

  it('can remove an item', ({ expect }) => {
    const cart = useShoppingCart()
    cart.clearCart()
    cart.addToCart({ id: 'prod_1', type: 'product', title: 'Ticket', price: 500 })
    cart.removeFromCart('prod_1')
    expect(cart.hasAnyItems.value).toBe(false)
  })
})
