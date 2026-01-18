import type { Users } from 'hub:db:schema'
import { eq } from 'drizzle-orm'

export const findUserByEmail = (email: string): Promise<Users | null> => {
  // @ts-expect-error There is some typing issue with drizzle for now
  return db.query.users.findFirst({ where: eq(schema.users.email, email) })
}
