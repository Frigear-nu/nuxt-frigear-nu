---
title: Projektansøgning
seo:
  title: Projektansøgning - frigear.nu
  description: Information om ansøgningskriterier til Frigear fonden.
---

::u-page-hero
#title
{{ $doc.title }}

#headline
**Information** om ansøgningskriterier for **Frigear projektstøtte 2026**

#links

 <!-- ToDo -> add internal pitch form -->
  <!-- :::u-button
  ---
  color: primary
  icon: i-lucide-lightbulb
  size: xl
  trailingIcon: i-lucide-square-arrow-out-up-right
  variant: subtle
  ---
  Pitch dit interne Frigear projekt
  ::: -->

  :::u-button
  ---
  color: secondary
  icon: i-lucide-form
  size: xl
  to: /funding/#good-to-know
  trailingIcon: i-lucide-arrow-down-from-line
  variant: subtle
  ---
  Ansøg støtte til eksternt projekt
  :::

:nuxt-img{.mt-12.rounded-xl.hidden.md:block :heigth='400' :width='1200' alt="Frigears frivillige på Roskilde Festival" src="/images/volunteers/fgr/funding-hero-rf-x-50-1200x900.png"}

:nuxt-img{.mt-4.rounded-xl.block.md:hidden :height='400' :width='640' alt="Frigears frivillige på Roskilde Festival" src="/images/volunteers/fgr/funding-hero-mobile-rf-x-50-1200x900.png"}
::

::u-page-section
---
class: object-cover object-top w-full h-full shadow-2xl ring ring-default rounded-xl
icon: i-lucide-message-circle-question-mark
id: good-to-know
---
#title
Lidt stuff, -inden i ansøger . . .

#description

Foreningen Frigear uddeler årligt en pulje fra forudgående regnskabsårs overskud til awesome, frivilligdrevne projekter i Danmark.
Hvilke projekter der kommer i betragtning, afgøres af foreningens medlemmer på generalforsamlingen (afholdes i 1. kvartal) . . . . 

  :::u-collapsible
  ---
  defaultOpen: false
  class: flex flex-col gap-2 w-full
  ---
  <!-- fix width of ALL buttons!! This should be /50 and most others w-full -->
    ::::u-button
    ---
    block: true
    ui:
      trailingIcon: group-data-[state=open]:rotate-180 transition-transform duration-200
    label: SE MERE . . . klik her
    class: group
    color: primary
    trailingIcon: i-lucide-chevron-down
    variant: neutral
    ---
    ::::

  #content

  **Modtagere** af Frigear **støttemidler** bliver endeligt afgjort og meldt ud inden **1. juni**. Afgørelsen baseres på indsendte ansøgninger, som skal være bestyrelsen i hænde **senest 10 dage før generalforsamlingen**.
  Dato for generalforsamlingen offentliggøres (jf. vedtægter) **senest 3 uger før afholdelse**.

  **NB:** Frigear midler går ikke til støtte af enkeltpersoner, institutioner eller foreninger, hvor overskuddet går til enkeltpersoner, offentlige institutioner eller virksomheder (her tales ikke om fx husleje eller leje af udstyr i forbindelse med projektet), projekter med lønnede medarbejdere (her tales ikke om fx aflønning af ekstern lyd-tekniker, fragtmand eller lign.), støtte til underskudsdækning, projekter/vedtægter/idégrundlag der går imod Frigears mission, vision, værdier eller vedtægter, og ej heller projekter med politisk eller religiøs agenda.

  **Husk:** Frigear er udelukkende drevet af frivillige, som bruger deres fritid på at læse jeres ansøgninger igennem — så hjælp os med at hjælpe jer 💜
  :::

#features
  :::u-page-card
  ---
  class: object-cover object-top w-full h-full shadow-2xl ring ring-default
  icon: i-lucide-calendar-clock
  spotlight: true
  spotlight-color: primary
  ---
  #title
  Hvad er tidslinjen og processerne?

  #description
  Ansøgning --> Generalforsamling --(medlemsafstemning)--> Bestyrelsesvurdering --> Endeligt svar

  ::::u-collapsible
  ---
  defaultOpen: false
  class: flex flex-col gap-2 w-full mb-6
  ---
    :::::u-button{.align-end}
    ---
    block: true
    ui:
      trailingIcon: group-data-[state=open]:rotate-180 transition-transform duration-200
    class: group width-full
    color: neutral
    icon: i-lucide-check-circle
    size: lg
    label: "Se process og tidslinje for støtte"
    trailingIcon: i-lucide-chevron-down
    variant: subtle
    base: 'width-full mb-0 mt-full mt-auto'
    ---
    :::::

  #content
    ::u-page-list
      :::list-item
      ✅ **Ansøgning** indsendes **senest 10 dage før** generalforsamlingen.
      :::list-item
      ✅ **Dato** for generalforsamlingen offentliggøres **senest 3 uger før afholdelse**.
      :::list-item
      ✅ **Generalforsamling** afholdes i **1. kvartal**.
      :::list-item
      ✅ **Generalforsamlingen henviser** relevante projekter til **bestyrelsen**.
      :::list-item
      ✅ **Endeligt svar** gives efter grundig vurdering af ansøgninger af bestyrelsen på **mail senest 1. juni**
    ::
  :::

  :::u-page-card
  ---
  class: object-cover object-top w-full h-full shadow-2xl ring ring-default
  icon: i-lucide-piggy-bank
  spotlight: true
  spotlight-color: primary
  ---
  #title
  Hvor kommer pengene fra?

  #description
  Pengene til støttedonationer kommer primært fra overskud ved Frigears frivilligprojekter og events, gennemført af foreningens medlemmer igennem året.
    ::::u-collapsible
    ---
    defaultOpen: false
    class: flex flex-col gap-2 w-full mb-6
    ---
      :::::u-button
      ---
      block: true
      ui:
        trailingIcon: group-data-[state=open]:rotate-180 transition-transform duration-200
      class: group
      color: neutral
      icon: i-lucide-check-circle
      size: lg
      label: "Mere om hvor pengene kommer fra"
      trailingIcon: i-lucide-chevron-down
      variant: subtle
      base: 'width-full'
      ---
      :::::

    #content
    ::u-page-list
      :::list-item
      ✅ Overskud fra forudgående regnskabsår.
      :::list-item
      ✅ Evt. midler fra tidligere år, som ikke er blevet uddelt.
      :::list-item
      ✅ Evt. midler fra tidligere år, som er blevet tilbageført.
      :::list-item
      ✅ Evt. privatdonationer, fonde, støttemidler m.v.
      :::list-item
      ✅ Evt. salg af varer, udstyr eller ydelser.
      :::list-item
      ✅ Evt. udlejning af udstyr, lokaler m.m.
      :::list-item 
      ✅ Evt. samarbejde med andre foreninger, organisationer eller virksomheder.
      :::list-item 
      ✅ Evt. andre indtægtskilder i tråd med Frigears mission, vision og værdier.
    ::
    ::::
  :::

  :::u-page-card
  ---
  class: object-cover object-top w-full h-full shadow-2xl ring ring-default
  icon: i-lucide-check-circle
  spotlight: true
  spotlight-color: primary
  ---
  #title
  Hvornår er en ansøgning “med” i vurderingen?

  #description
  Hvis ansøgningen er indsendt gennem formen inden deadline...
  
      ::::u-collapsible
    ---
    defaultOpen: false
    class: flex flex-col gap-2 w-full mb-6
    ---
      :::::u-button
      ---
      block: true
      ui:
        trailingIcon: group-data-[state=open]:rotate-180 transition-transform duration-200
      class: group
      color: neutral
      icon: i-lucide-check-circle
      size: lg
      label: "Se mere om ansøgningskriterier"
      trailingIcon: i-lucide-chevron-down
      variant: subtle
      base: 'width-full'
      ---
      :::::

    #content
       ...og indeholdende alle relevante oplysninger vil den komme i betragtning og blive vurderet af medlemmerne på generalforsamlingen.
    ::u-page-list
      :::list-item
      ✅ Ansøgning indsendt rettidigt.
      :::list-item
      ✅ Ansøgning indeholder alle relevante oplysninger.
      :::list-item
      ❌ Ansøgning indsendt efter deadline er som udgangspunkt afvist.
      :::list-item
      ❌ Useriøse eller ufuldstændige ansøgninger kan blive afvist.
      :::list-item
      :::
    ::
  :::

  <!-- :::u-page-card
  ---
  class: object-cover object-top w-full h-full shadow-2xl ring ring-default
  icon: i-lucide-circle-help
  spotlight: true
  spotlight-color: primary
  ---
  #title
  Hvad har Frigear tidligere støttet?

  #description
  > Blandt projekter og initiativer Frigear har støttet med midler, frivillige, materialer, konsultering m.v, kan nævnes:

  - ✅ **Roskilde Festival** (frivilligprojekter, genbrug og bæredygtige initiativer)
  - ✅ **Copenhell** (frivillighed, kultur og Metal musik)
  - ✅ **Gutter Island** (sammenhold og kultur med fokus på Garage Rock)
  - ✅ **Ungdomshuset** (kulturprojekter og fællesskaber fokuseret omkring unge)
  - ✅ **Fællestival** (Festival og social forening med fokus på genbrug, fællesskab og kultur)
  - ✅ **Copenhagen B-Roll** (Idræts- Skate eventog kulturarrangement med fokus på rollerskating og kreativitet)
  - ✅ **Skuret** (Idræts Skatehal og forening med fokus på børn og unge)
  - ✅ **Frigears frivilligprojekter** (fx genbrugsinitiativer, workshops, kulturevents, m.m.)
  ::: -->

  :::u-page-card
  ---
  class: object-cover object-top w-full h-full shadow-2xl ring ring-default
  icon: i-lucide-sparkles
  spotlight: true
  spotlight-color: primary
  ---
  #title
  Hvad kan Frigear egentlig støtte?

  #description
  **Frigear ønsker at støtte**, hvor end det giver mening, ud fra vores kerneværdier som:> **Frirummet er stort**, og vi ønsker ikke at sætte begrænsninger på jeres drømme med specifics, —så lad idéerne flyde 🐼

    ::::u-collapsible
    ---
    defaultOpen: false
    class: flex flex-col gap-2 w-full mb-6
    ---
      :::::u-button
      ---
      block: true
      ui:
        trailingIcon: group-data-[state=open]:rotate-180 transition-transform duration-200
      class: group
      color: neutral
      icon: i-lucide-check-circle
      size: lg
      label: "Se eksempler på hvad vi gerne støtter"
      trailingIcon: i-lucide-chevron-down
      variant: subtle
      base: 'width-full'
      ---
      :::::

    #content
    ::u-page-list
      :::list-item
  - ✅ **Nonprofit og almennyttigt**
      :::list-item
  - ✅ **Frivillighed og frirum**
        :::list-item
  - ✅ **Unge og udsatte**
        :::list-item
  - ✅ **Socialt ansvar og samarbejde**
        :::list-item
  - ✅ **Bæredygtighed og genbrug**
        :::list-item
  - ✅ **Kunst, kultur og kreativitet**
        :::list-item
  - ✅ **Inklusion og mangfoldighed**
        :::list-item
  - ✅ **Subkultur og undergrundsniitiativer**
      :::
    ::
  :::

  :::u-page-card
  ---
  class: object-cover object-top w-full h-full shadow-2xl ring ring-default
  icon: i-lucide-circle-x
  spotlight: true
  spotlight-color: primary
  ---
  #title
  Hvad støtter Frigear fx. ikke?

  #description
  Frigear støtter ikke nedenstående, og det er vigtigt at understrege, at dette ikke nødvendigvis er udtømmende, men snarere eksempler som ikke kommer i betragtning:

    ::::u-collapsible
    ---
    defaultOpen: false
    class: flex flex-col gap-2 w-full mb-6
    ---
      :::::u-button
      ---
      block: true
      ui:
        trailingIcon: group-data-[state=open]:rotate-180 transition-transform duration-200
      class: group
      color: neutral
      icon: i-lucide-x-circle
      size: lg
      label: "Se eksempler på hvad vi ikke støtter"
      trailingIcon: i-lucide-chevron-down
      variant: subtle
      base: 'width-full'
      ---
      :::::

    #content
    ::u-page-list
      :::list-item
      ❌ Enkeltpersoner
      :::list-item
      ❌ Offentlige institutioner og virksomheder
      :::list-item
      ❌ Lønnede medarbejdere
      :::list-item
      ❌ Underskudsdækning
      :::list-item
      ❌ Ikke imødekommende ansøgninger
      :::list-item
      ❌ Ikke åbne foreninger
      :::list-item
      ❌ Ikke forenelige med Frigears værdier
      :::list-item
      ❌ Politik og religion
      :::
    ::
  :::


  :::u-page-card
  ---
  class: object-cover object-top w-full h-full shadow-2xl ring ring-default
  icon: i-lucide-message-circle
  spotlight: true
  spotlight-color: primary
  ---
  #title
  Hvornår kan vi forvente svar?

  #description
  Vi er alle frivillige og arbejder så hurtigt vi kan. Det tager tid at vurdere ansøgninger og sørge for, at midlerne bliver brugt på de rigtige projekter, -men se nedenfor for en generel tidslinje for, hvornår I kan forvente svar på jeres ansøgning:

    ::::u-collapsible
    ---
    defaultOpen: false
    class: flex flex-col gap-2 w-full mb-6
    ---
      :::::u-button
      ---
      block: true
      ui:
        trailingIcon: group-data-[state=open]:rotate-180 transition-transform duration-200
      class: group
      color: neutral
      icon: i-lucide-x-circle
      size: lg
      label: "Ansøgning afvist: ASAP efter GF"
      trailingIcon: i-lucide-chevron-down
      variant: subtle
      base: 'width-full'
      ---
      :::::

    #content
    Ansøgere hvis ansøgning **IKKE** er kommet i betragtning til potentiel støtte af medlemmerne i år, orienteres umiddelbart efter generalforsamlingen.
    ::::

    ::::u-collapsible
    ---
    defaultOpen: false
    class: flex flex-col gap-2 w-full mb-6
    ---
      :::::u-button
      ---
      block: true
      ui:
        trailingIcon: group-data-[state=open]:rotate-180 transition-transform duration-200
      class: group
      color: neutral
      icon: i-lucide-check-circle
      size: lg
      label: "Ansøgning godkendt: Inden 1. juni"
      trailingIcon: i-lucide-chevron-down
      variant: subtle
      ---
      :::::

    #content
    > Ansøgninger, der på generalforsamlingen, af medlemmerne vedtages til videre behandling, overgår til juridisk og økonomisk gennemgang hos bestyrelsen, og modtager endeligt svar inden 1. juni.
    ::::
  :::

  :::u-page-card
  ---
  class: object-cover object-top w-full h-full shadow-2xl ring ring-default
  icon: i-lucide-scale
  spotlight: true
  spotlight-color: primary
  ---
  #title
  Hvad hvis vi ikke bruger alle pengene, eller projektet aldrig bli'r til noget?

  #description
  > Helt eller delvist **Ubrugte støttemidler** skal som udgangspunkt **tilbagebetales** til Frigear, så de kan uddeles til andre projekter.> Evt. anden anvendelse i samarbejde med Frigear kan finde sted.
  > Hvis projektet ikke bli'r til noget, eller hvis I ikke bruger alle pengene, skal I blot give besked til bestyrelsen, så vi kan finde ud af det sammen om evt. anden anvendelse af midlerne i jeres forening.

  - ❌ Ubrugte støttemidler tilbageføres.

  - ✅ Evt. anden anvendelse af støttemidlerne.
  :::

  :::u-page-card
  ---
  class: object-cover object-top w-full h-full shadow-2xl ring ring-default
  icon: i-lucide-receipt-text
  spotlight: true
  spotlight-color: primary
  ---
  #title
  Skal vi aflægge regnskab?

  #description
  > Vi forbeholder os dog retten til at udbede om **kvitteringer eller dokumentation** på brugen af midlerne i **op til 5 år** -(Jf. gældende lovgivning om regnskabsføring).> I visse tilfælde kan det være nødvendigt at aflægge regnskab over brugen af midlerne, hvis projektet ændrer karakter, eller hvis Frigear har behov for yderligere dokumentation i forhold til regnskabsføring.

  - ❌ **Nej**, som udgangspunkt ikke.

  - ✅ **Ja** — Såfremt det er relevant.
  :::

  :::u-page-card
  ---
  class: object-cover object-top w-full h-full shadow-2xl ring ring-default
  icon: i-lucide-user-lock
  spotlight: true
  spotlight-color: primary
  ---
  #title
  Må projektet/foreningen være lukket for en mindre gruppe?

  #description
  - ❌ **Nej**. :br
    Frigear støtter udelukkende åbne, offentligt tilgængelige, almennyttige og frivilligdrevne foreninger og projekter.
  :::

  :::u-page-card
  ---
  class: object-cover object-top w-full h-full shadow-2xl ring ring-default
  icon: i-lucide-user-check
  spotlight: true
  spotlight-color: primary
  ---
  #title
  Er det en fordel at være medlem af Frigear?

  #description
  - ❌ **Nej** — alle ansøgninger behandles lige.
  - ✅ **Ja** — medlemskab giver en stemme på generalforsamlingen.

    ::::u-button
    ---
    class: mt-full
    color: primary
    icon: i-lucide-user-plus
    size: lg
    to: /membership
    trailingIcon: i-lucide-square-arrow-out-up-right
    variant: subtle
    ---
    Hop hen og bliv medlem
    ::::
  :::

  :::u-page-card
  ---
  class: object-cover object-top w-full h-full shadow-2xl ring ring-default
  icon: i-lucide-heart-crack
  spotlight: true
  spotlight-color: primary
  ---
  #title
  Hvad hvis jeg vil klage over noget?

  #description
  > Klager kan sendes til bestyrelsen via knappen herunder og/eller kræves taget op på kommende generalforsamling af medlemmer.

    ::::contact-form-modal
    ---
    label: Kontakt bestyrelsen for at klage
    initial:
      subject: complaint
    ---
    ::::
  :::

  :::u-page-card
  ---
  class: object-cover object-top w-full h-full shadow-2xl ring ring-default
  icon: i-lucide-megaphone
  spotlight: true
  spotlight-color: primary
  ---
  #title
  Krav om offentlig kreditering

  #description
  ✅ Ja.

  Vi er stolte over vores **frivilliges indsats** er med til at støtte jer, og hjælpe med promotion af jeres projekt(er). Derfor forventes det også, at I på samme vis **ønsker at anerkende Frigears støtte** på offentlige medier, SoMe-kanaler m.m. hvor det gi'r mening, samt evt. til event(s) med Frigears logo og evt. links og #hashtags m.v.

  **PR materiale** og **brandkit** kan fanges her:

    ::::u-button
    ---
    color: secondary
    icon: i-lucide-qr-code
    size: lg
    to: /promo
    trailingIcon: i-lucide-square-arrow-out-up-right
    variant: subtle
    ---
    Promo materiale og brandkit
    ::::
  :::

:nuxt-img{:height='220' :width='800' alt="Frigear logo / brandkit (indsæt jeres logo her)" src="logo.png"}

  :::u-page-card
  ---
  class: object-cover object-top w-full h-full shadow-2xl ring ring-default line-clamp-5
  icon: i-lucide-clipboard-check
  spotlight: true
  spotlight-color: primary
  ---
  #title
  Hvad skal ansøgningen som minimum indeholde?

  #description
  ✅ Lidt om jer. :br
  ✅ Projektets/idéens overordnede formål. :br
  ✅ Antal event- eller projektdeltagere. :br
  ✅ Hvor og hvornår forventes det afholdt/gennemført? :br
  ✅ Er projektet støttet af statsmidler, andre fonde, private eller på anden vis — og i så fald hvem? :br
  ✅ Samlet budget + hvad støttemidlerne specifikt bidrager til. :br
  ✅ Hvor stor en økonomisk andel forventes I selv at bidrage med? :br
  ✅ Forventet overskud — og hvad skal det gå til? :br
  ✅ Organisationens/projektets navn + navne på juridisk ansvarlige. :br
  ✅ CVR på organisationen og/eller CPR på enkeltansvarspersoner. :br
  ✅ Link til hjemmeside og SoMe-kanaler (hvis relevant). :br
  ✅ Bankoplysninger til evt. udbetaling af støtte.
  :::

<!-- Fix 3 column card width -->
  :::u-page-card
  ---
  class: object-cover object-top w-full h-full shadow-2xl ring ring-default
  icon: i-lucide-mail
  orientation: horizontal
  ---
  #title
  Kontakt Frigear om tvivlspørgsmål eller sparring på projektidéer

  #description
  Brug kontaktformularen herunder hvis du har enkeltspørgsmål til ansøgningsprocessen, eller hvis du har en idé til et projekt, som du gerne vil have sparring på, inden du sender en ansøgning:

    ::::contact-form-modal
    ---
    label: Kontakt os om projektstøtte spørgsmål
    initial:
      subject: other
      subjectOther: Projektstøtte spørgsmål
    ---
    ::::
  :::
::
