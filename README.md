# nuxt-frigear-nu

A simple website to demonstrate the [simple-content-site](https://github.com/hareland/simple-content-site) layer for
Nuxt.
This allows simple editing and management of a website simply using
markdown/[nuxt-content/mdc](https://github.com/nuxt-content/mdc) and yaml - soon also through a
UI [nuxt-content/studio](https://github.com/nuxt-content/studio).

## Structure

> Normally you will be working with the `content/` folder, as this is the easiest way to build things that can be edited
> in the visual editor.

1. [`./content`](./content) Contains all static content e.g pages written in markdown or dynamic configuration
2. [`./app`](./app) Contains the custom parts of the site, which gets injected elsewhere e.g the SiteContactForm was a
   bit hard to build in markdown, so a custom component is a good solution to
    - [`/app/components`](./app/components) Contains components used elsewhere in the app and pages inside `content`
3. [`./public`](./public) Add any media or files that you want served - it gets served from the ROOT path, e.g
   `./public/logo.png` will be placed on `website.com/logo.png` ->< this makes it a good candidate to place your
   ROBOTS.txt there.

## Local development

### Prerequisites

- Docker (also running when you require supabase)
- pnpm & npm

### 1. Clone repository

```bash
git clone https://github.com/Frigear-nu/nuxt-frigear-nu.git
```

### 2. Configure

```bash
cp .env.example .env
```

> **You must _fill out all_ the required variables in the new .env file**, most of the values will be output when you run
`pnpx supabase start` later on.

### 3. Install dependencies

```bash
pnpm install
```

### 4. Start supabase

```bash
pnpx supabase start
```

### 5. Start dev server

```bash
pnpm dev
```