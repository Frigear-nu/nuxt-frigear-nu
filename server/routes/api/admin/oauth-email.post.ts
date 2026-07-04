import { authorize } from 'nuxt-authorization/utils'
import { canViewUsers } from '#shared/abilities/admin'
import { requireUser } from '#server/utils/auth'
import CustomOauthMessage from '#shared/emails/oauth-email.vue'
import { z } from 'zod/v4'

// TODO: every message should be logged in the internal notifications so the user can also "read" from the frigear.nu app
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  await authorize(canViewUsers, user)

  const { subject, to, message } = await readValidatedBody(event, z.object({
    subject: z.string().default('Message from Frigear'),
    to: z.email(),
    message: z.string(),
  }).parse)

  await sendEmailTemplate(event, {
    component: CustomOauthMessage,
    subject,
    to: to,
    from: 'frivillig@frigear.nu',
    props: {
      subject,
      message,
    },
  })

  return sendNoContent(event)
})
