import { z } from 'zod/v4'
import { userRoles } from '#shared/schema/user'

export const adminCreateUserSchema = z.object({
  name: z.string(),
  email: z.email().toLowerCase(),
  role: z.enum(userRoles).default('user'),
  sendWelcomeEmail: z.boolean().default(true),
  emailVerified: z.boolean().default(false),
})

export type AdminCreateUserSchema = z.infer<typeof adminCreateUserSchema>

export const adminUpdateUserSchema = z.object({
  name: z.string(),
  email: z.email(),
  role: z.enum(userRoles),
})

export type AdminUpdateUserSchema = z.infer<typeof adminUpdateUserSchema>
