This project is based on [Nuxt v4](https://nuxt.com), [Nitro v2](https://v2.nitro.build) [h3](https://h3.dev/)



Refer to `node_modules/nuxt/dist/README.md` when working on nuxt code.


## Project Structure

`app/` contains nuxt/vue code (pages/components/composables/plugins/utils/store (pinia colada))
`server/` contains server-side code with supported subdirs (create as needed): `api/` (/api prefixed handlers), `routes/` (non-prefixed route handlers), `middleware/`, `plugins/`, `utils/`, `assets/`, and `tasks/`. `public/` holds static assets (copied, not bundled).
`shared/` contains schemas, and types and other utils that are shared between the app and the server.
`i18n/` contains locale files and the locale detector.
`modules/` contains custom nuxt modules.

Config files: `nuxt.config.ts` (routeRules, hub, preset, etc.), `tsconfig.json`.
