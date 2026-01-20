<script setup lang="ts">
import styles from './emailStyles'
import EmailHeader from './components/EmailHeader.vue'

defineProps<{
  magicLink: string
}>()
</script>

<template>
  <EHtml lang="en">
    <EHead />
    <EBody :style="styles.main">
      <EPreview>
        Your secure sign-in link
      </EPreview>

      <EContainer :style="styles.container">
        <ESection :style="styles.box">
          <EmailHeader />
          <EHeading :level="2">
            Your Magic Link
          </EHeading>
          <EHr :style="styles.hr" />

          <EText :style="styles.paragraph">
            You requested a secure sign-in link. Click the button below to sign
            in to your account.
          </EText>

          <EText :style="styles.paragraph">
            This link will expire shortly and can only be used once.
          </EText>

          <EButton
            :style="styles.button"
            :href="magicLink"
          >
            Sign in
          </EButton>

          <br>
          Or copy this link to your browser: {{ magicLink }}

          <EHr :style="styles.hr" />

          <EText :style="styles.paragraph">
            If you didn’t request this email, you can safely ignore it. No action
            is required.
          </EText>

          <EHr :style="styles.hr" />

          <EText :style="styles.footer">
            This email was sent automatically for security reasons.
          </EText>
        </ESection>
      </EContainer>
    </EBody>
  </EHtml>
</template>
