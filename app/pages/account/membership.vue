<script setup lang="ts">
import type { PublicPrice } from '#shared/types/membership'
import { useSiteI18n } from '#imports'
import { useUserMemberships } from '~/store/queries/user'
import type { CartItem } from '#shared/types/shopping-cart'
import { useMemberships } from '~/store/queries/membership'
import { useStripeBillingPortalUrl, useSubscribeUser } from '~/store/mutations/user'

const toast = useToast()
const { t } = useSiteI18n()
const { data: cartItems, hasAnyItems: hasAnyCartItems, clearCart } = useShoppingCart()
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

watch([hasAnyCartItems, cartItems], () => {
  if (!hasAnyCartItems.value || activeSubscription.value) return

  cartSubscribeItem.value = cartItems.value[0]
  displaySubscribeModal.value = true
}, { immediate: true })

const onSelectMembership = (price: PublicPrice) => {
  clearCart()
  cartSubscribeItem.value = price as unknown as CartItem
  displaySubscribeModal.value = true
}

const membershipToSubscribe = computed(() => {
  if (!cartSubscribeItem.value) return undefined
  return [...availableMemberships.value || []].find(m => m.id === cartSubscribeItem.value?.id)
})

const subscribeDialogTitle = computed(() => {
  if (!activeSubscription.value) return 'payment.membership.subscribe.title'
  return 'payment.membership.update.title'
})

const subscribeDialogDescription = computed(() => {
  const translationKey = activeSubscription.value
    ? 'payment.membership.update.description'
    : 'payment.membership.subscribe.description'
  const translated = t(translationKey)

  if (translated !== translationKey) return translated

  return undefined
})

const onConfirmSubscription = async () => {
  isLoading.value = true
  if (!cartSubscribeItem.value) {
    toast.add(formatToastError(new Error('No item in cart.')))
    return
  }
  const checkoutSession = await subscribeUser(cartSubscribeItem.value?.id)

  isLoading.value = false

  if (checkoutSession.updated) {
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
      You are on the {{ activeSubscription?.price?.interval }} plan.
      <div v-if="activeSubscription.cancelAtPeriodEnd">
        Subscription will cancel automatically on {{ activeSubscription.currentPeriodEnd }}
      </div>
      <div v-else>
        The subscription will renew automatically on {{ activeSubscription.currentPeriodEnd }}.
      </div>
      <div class="flex flex-row gap-4">
        <UButton
          v-if="!activeSubscription.cancelAtPeriodEnd"
          color="error"
          icon="i-lucide-x"
          :loading="isLoading"
          @click="navigateToStripeDashboard"
        >
          Cancel subscription
        </UButton>
        <UButton
          icon="i-lucide-credit-card"
          :loading="isLoading"
          @click="navigateToStripeDashboard"
        >
          Change payment method
        </UButton>
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
      <UAlert
        v-if="false && !activeSubscription"
        title="You do not have a subscription - yet!"
        description="Subscribe to get your Frigear benefits ;)"
        color="neutral"
        icon="i-lucide-info"
        class="mb-8"
        :ui="{ title: 'text-lg font-bold', icon: 'size-10' }"
      />
    </div>
    <UPageHeader
      v-if="activeSubscription && activeSubscription.price"
      title="Available subscriptions"
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
