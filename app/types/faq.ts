import type { PageCardProps, ButtonProps } from '@nuxt/ui'

type ForwardedProps = Pick<PageCardProps, 'title' | 'description' | 'icon' | 'to' | 'spotlight'>
export type FaqCardProps = ForwardedProps & {
  faqs?: {
    icon?: string
    trailingIcon?: string
    title: string
    details?: string
    lines?: string[]
    as?: string
  }[]
  links?: ButtonProps[]
  contact?: ButtonProps & {
    initial?: Record<string, string>
  }
}
