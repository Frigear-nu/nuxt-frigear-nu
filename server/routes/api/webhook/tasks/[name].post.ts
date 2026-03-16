import { requireJwt } from '@nitrotool/jwt'

export default defineEventHandler(async (event) => {
  const name = getRouterParam(event, 'name')

  if (!name) throw createError({ status: 400, message: 'Missing name' })

  if (!import.meta.dev) {
    await requireJwt(event)
  }

  return await runTask(name, {})
})
