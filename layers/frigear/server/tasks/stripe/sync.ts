type KeyedCount<Key extends string> = Record<Key, string>

export default defineTask({
  async run() {
    const results = await Promise.allSettled([
      runTask<KeyedCount<'products'>>('stripe:sync:products'),
      runTask<KeyedCount<'prices'>>('stripe:sync:prices'),
      runTask<KeyedCount<'customers'>>('stripe:sync:customers'),
      runTask<KeyedCount<'subscriptions'>>('stripe:sync:subscriptions'),
    ])

    const mappedResult = Object.fromEntries(
      results
        .filter(r => r.status === 'fulfilled')
        .map((r) => {
          const result = r.value.result as KeyedCount<string>
          const scope = Object.keys(result)[0]
          const count = Object.values(result)[0]
          return [scope, count]
        }),
    )

    return {
      result: mappedResult,
    }
  },
})
