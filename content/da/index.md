---
title: Frigear
links: []
seo:
  title: frigear.nu
  description: Frigear er en non-profit som er udviklet af frivillige.
---

::u-page-hero
---
orientation: horizontal
---
:nuxt-img{.rounded-full.p-4.dark:bg-neutral-800.bg-neutral-200.w-fit.md:max-w-full.mx-auto :height='250' :width='250' alt="Frigear logo" format="webp" quality="70" src="/logo-with-rf-bg.jpg"}

#title
[{{ $doc.title }}]{.fancy-text}

  :::typewriter-effect
  Non-profit
  Frivillig
  Fond
  Forening
  Projecter
  Er du med?
  Bliv frivillig nu!
  :::

#links
  :::u-button
  ---
  color: primary
  icon: i-carbon-email
  size: xl
  to: /#contact
  variant: subtle
  ---
  Kontakt os
  :::

  :::u-button
  ---
  color: primary
  size: xl
  to: /membership
  trailing-icon: i-lucide-arrow-right
  ---
  Bliv medlem
  :::
::

::u-container{#contact .mb-4.flex.flex-col.lg:flex-row.md:justify-between.gap-4}
  :::u-page-feature
  #title
  Kontakt os

  #description
  Smid os en besked hvis du har nogen spørgsmål, så vender en Frigear frivillig tilbage ASAP 💜 :br
  Tjek vores SoMe mens du venter 🐼

  :u-separator

    ::::div{.my-2.flex.gap-2}
      :::::u-button
      ---
      icon: i-simple-icons-instagram
      size: xl
      target: _blank
      to: https://www.instagram.com/frigear.nu
      variant: subtle
      ---
      :::::

      :::::u-button
      ---
      icon: i-simple-icons-facebook
      size: xl
      target: _blank
      to: https://www.facebook.com/Frigear.nu
      variant: subtle
      ---
      :::::

      :::::u-button
      ---
      icon: i-simple-icons-linkedin
      size: xl
      target: _blank
      to: https://www.linkedin.com/company/frigear
      variant: subtle
      ---
      :::::
    ::::
  :::

  :::u-card{.w-full.lg:w-lg variant="subtle"}
  :site-contact-form
  :::
::
