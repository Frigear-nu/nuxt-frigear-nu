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
:nuxt-img{.rounded-full.p-4.dark:bg-neutral-800.bg-neutral-200.w-fit.md:max-w-full.mx-auto :height='250' :width='250' alt="Frigear logo" format="webp" quality="70" src="/logo-with-rf-bg.jpg"}

#title
[{{ $doc.title }}]{.fancy-text} :br

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
      title: Frigear Instagram
      icon: i-simple-icons-instagram
      size: xl
      target: _blank
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
      to: https://www.youtube.com/@frigear
      variant: subtle
      ---
      :::::
    ::::
  :::

  :::u-card{.w-full.lg:w-lg variant="subtle"}
  :site-contact-form
  :::
::
