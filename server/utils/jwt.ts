import type { z, ZodSchema } from 'zod'
import type { ExtendableJwtPayload } from '@nitrotool/jwt/core'

export const useValidatedJwt = async <T extends ZodSchema>(
  jwt: string,
  schema: T,
): Promise<ExtendableJwtPayload<z.infer<T>>> => {
  const decoded = await decodeJwt(jwt)

  // parse with zod schema, ensuring types are respected
  return schema.parse(decoded) as ExtendableJwtPayload<z.infer<T>>
}
