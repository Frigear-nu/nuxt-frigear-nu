import type { Users } from 'hub:db:schema'

export const findUserByEmail = (email: string): Promise<Users | null> => {
  // @ts-expect-error There is some typing issue with drizzle for now
  return db.query.users.findFirst({ where: { email } })
}
