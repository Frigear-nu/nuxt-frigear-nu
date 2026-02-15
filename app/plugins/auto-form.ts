import { InputDatePicker } from '#components'

export default defineNuxtPlugin(() => {
  updateAppConfig({
    autoForm: {
      components: {
        date: () => ({ component: InputDatePicker, props: { type: 'date' } }),
      },
    },
  })
})
