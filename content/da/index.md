---
title: Frigear
links: []
seo:
  title: Hjem
  description: Frigear er en non-profit organisation, udelukkende drevet af frivillige.
---

::u-page-hero
---
orientation: horizontal
---
:nuxt-img{.rounded-full .p-4 .dark:bg-neutral-800 .bg-neutral-200 .w-fit .md:max-w-full .mx-auto :height='320' :width='320' alt="Frigear FGR logo" format="webp" quality="80" src="/logo-with-rf-bg.jpg"}

#title
[{{ $doc.title }}]{.fancy-text} :br

  :::typewriter-effect
  Nonprofit
  Frivilligdrevet
  Projekstøtte
  Frivilligforening
  Event produktion
  Almennyttigt
  Skal du med?
  Bliv frivillig!
  :::

#links
  :::u-button
  ---
  color: primary
  icon: i-carbon-email
  size: xl
  to: /#contact
  variant: subtle
  class: flex-1 justify-center
  ---
  Kontakt os
  :::

  :::u-button
  ---
  color: primary
  size: xl
  to: /membership
  trailing-icon: i-lucide-arrow-right
  class: flex-1 justify-center
  ---
  Bliv medlem
  :::
::

::u-container{#contact .mb-6 .sm:mb-4 .flex .flex-col .lg:flex-row .md:justify-between .gap-2 .sm:gap-4 .px-1 .sm:px-3 .md:px-4 .lg:px-6}
  :::u-page-feature
  #title
  Kontakt os

  #description
  Smid os en besked hvis du har nogen spørgsmål, så vender en Frigear frivillig tilbage ASAP 💜 :br
  Tjek vores SoMe mens du venter 🐼

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
