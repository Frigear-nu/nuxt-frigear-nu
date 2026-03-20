import type { FormCollectionItem } from '@nuxt/content'
import { withLeadingSlash } from 'ufo'

const useFormAsAdmin = () => {
  const route = useRoute()
  const formPath = computed(() => Array.isArray(route.params.formPath) ? route.params.formPath.join('/') : route.params.formPath)

  return useAsyncData<FormCollectionItem>(() => `admin:form:${toValue(formPath)}`, async () => {
    const form = await queryCollection('forms').path(withLeadingSlash(toValue(formPath))).first()

    if (!form) {
      throw createError({
        status: 404,
        message: 'Form not found',
      })
    }

    return form
  })
}

export default useFormAsAdmin
