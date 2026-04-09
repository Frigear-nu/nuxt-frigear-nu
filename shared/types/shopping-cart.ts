export type CartItemType = 'membership' | 'product'

export type CartItem = {
  id: string
  type: CartItemType
  title: string | Record<string, string>
  description?: string | Record<string, string>
  price: number
  qty: number
  maxQty?: number
}
