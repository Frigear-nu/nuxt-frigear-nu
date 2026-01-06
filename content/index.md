---
title: Frigear
seo:
  title: frigear.nu
  description: ""
---

::u-page-hero
---
orientation: horizontal
---
:nuxt-img{.rounded-full.p-4.dark:bg-neutral-800.bg-neutral-200.max-w-sm.md:max-w-full.mx-auto :height='384' :width='384' alt="Frigear logo" src="https://frigear.nu/_next/image?url=%2Flogo_with_rf_bgr.jpg&w=384&q=75&dpl=dpl_4pDmg1nXvax7mLXtC2uekcFmQCT9"}

#title
[{{ $doc.title }}]{.text-primary} :br

  :::typewriter-effect
  Non-profit
  Frivillig drevet
  Forening og fond
  Projectorienteret
  Skal du være med?
  Bliv frivillig
  :::

#links
  :::u-button
  ---
  color: primary
  size: xl
  to: /#contact
  variant: subtle
  ---
  Kontakt os
  :::

  :::u-button{color="primary" size="xl" to="/pricing"}
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
