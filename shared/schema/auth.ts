import { z } from 'zod'

export const signUpSchema = z.object({
  // todo: add this field to sign up form.
  name: z.string().optional().default(''),
  email: z.email(),
  password: z.string().min(6),
  redirect: z.string().optional(),
})

export type SignUpSchema = z.infer<typeof signUpSchema>

export const forgotPasswordSchema = z.object({
  email: z.email(),
})

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>

export const signInWithPasswordSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  redirect: z.string().optional(),
})

export type SignInWithPasswordSchema = z.infer<typeof signInWithPasswordSchema>

export const signUpWithPasswordSchema = signInWithPasswordSchema.extend({
  name: z.string().min(2, 'errors.user.name.minLength'),
})

export type SignUpWithPasswordSchema = z.infer<typeof signUpWithPasswordSchema>

export const signInWithMagicLinksSchema = z.object({
  token: z.string(),
  redirect: z.string().optional(),
})

export type SignInWithMagicLinksSchema = z.infer<typeof signInWithMagicLinksSchema>

export const magicLinkSchema = z.object({
  email: z.email(),
  redirect: z.string().optional(),
})

export type MagicLinkSchema = z.infer<typeof magicLinkSchema>
