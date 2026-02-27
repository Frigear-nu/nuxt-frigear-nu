export default defineAppConfig({
  site: {
    name: 'Frigear.nu',
  },
  ui: {
    colors: {
      primary: 'violet',
      neutral: 'neutral',
      secondary: 'indigo',
    },
    collapsible: {
      slots: {
        root: '',
        content: 'data-[state=open]:animate-[collapsible-down_300ms_ease-in-out] data-[state=closed]:animate-[collapsible-up_400ms_ease-in-out] overflow-hidden',
      },
    },
  },
})
