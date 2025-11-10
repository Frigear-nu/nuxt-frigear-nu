<script lang="ts" setup>
</script>
<template>
  <div class="flex flex-col md:flex-row md:justify-between gap-4">
    <UPageFeature
        title="Kontakt os"
        description="We'd love to hear from you!"
        class="md:max-w-sm"
    >
      <template #description>
        <slot name="description">
          Smid os en besked hvis du har nogen spørgsmål, så vender en Frigear frivillig tilbage ASAP 💜
          <br/>
          Tjek vores SoMe mens du venter 🐼
          <br/>
        </slot>
        <div class="flex gap-2 mt-2">
          <slot name="socials">
            <UButton
                icon="i-simple-icons-instagram"
                variant="subtle"
                to="/"
                target="_blank"
                size="xl"
            />
            <UButton
                icon="i-simple-icons-facebook"
                variant="subtle"
                to="/"
                target="_blank"
                size="xl"
            />
            <UButton
                icon="i-simple-icons-linkedin"
                variant="subtle"
                to="/"
                target="_blank"
                size="xl"
            />
          </slot>
        </div>
      </template>
    </UPageFeature>
      <UCard class="w-full md:w-lg" variant="subtle">
        <UForm class="flex flex-col gap-2">
          <UFormField label="Dit seje navn">
            <UInput placeholder="Hej, hva hedder du? .. put her" class="w-full"/>
          </UFormField>
          <UFormField label="Dit fon nummer">
            <UInput placeholder="Dit nummer?..." class="w-full"/>
          </UFormField>
          <UFormField label="Din email">
            <UInput placeholder="volunteerHero@someDomain.lol" class="w-full"/>
          </UFormField>
          <UFormField label="Emne">
            <UInput placeholder="Ville bare lige smide et virtuelt kram :)" class="w-full"/>
          </UFormField>
          <UFormField label="Besked">
            <UTextarea placeholder="Jeg vil snakke om et awesome Frigear projekt..." class="w-full"/>
          </UFormField>
            <UButton type="submit" class="justify-center flex" size="xl">
              Send besked
            </UButton>
        </UForm>
      </UCard>
  </div>
</template>