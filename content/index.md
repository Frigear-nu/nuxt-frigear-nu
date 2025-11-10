---
title: "Frigear"
seo:
  title: 'frigear.nu'
---

::u-page-hero
---
orientation: horizontal
---
#title
[{{$doc.title}}]{.text-primary} :br
Bliv frivillig!

#default
![Fgr](https://frigear.nu/_next/image?url=%2Flogo_with_rf_bgr.jpg&w=384&q=75&dpl=dpl_4pDmg1nXvax7mLXtC2uekcFmQCT9){class="rounded-full p-8 bg-secondary"}

#links
:::u-button
---
color: primary
size: xl
to: #contact
variant: subtle
---
Kontakt os
:::

:::u-button
---
color: primary
size: xl
to: /pricing
---
Bliv medlem
:::
::

::u-container{class="mb-4 flex flex-col md:flex-row md:justify-between gap-4"}
    :::u-page-feature
    #title
    Kontakt os
    #description
    Smid os en besked hvis du har nogen spørgsmål, så vender en Frigear frivillig tilbage ASAP 💜 :br
    Tjek vores SoMe mens du venter 🐼
    ::::u-separator
    ::::

    ::::div{class="my-2 flex gap-2"}
        :::::u-button
        ---
        icon: i-simple-icons-instagram
        variant: subtle
        size: xl
        target: _blank
        to: /
        ---
        :::::
        :::::u-button
        ---
        icon: i-simple-icons-facebook
        variant: subtle
        size: xl
        target: _blank
        to: /
        ---
        :::::
        :::::u-button
        ---
        icon: i-simple-icons-linkedin
        variant: subtle
        size: xl
        target: _blank
        to: /
        ---
        :::::
    ::::
    
    :::
    :::u-card
    ---
    variant: subtle
    class: "w-full md:w-lg"
    ---
    ::::site-contact-form
    ::::
    :::
::
