import { chatRequestSchema } from '#shared/schema/chat'
import { useValidatedBody } from 'h3-zod'
import type { Ai } from '@cloudflare/workers-types'

const SYSTEM_PROMPT_DA = `Du er Frie, en venlig AI-assistent for Frigear.nu – en nonprofit frivilligforening i Danmark.
Du hjælper besøgende med at finde information om foreningen, dens aktiviteter, medlemskaber og arrangementer.
Svar altid på dansk medmindre brugeren skriver på et andet sprog.
Hold svarene kortfattede, venlige og hjælpsomme.
Hvis du ikke kender svaret, opfordr brugeren til at kontakte foreningen direkte.`

const SYSTEM_PROMPT_EN = `You are Frie, a friendly AI assistant for Frigear.nu – a non-profit volunteer organisation in Denmark.
You help visitors find information about the organisation, its activities, memberships and events.
Answer in English unless the user writes in a different language.
Keep answers concise, friendly and helpful.
If you don't know the answer, encourage the user to contact the organisation directly.`

export default defineEventHandler(async (event) => {
  const { messages, locale } = await useValidatedBody(event, chatRequestSchema)

  const ai = event.context.cloudflare?.env?.AI as Ai | undefined

  if (!ai) {
    throw createError({
      statusCode: 503,
      message: 'AI service is not available',
    })
  }

  const systemPrompt = locale === 'en' ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_DA

  const response = await ai.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    stream: true,
  })

  setHeader(event, 'Content-Type', 'text/event-stream')
  setHeader(event, 'Cache-Control', 'no-cache')
  setHeader(event, 'Connection', 'keep-alive')

  return sendStream(event, response as unknown as ReadableStream)
})
