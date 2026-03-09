export default defineAppConfig({
  site: {
    name: 'Frigear.nu',
  },
  ui: {
    section: {
      container: 'w-full max-w-(--ui-container) mx-auto px-0 sm:px-3 lg:px-6 flex flex-col lg:grid py-8 sm:py-16 lg:py-24 gap-6 sm:gap-12',
    },
    pageHero: {
      container: 'w-full max-w-(--ui-container) mx-auto px-2 sm:px-4 lg:px-6 flex flex-col lg:grid py-12 sm:py-16 lg:py-24 gap-12 sm:gap-y-10',
      slots: {
        title: 'text-4xl sm:text-7xl text-pretty tracking-tight font-bold text-highlighted',
      },
    },
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
