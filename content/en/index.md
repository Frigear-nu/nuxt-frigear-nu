---
title: Frigear
links: []
seo:
  title: Home
  description: Frigear is a nonprofit organization, solely run by volunteers.
---

::u-page-hero
---
orientation: horizontal
---
:nuxt-img{.rounded-full.p-4.dark:bg-neutral-800.bg-neutral-200.w-fit.md:max-w-md.mx-auto.md:justify-self-end-safe.md:mr-12 :height="auto" :width="380" alt="Frigear FGR logo" format="webp" quality="70" src="/logo-with-rf-bg.jpg"}

#title
[{{ $doc.title }}]{.fancy-text.text-7xl.md:text-8xl} :br :br

  :::typewriter-effect{.mt-0 .block .leading-tight .min-h-[2.4em] .sm:min-h-[1.1em] .text-wrap .sm:text-nowrap}
  Nonprofit
  Volunteer run
  Project funding
  Volunteer organization
  Event production
  For the common good
  You wanna join?
  Become a volunteer!
  :::

#links
  :::u-button
  ---
  color: primary
  icon: i-carbon-email
  size: xl
  to: /en/#contact
  variant: subtle
  class: flex-1 justify-center
  ---
  Get in touch
  :::

  :::u-button
  ---
  color: primary
  size: xl
  to: /en/membership
  trailing-icon: i-lucide-arrow-right
  class: flex-1 justify-center
  ---
  Membership
  :::
::

::u-container{#contact .mb-6 .sm:mb-4 .flex .flex-col .lg:flex-row .md:justify-between .gap-2 .sm:gap-4 .px-1 .sm:px-3 .md:px-4 .lg:px-6}
  :::u-page-feature
  #title
  Contact us

  #description
  Send us a message if you have any questions, a Frigear volunteer will get back to you ASAP 💜 :br
  Check our social media while you are waiting 🐼

  :u-separator

    ::::div{.mb-4 .sm:mb-2 .mt-4 .sm:mt-2 .flex .gap-2}
      :::::u-button
      ---
      title: Frigear Instagram
      icon: i-simple-icons-instagram
      size: xl
      target: _blank
      rel: "noopener noreferrer"
      to: https://www.instagram.com/frigear.nu
      variant: subtle
      ---
      :::::

      :::::u-button
      ---
      title: Frigear Facebook
      icon: i-simple-icons-facebook
      size: xl
      target: _blank
      rel: "noopener noreferrer"
      to: https://www.facebook.com/Frigear.nu
      variant: subtle
      ---
      :::::

      :::::u-button
      ---
      title: Frigear LinkedIn
      icon: i-simple-icons-linkedin
      size: xl
      target: _blank
      rel: "noopener noreferrer"
      to: https://www.linkedin.com/company/frigear
      variant: subtle
      ---
      :::::
      
      :::::u-button
      ---
      title: Frigear TikTok
      icon: i-simple-icons-tiktok
      size: xl
      target: _blank
      rel: "noopener noreferrer"
      to: https://www.tiktok.com/@frigear.nu
      variant: subtle
      ---
      :::::
      
      :::::u-button
      ---
      title: Frigear YouTube
      icon: i-simple-icons-youtube
      size: xl
      target: _blank
      rel: "noopener noreferrer"
      to: https://www.youtube.com/@frigear
      variant: subtle
      ---
      :::::
    ::::
  :::

  :::u-card{.w-full .lg:w-lg}
  ---
  variant: subtle
  ui:
    body: p-2 sm:p-4
  ---
  
  :site-contact-form
  :::
::
