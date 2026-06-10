import { db, schema } from '@nuxthub/db'
import type {
  NewUsers,
  // NewStripeCustomers,
  // NewStripePrices,
  // NewStripeProducts,
  // NewStripeSubscriptions,
} from '@nuxthub/db/schema'
import { defu } from 'defu'

export default defineTask({
  meta: {
    name: 'db:seed',
  },
  async run() {
    const users = await Promise.all([
      createOrFindUser({ email: 'admin@app.localhost' }),
      createOrFindUser({ email: 'manager@app.localhost', role: 'manager' }),
      createOrFindUser({ email: 'coordinator@app.localhost', role: 'coordinator' }),
      createOrFindUser({ email: 'member@app.localhost', role: 'member' }),
      createOrFindUser({ email: 'user@app.localhost', role: 'user' }),
    ])

    // All users:
    // stripe integraiton specific
    const { stripe: { key: stripeKey } } = useRuntimeConfig()
    if (stripeKey) {
      // 1. Ensure all users have a stripe customer
      await Promise.all(users.map(ensureStripeCustomer))

      // 2. Ensure all suers have a subscription
      // TODO...
    }

    // Specific users:
    // const [adminUser, managerUser, coordinatorUser, memberUser, userUser] = users
    //

    return {
      result: {
        users: users.map(user => user.email),
      },
    }
  },
})

const createOrFindUser = async (
  props: Partial<NewUsers>,
) => {
  const user = defu(props, {
    email: 'admin@app.localhost',
    role: 'admin',
    passwordHash: await hashPassword('12345678'),
    emailVerifiedAt: new Date(),
  }) as NewUsers

  let foundUser = await db.query.users.findFirst({
    where: (t, { eq }) => eq(t.email, user.email),
  })

  if (!foundUser) {
    [foundUser] = await db.insert(schema.users)
      .values(user)
      .returning()
  }

  if (!foundUser) {
    throw new Error('Could not find user...')
  }

  return foundUser
}
