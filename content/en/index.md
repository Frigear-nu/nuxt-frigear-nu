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
:nuxt-img{.rounded-full.p-4.dark:bg-neutral-800.bg-neutral-200.max-w-1/2.md:max-w-full.mx-auto :height='384' :width='384' alt="Frigear logo" format="webp" height="384" quality="70" src="/logo-with-rf-bg.jpg" width="384"}

#title
[{{ $doc.title }}]{.bg-gradient-to-r.from-primary-600.to-purple-600.bg-clip-text.text-transparent} :br

  :::typewriter-effect
  Non-profit
  Volunteer now
  :::

#links
  :::u-button
  ---
  color: primary
  size: xl
  to: /#contact
  variant: subtle
  ---
  Contact us
  :::

  :::u-button{color="primary" size="xl" to="/pricing"}
  Become a member
  :::
::

::u-container{#contact .mb-4.flex.flex-col.lg:flex-row.md:justify-between.gap-4}
  :::u-page-feature
  #title
  Contact us

  #description
  Send us a message if you have any questions, a Frigear volunteer will get back to you ASAP 💜 :br
  Check our social media while you are waiting 🐼

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
