import { db } from '@nuxthub/db'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const dbUser = await db.query.users.findFirst({
    where: (t, { eq }) => eq(t.id, user.id),
  })

  if (!dbUser) {
    throw createError({
      status: 404,
      message: 'User not found.',
    })
  }

  return {
    idCode: await generateAccessToken(
      dbUser,
      'FGR:ID',
      'id',
      getNitroOrigin(event),
      useRuntimeConfig().jwtPrivateKey,
      60,
    ),
    expiresIn: 60,
  }
})
