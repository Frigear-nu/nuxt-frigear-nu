import { defineTransformer } from '@nuxt/content'
import type { ValidValue } from '../shared/variables'
import { replaceVariablesInValues } from '../shared/variables'

export default defineTransformer({
  name: 'object-variable-replacement',
  // description: replaces ${variables} in yaml files.
  extensions: ['.yml'],
  transform(file) {
    const { id, __metadata, ...properties } = file
    const variables = (file?.variables || {}) as Record<string, ValidValue>
    const rootVariableKeys = Object.keys(variables)

    //
    if (rootVariableKeys.length === 0) return file

    const hasEnvironments = rootVariableKeys.length > 0
      ? typeof variables[rootVariableKeys[0]] === 'object'
      : false

    let variablesToReplace: Record<string, ValidValue> = variables
    const environment = ['production', 'staging', 'development'].includes(process.env.NODE_ENV || '')
      ? process.env.NODE_ENV as 'production' | 'staging' | 'development'
      : 'production'

    // ...
    if (hasEnvironments) {
      variablesToReplace = (
        variables[environment]
        || variables.production
        || variables
      ) as Record<string, ValidValue>
    }

    return {
      id,
      __metadata,
      ...replaceVariablesInValues(properties, variablesToReplace),
    }
  },
})
