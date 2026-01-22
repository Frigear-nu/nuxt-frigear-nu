import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { ClientError } from '@nitrotool/errors'
import { useValidatedQuery } from 'h3-zod'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  const { token } = await useValidatedQuery(event, z.object({
    token: z.string(),
  }))

  const { sub: userId, oldEmail } = await useValidatedJwt(token, z.object({
    sub: z.coerce.number().int().positive(),
    oldEmail: z.string().email(),
  }))

  const [revertedUser] = await db.update(schema.users)
    .set({ email: oldEmail })
    .where(eq(schema.users.id, userId))
    .returning()

  if (!revertedUser) throw ClientError()

  await clearUserSession(event)

  return sendRedirect(event, user ? '/account' : '/sign-in')
})
