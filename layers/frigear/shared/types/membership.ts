export type PublicPrice = {
  id: string
  images: string[] | null
  title: string
  title_en?: string
  description: string | null
  description_en?: string
  price: number
  currency: string
  interval: string | 'month' | 'year'
  intervalCount: number
}
