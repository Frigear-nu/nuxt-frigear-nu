import type { FormsCollectionItem } from '@nuxt/content'
import { withLeadingSlash } from 'ufo'
import { NotFoundError } from '@nitrotool/errors'

const useFormAsAdmin = () => {
  const route = useRoute()
  const formPath = computed(() => Array.isArray(route.params.formPath) ? route.params.formPath.join('/') : route.params.formPath)

  return useAsyncData<FormsCollectionItem>(() => `admin:form:${toValue(formPath)}`, async () => {
    const form = await queryCollection('forms').path(withLeadingSlash(toValue(formPath))).first()

    if (!form) {
      throw NotFoundError()
    }

    return form
  }, {
    watch: [formPath, () => route.fullPath],
  })
}

export default useFormAsAdmin
