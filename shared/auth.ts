import { z } from 'zod'

export const signUpSchema = z.object({
  // todo: add this field to sign up form.
  name: z.string().optional().default(''),
  email: z.email(),
  password: z.string().min(6),
  redirect: z.string().optional(),
})

export type SignUpSchema = z.infer<typeof signUpSchema>
