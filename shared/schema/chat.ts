import { z } from 'zod/v4'

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(4000),
})

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(20),
  locale: z.enum(['da', 'en']).default('da'),
})

export type ChatMessage = z.infer<typeof chatMessageSchema>
export type ChatRequest = z.infer<typeof chatRequestSchema>
