import { z } from 'zod'
import { createEmailSchema, createNameSchema } from './shared'

export const updateUserProfileSchema = z.object({
  name: createNameSchema(),
  email: createEmailSchema(),
  // FIXME: User avatars
  avatar: z.string().optional(),
})

export type UpdateUserProfileSchema = z.output<typeof updateUserProfileSchema>
