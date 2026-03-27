import { beforeEach, describe, it } from 'vitest'

describe('useShoppingCart', () => {
  let cart: ReturnType<typeof useShoppingCart>

  beforeEach(() => {
    cart = useShoppingCart()
    cart.clearCart()
  })

  describe('addToCart – CartItem type field', () => {
    it('stores a membership item', ({ expect }) => {
      cart.addToCart({
        id: 'price_membership_1',
        type: 'membership',
        title: 'Basic Membership',
        price: 10000,
      })

      expect(cart.data.value[0]?.type).toBe('membership')
    })

    it('stores a product item', ({ expect }) => {
      cart.addToCart({
        id: 'prod_ticket_1',
        type: 'product',
        title: 'Event Ticket',
        price: 5000,
      })

      expect(cart.data.value[0]?.type).toBe('product')
    })
  })

  describe('addToCart – title field', () => {
    it('stores a plain string title', ({ expect }) => {
      cart.addToCart({
        id: 'price_1',
        type: 'membership',
        title: 'Basic Membership',
        price: 10000,
      })

      expect(cart.data.value[0]?.title).toBe('Basic Membership')
    })

    it('stores a locale-keyed title record', ({ expect }) => {
      cart.addToCart({
        id: 'price_2',
        type: 'membership',
        title: { da: 'Basis Medlemskab', en: 'Basic Membership' },
        price: 10000,
      })

      expect(cart.data.value[0]?.title).toEqual({ da: 'Basis Medlemskab', en: 'Basic Membership' })
    })
  })

  describe('addToCart – description field', () => {
    it('stores a plain string description', ({ expect }) => {
      cart.addToCart({
        id: 'price_1',
        type: 'membership',
        title: 'Basic',
        description: 'A basic plan',
        price: 1000,
      })

      expect(cart.data.value[0]?.description).toBe('A basic plan')
    })

    it('stores a locale-keyed description record', ({ expect }) => {
      cart.addToCart({
        id: 'price_2',
        type: 'membership',
        title: 'Basic',
        description: { da: 'En grundlæggende plan', en: 'A basic plan' },
        price: 1000,
      })

      expect(cart.data.value[0]?.description).toEqual({ da: 'En grundlæggende plan', en: 'A basic plan' })
    })

    it('stores undefined when description is omitted', ({ expect }) => {
      cart.addToCart({
        id: 'price_3',
        type: 'membership',
        title: 'Basic',
        price: 1000,
      })

      expect(cart.data.value[0]?.description).toBeUndefined()
    })
  })

  describe('addToCart – qty behaviour', () => {
    it('defaults qty to 1 when not provided', ({ expect }) => {
      cart.addToCart({
        id: 'price_1',
        type: 'membership',
        title: 'Basic',
        price: 1000,
      })

      expect(cart.data.value[0]?.qty).toBe(1)
    })

    it('uses the provided qty', ({ expect }) => {
      cart.addToCart({
        id: 'prod_1',
        type: 'product',
        title: 'Ticket',
        price: 500,
        qty: 3,
      })

      expect(cart.data.value[0]?.qty).toBe(3)
    })

    it('increments qty when the same item is added again', ({ expect }) => {
      cart.addToCart({ id: 'prod_1', type: 'product', title: 'Ticket', price: 500, qty: 2 })
      cart.addToCart({ id: 'prod_1', type: 'product', title: 'Ticket', price: 500, qty: 1 })

      expect(cart.data.value).toHaveLength(1)
      expect(cart.data.value[0]?.qty).toBe(3)
    })

    it('stores maxQty when provided', ({ expect }) => {
      cart.addToCart({
        id: 'price_1',
        type: 'membership',
        title: 'Basic',
        price: 1000,
        maxQty: 1,
      })

      expect(cart.data.value[0]?.maxQty).toBe(1)
    })
  })

  describe('removeFromCart', () => {
    it('removes the matching item', ({ expect }) => {
      cart.addToCart({ id: 'item1', type: 'product', title: 'Item 1', price: 100 })
      cart.addToCart({ id: 'item2', type: 'product', title: 'Item 2', price: 200 })
      cart.removeFromCart('item1')

      expect(cart.data.value).toHaveLength(1)
      expect(cart.data.value[0]?.id).toBe('item2')
    })

    it('does nothing when the id is not in the cart', ({ expect }) => {
      cart.addToCart({ id: 'item1', type: 'product', title: 'Item 1', price: 100 })
      cart.removeFromCart('nonexistent')

      expect(cart.data.value).toHaveLength(1)
    })
  })

  describe('clearCart', () => {
    it('removes all items regardless of type', ({ expect }) => {
      cart.addToCart({ id: 'item1', type: 'product', title: 'Ticket', price: 100 })
      cart.addToCart({ id: 'price_1', type: 'membership', title: 'Plan', price: 500 })
      cart.clearCart()

      expect(cart.data.value).toHaveLength(0)
    })
  })

  describe('updateCartItem', () => {
    it('updates the qty of an existing item', ({ expect }) => {
      cart.addToCart({ id: 'item1', type: 'product', title: 'Ticket', price: 100, qty: 1 })
      cart.updateCartItem('item1', { qty: 5 })

      expect(cart.data.value[0]?.qty).toBe(5)
    })

    it('creates the item when it does not exist yet', ({ expect }) => {
      cart.updateCartItem('new_item', { type: 'product', title: 'New', price: 500, qty: 2 })

      expect(cart.data.value.some(i => i.id === 'new_item')).toBe(true)
    })
  })

  describe('hasItem', () => {
    it('returns true for an item in the cart', ({ expect }) => {
      cart.addToCart({ id: 'price_abc', type: 'membership', title: 'Plan', price: 200 })

      expect(cart.hasItem('price_abc')).toBe(true)
    })

    it('returns false for an item not in the cart', ({ expect }) => {
      expect(cart.hasItem('price_missing')).toBe(false)
    })
  })

  describe('getItem', () => {
    it('returns the full CartItem for a known id', ({ expect }) => {
      cart.addToCart({ id: 'price_abc', type: 'membership', title: { en: 'Plan' }, price: 200 })
      const item = cart.getItem('price_abc')

      expect(item?.id).toBe('price_abc')
      expect(item?.type).toBe('membership')
      expect(item?.title).toEqual({ en: 'Plan' })
    })

    it('returns undefined for an unknown id', ({ expect }) => {
      expect(cart.getItem('price_missing')).toBeUndefined()
    })
  })

  describe('hasAnyItems', () => {
    it('is false when the cart is empty', ({ expect }) => {
      expect(cart.hasAnyItems.value).toBe(false)
    })

    it('is true when the cart has at least one item', ({ expect }) => {
      cart.addToCart({ id: 'item1', type: 'product', title: 'Ticket', price: 100 })

      expect(cart.hasAnyItems.value).toBe(true)
    })

    it('returns to false after the last item is removed', ({ expect }) => {
      cart.addToCart({ id: 'item1', type: 'product', title: 'Ticket', price: 100 })
      cart.removeFromCart('item1')

      expect(cart.hasAnyItems.value).toBe(false)
    })
  })
})
