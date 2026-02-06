<script setup lang="ts">
import type { PublicPrice } from '#shared/types/membership'
import { useSiteI18n } from '#imports'
import { useUserMemberships } from '~/store/queries/user'
import type { CartItem } from '#shared/types/shopping-cart'
import { useMemberships } from '~/store/queries/membership'
import { useStripeBillingPortalUrl, useSubscribeUser } from '~/store/mutations/user'
import { format } from 'date-fns'

const toast = useToast()
const { t, locale } = useSiteI18n()
const { data: cartItems, hasAnyItems: hasAnyCartItems, removeFromCart, clearCart } = useShoppingCart()
const { data: currentMemberships, refetch: refetchMembership } = useUserMemberships()
const { data: availableMemberships } = useMemberships()
const { mutateAsync: subscribeUser } = useSubscribeUser()
const { mutateAsync: getBillingPortalUrl } = useStripeBillingPortalUrl()

//
const cartSubscribeItem = ref<CartItem | undefined>()
const displaySubscribeModal = ref(false)
const isLoading = ref(false)

const activeSubscription = computed(() => {
  if (!currentMemberships.value) return null
  return currentMemberships.value[0]
})

const activeSubscriptionWillBeCancelled = computed(() => {
  if (!activeSubscription.value) return false
  if (activeSubscription.value.cancelAtPeriodEnd) return true
  return activeSubscription.value.cancelAt
})

watch([hasAnyCartItems, cartItems], () => {
  if (!hasAnyCartItems.value || activeSubscription.value) return

  cartSubscribeItem.value = cartItems.value[0]
  displaySubscribeModal.value = true
}, { immediate: true })

const onSelectMembership = (price: PublicPrice) => {
  // FUTURE: Might wanna try to do some upselling here in case of "abandoned" cart?
  removeFromCart(price.id)
  cartSubscribeItem.value = price as unknown as CartItem
  displaySubscribeModal.value = true
}

const membershipToSubscribe = computed(() => {
  if (!cartSubscribeItem.value) return undefined
  return [...availableMemberships.value || []].find(m => m.id === cartSubscribeItem.value?.id)
})

const subscribeDialogTitle = computed(() => {
  if (!activeSubscription.value) return 'account.membership.subscribe.title'
  return 'account.membership.update.title'
})

const subscribeDialogDescription = computed(() => {
  const translationKey = activeSubscription.value
    ? 'account.membership.update.description'
    : 'account.membership.subscribe.description'
  const translated = t(translationKey)

  if (translated !== translationKey) return translated

  return undefined
})

const onConfirmSubscription = async () => {
  isLoading.value = true
  if (!cartSubscribeItem.value) {
    toast.add(formatToastError(new Error('No item in cart.')))
    isLoading.value = false
    return
  }
  const checkoutSession = await subscribeUser(cartSubscribeItem.value?.id)

  isLoading.value = false

  if (!checkoutSession) {
    const err = new Error('No checkout session returned.')
    toast.add(formatToastError(err))
    throw err
  }

  if ('updated' in checkoutSession) {
    toast.add(formatToastSuccess('Subscription updated.'))
    clearCart()
    displaySubscribeModal.value = false
    setTimeout(() => refetchMembership(), 2500)
    return
  }

  if (!checkoutSession.url) {
    throw new Error('No checkout session url.')
  }

  navigateTo(checkoutSession.url, {
    external: true,
  })
}

const navigateToStripeDashboard = async () => {
  isLoading.value = true
  const { url } = await getBillingPortalUrl()
  isLoading.value = false

  navigateTo(url, {
    external: true,
  })
}
</script>

<template>
  <div class="flex gap-4 flex-col">
    <UPageCard
      v-if="activeSubscription && activeSubscription.price"
      :title="t('account.membership.title')"
    >
      <div class="flex flex-col gap-4">
        <!-- plan -->
        <div class="flex items-center justify-between">
          <div class="flex flex-col">
            <span class="text-sm text-muted">
              {{ $t('account.membership.currentPlan') }}
            </span>
            <span class="text-lg font-semibold capitalize">
              {{ activeSubscription.price?.metadata?.['title_' + locale] || activeSubscription.price?.metadata?.title || activeSubscription.price.title }}
            </span>
          </div>

          <UBadge
            :color="activeSubscriptionWillBeCancelled ? 'warning' : 'success'"
            variant="soft"
            :icon="activeSubscriptionWillBeCancelled ? 'i-lucide-battery-warning' : 'i-lucide-shield-check'"
          >
            {{ activeSubscriptionWillBeCancelled
              ? $t('account.membership.cancelling')
              : $t('account.membership.active')
            }}
          </UBadge>
        </div>

        <!-- status -->
        <div
          v-if="activeSubscription.currentPeriodEnd"
          class="rounded-md bg-muted/50 px-4 py-3 text-sm"
        >
          <template v-if="activeSubscriptionWillBeCancelled">
            {{ $t('account.membership.cancelsAt', {
              date: format(activeSubscription.currentPeriodEnd, 'yyyy-MM-dd HH:mm:ss'),
            }) }}
          </template>

          <template v-else>
            {{ $t('account.membership.renewsAutomaticallyAt', {
              date: format(activeSubscription.currentPeriodEnd, 'yyyy-MM-dd HH:mm:ss'),
            }) }}
          </template>
        </div>

        <!-- actions -->
        <div class="flex flex-wrap gap-3 pt-2">
          <UButton
            v-if="!activeSubscriptionWillBeCancelled"
            color="error"
            variant="soft"
            icon="i-lucide-x"
            :loading="isLoading"
            @click="navigateToStripeDashboard"
          >
            {{ $t('account.membership.cancel') }}
          </UButton>

          <UButton
            icon="i-lucide-credit-card"
            variant="outline"
            :loading="isLoading"
            @click="navigateToStripeDashboard"
          >
            {{ $t('account.membership.changePaymentMethod') }}
          </UButton>
        </div>
      </div>
    </UPageCard>
    <div
      v-else
      class="mb-4"
    >
      <UPageHero
        title="Subscribe to a plan"
        description="Subscribe to a plan to get started!"
        class="mt-0"
        :ui="{ title: 'fancy-text' }"
      />
    </div>
    <UPageHeader
      v-if="activeSubscriptionWillBeCancelled || !activeSubscription"
      title="Resubscribe with ease"
    />
    <MembershipTypes
      :mode="$device.isDesktopOrTablet ? 'list' : 'tabs'"
      @select="onSelectMembership"
    >
      <template
        v-if="activeSubscription"
        #button="{ item }"
      >
        <UButton
          :disabled="activeSubscription && activeSubscription.priceId === item.id"
          block
          :variant="activeSubscription && activeSubscription.priceId === item.id ? 'subtle' : undefined"
          @click="onSelectMembership(item as PublicPrice)"
        >
          {{ activeSubscription && activeSubscription.priceId === item.id ? 'Current' : 'Switch' }}
        </UButton>
      </template>
    </MembershipTypes>
    <UModal
      v-model:open="displaySubscribeModal"
      :title="t(subscribeDialogTitle)"
      :description="subscribeDialogDescription"
    >
      <template #body>
        <div class="text-muted my-4">
          You will now subscribe to:
        </div>
        <UPricingPlan
          v-if="membershipToSubscribe"
          v-bind="membershipToSubscribe"
          :price="`${membershipToSubscribe.price / 100} DKK`"
        />
        <div class="my-4">
          You will now be taken to stripe to confirm
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-4">
          <UButton
            :loading="isLoading"
            @click="onConfirmSubscription"
          >
            Subscribe
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
