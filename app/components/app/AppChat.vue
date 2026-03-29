<script setup lang="ts">
import type { ChatMessage } from '#shared/schema/chat'

const { locale, t } = useSiteI18n()

const suggestedQuestions = computed(() => [
  t('chat.suggested.whatIsFrigear'),
  t('chat.suggested.howToVolunteer'),
  t('chat.suggested.membershipCost'),
  t('chat.suggested.nextEvent'),
])

const isOpen = ref(false)
const inputMessage = ref('')
const messages = ref<ChatMessage[]>([])
const isLoading = ref(false)
const messagesEndRef = useTemplateRef<HTMLDivElement>('messagesEnd')

async function sendMessage(content?: string) {
  const text = (content ?? inputMessage.value).trim()
  if (!text || isLoading.value) return

  inputMessage.value = ''
  messages.value.push({ role: 'user', content: text })
  isLoading.value = true

  const assistantMessage: ChatMessage = { role: 'assistant', content: '' }
  messages.value.push(assistantMessage)

  try {
    const response = await $fetch('/api/chat', {
      method: 'POST',
      body: {
        messages: messages.value.slice(0, -1),
        locale: locale.value,
      },
      responseType: 'stream',
    }) as ReadableStream<Uint8Array>

    const reader = response.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6).trim()
        if (data === '[DONE]') break
        try {
          const parsed = JSON.parse(data)
          const token = parsed?.response ?? ''
          messages.value[messages.value.length - 1]!.content += token
          await nextTick()
          messagesEndRef.value?.scrollIntoView({ behavior: 'smooth' })
        }
        catch {
          // skip malformed JSON lines
        }
      }
    }
  }
  catch {
    messages.value[messages.value.length - 1]!.content = t('chat.error')
  }
  finally {
    isLoading.value = false
    await nextTick()
    messagesEndRef.value?.scrollIntoView({ behavior: 'smooth' })
  }
}

function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

function resetChat() {
  messages.value = []
  inputMessage.value = ''
}

watch(isOpen, (open) => {
  if (!open) return
  nextTick(() => messagesEndRef.value?.scrollIntoView())
})
</script>

<template>
  <ClientOnly>
    <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <!-- Chat window -->
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 translate-y-4 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 translate-y-4 scale-95"
      >
        <div
          v-if="isOpen"
          class="w-[22rem] sm:w-96 bg-(--ui-bg) border border-(--ui-border) rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style="max-height: min(600px, calc(100vh - 6rem));"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-4 py-3 bg-(--ui-primary) text-white">
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-sparkles"
                class="size-5"
              />
              <span class="font-semibold text-sm">{{ $t('chat.title') }}</span>
              <UBadge
                color="success"
                variant="subtle"
                size="sm"
                label="AI"
              />
            </div>
            <div class="flex items-center gap-1">
              <UTooltip :text="$t('chat.newChat')">
                <UButton
                  icon="i-lucide-rotate-ccw"
                  variant="ghost"
                  color="white"
                  size="xs"
                  :aria-label="$t('chat.newChat')"
                  @click="resetChat"
                />
              </UTooltip>
              <UButton
                icon="i-lucide-x"
                variant="ghost"
                color="white"
                size="xs"
                :aria-label="$t('chat.close')"
                @click="isOpen = false"
              />
            </div>
          </div>

          <!-- Messages -->
          <div class="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            <!-- Empty state with suggested questions -->
            <template v-if="messages.length === 0">
              <div class="text-center py-4">
                <UIcon
                  name="i-lucide-sparkles"
                  class="size-8 text-(--ui-primary) mx-auto mb-2"
                />
                <p class="text-sm font-medium text-(--ui-text-highlighted)">
                  {{ $t('chat.greeting') }}
                </p>
                <p class="text-xs text-(--ui-text-muted) mt-1">
                  {{ $t('chat.subtitle') }}
                </p>
              </div>
              <div class="space-y-2">
                <button
                  v-for="question in suggestedQuestions"
                  :key="question"
                  class="w-full text-left text-sm px-3 py-2 rounded-lg border border-(--ui-border) hover:bg-(--ui-bg-elevated) transition-colors text-(--ui-text)"
                  @click="sendMessage(question)"
                >
                  {{ question }}
                </button>
              </div>
            </template>

            <!-- Message list -->
            <template v-else>
              <div
                v-for="(message, index) in messages"
                :key="index"
                :class="[
                  'flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start',
                ]"
              >
                <div
                  :class="[
                    'max-w-[80%] rounded-2xl px-3 py-2 text-sm',
                    message.role === 'user'
                      ? 'bg-(--ui-primary) text-white rounded-br-sm'
                      : 'bg-(--ui-bg-elevated) text-(--ui-text) rounded-bl-sm',
                  ]"
                >
                  <span
                    v-if="message.role === 'assistant' && !message.content && isLoading"
                    class="flex gap-1 items-center py-1"
                  >
                    <span class="size-1.5 rounded-full bg-(--ui-text-muted) animate-bounce [animation-delay:0ms]" />
                    <span class="size-1.5 rounded-full bg-(--ui-text-muted) animate-bounce [animation-delay:150ms]" />
                    <span class="size-1.5 rounded-full bg-(--ui-text-muted) animate-bounce [animation-delay:300ms]" />
                  </span>
                  <span v-else>{{ message.content }}</span>
                </div>
              </div>
            </template>

            <div ref="messagesEnd" />
          </div>

          <!-- Input -->
          <div class="border-t border-(--ui-border) p-3">
            <div class="flex items-end gap-2">
              <UTextarea
                v-model="inputMessage"
                :placeholder="$t('chat.placeholder')"
                :rows="1"
                autoresize
                :maxrows="4"
                size="sm"
                class="flex-1"
                :disabled="isLoading"
                @keydown="onKeyDown"
              />
              <UButton
                icon="i-lucide-send"
                size="sm"
                :disabled="!inputMessage.trim() || isLoading"
                :loading="isLoading"
                :aria-label="$t('chat.send')"
                @click="sendMessage()"
              />
            </div>
          </div>
        </div>
      </Transition>

      <!-- Toggle button -->
      <UButton
        :icon="isOpen ? 'i-lucide-x' : 'i-lucide-sparkles'"
        size="xl"
        :ui="{ base: 'rounded-full shadow-lg size-14' }"
        :aria-label="isOpen ? $t('chat.close') : $t('chat.open')"
        @click="isOpen = !isOpen"
      />
    </div>
  </ClientOnly>
</template>
