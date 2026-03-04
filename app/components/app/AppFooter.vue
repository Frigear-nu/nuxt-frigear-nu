<script setup lang="ts">
import { useSiteFooter } from '#imports'

const { data: footer } = await useSiteFooter()
</script>

<template>
  <USeparator
    type="dashed"
    size="lg"
    class="h-px mt-8"
  >
    <UColorModeImage
      light="/logo.png"
      dark="/logo-dark.png"
      class="w-auto h-8"
      loading="lazy"
      alt="Footer Separator Logo"
    />
  </USeparator>
  <UFooter>
    <template
      v-if="footer && footer.left"
      #left
    >
      <AppFooterLeft
        :parts="footer.left"
      />
    </template>
    <template
      v-if="footer && footer.sections && footer.sections.length"
      #top
    >
      <UContainer>
        <UFooterColumns
          :columns="footer.sections"
        >
          <template #right>
            <!--            <UFormField -->
            <!--              name="email" -->
            <!--              label="Subscribe to our newsletter" -->
            <!--              size="lg" -->
            <!--            > -->
            <!--              <UInput -->
            <!--                type="email" -->
            <!--                class="w-full" -->
            <!--              > -->
            <!--                <template #trailing> -->
            <!--                  <UButton -->
            <!--                    type="submit" -->
            <!--                    size="xs" -->
            <!--                    color="neutral" -->
            <!--                    label="Subscribe" -->
            <!--                  /> -->
            <!--                </template> -->
            <!--              </UInput> -->
            <!--            </UFormField> -->
          </template>
        </UFooterColumns>
      </UContainer>
    </template>
    <template
      v-if="footer && footer.right"
      #right
    >
      <AppFooterRight :links="footer && footer.right" />
    </template>
  </UFooter>
</template>
