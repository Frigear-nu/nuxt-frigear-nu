<script setup lang="ts">
import type { CalendarDate } from '@internationalized/date'
import { DateFormatter, getLocalTimeZone, fromDate } from '@internationalized/date'

const df = new DateFormatter('en-US', {
  dateStyle: 'medium',
})

// Define model as native Date
const modelValue = defineModel<Date | null>({ default: null })

// Convert between native Date and CalendarDate
const calendarDate = computed({
  get() {
    if (!modelValue.value) {
      // Return today's date as default when no value is set
      return fromDate(new Date(), getLocalTimeZone())
    }
    // Convert native Date to CalendarDate
    return fromDate(modelValue.value, getLocalTimeZone())
  },
  set(newValue: CalendarDate | null) {
    if (!newValue) {
      modelValue.value = null
      return
    }
    // Convert CalendarDate back to native Date
    modelValue.value = newValue.toDate(getLocalTimeZone())
  },
})
</script>

<template>
  <UPopover>
    <UButton
      color="neutral"
      variant="subtle"
      icon="i-lucide-calendar"
    >
      {{ modelValue ? df.format(modelValue) : 'Select a date' }}
    </UButton>

    <template #content>
      <UCalendar
        v-model="calendarDate"
        class="p-2"
      />
    </template>
  </UPopover>
</template>
