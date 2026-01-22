import { z } from 'zod'
import { createEmailSchema, createNameSchema } from './shared'

export const updateUserProfileSchema = z.object({
  name: createNameSchema(),
  // We want to have a separate process of changing email.
  // FIXME: Add verification for new email
  //  1. Send confirmation to new email.
  //  2. Change email in DB.
  //  3. Send info mail to old address.
  // email: createEmailSchema(),
  // FIXME: User avatars
  avatar: z.string().optional(),
})

export type UpdateUserProfileSchema = z.output<typeof updateUserProfileSchema>

export const changeUserEmailSchema = z.object({
  email: createEmailSchema(),
})

export type ChangeUserEmailSchema = z.output<typeof changeUserEmailSchema>
