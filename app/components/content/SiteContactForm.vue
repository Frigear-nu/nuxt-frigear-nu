<script lang="ts" setup>
</script>
<template>

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
</template>
