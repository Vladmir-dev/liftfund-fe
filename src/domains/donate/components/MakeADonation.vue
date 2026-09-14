<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../../stores/auth'
import { campaignService } from '../../../services/campaign'
import { rememberDonation } from '../../../services/donationSession'
import { redirectToGateway } from '../../../services/gatewayRedirect'
import { Notify } from '../../../utils/notify'

// -- Props / state ----------------------------------------------------------

const props = defineProps<{
  open: boolean
  target: {
    id: string
    title: string
    imageUrl?: string
    currency?: string
    raisedAmount?: number
    targetAmount?: number
    donorCount?: number
    organizer?: string
  } | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'completed', amount: number): void
}>()

const router = useRouter()
const authStore = useAuthStore()

const isSubmitting = ref(false)
const errorMessage = ref('')
const modalStep = ref<'amount' | 'details' | 'success'>('amount')

// -- Form fields -------------------------------------------------------------

const isUgx = computed(() => (props.target?.currency || '').toUpperCase() === 'UGX')

const presets = computed(() =>
  isUgx.value ? [10000, 25000, 50000, 100000] : [25, 50, 100, 250]
)

const presetLabel = (n: number) => (isUgx.value ? `${n / 1000}k` : `$${n}`)

const symbol = computed(() => (isUgx.value ? 'UGX' : '$'))

const minAmount = computed(() => (isUgx.value ? 1000 : 1))

// Amount is never pre-selected: the payer must actively choose (chip or custom)
// so the submitted amount always matches what was entered. Reset to 0 on open.
const donationAmount = ref<number>(0)
const donorName = ref('')
const donorEmail = ref('')
const isAnonymous = ref(false)
const message = ref('')

const formatMoney = (n: number): string => {
  const value = Number(n) || 0
  const ccy = (props.target?.currency || 'USD').toUpperCase()
  if (ccy === 'UGX') return `UGX ${value.toLocaleString()}`
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: ccy }).format(value)
  } catch {
    return `${ccy} ${value.toLocaleString()}`
  }
}

const raised = computed(() => Number(props.target?.raisedAmount) || 0)
const goal = computed(() => Number(props.target?.targetAmount) || 0)
const donorCount = computed(() => Number(props.target?.donorCount) || 0)
const progressPercent = computed(() =>
  goal.value > 0 ? Math.min(100, Math.round((raised.value / goal.value) * 100)) : 0
)

const initials = computed(() =>
  (props.target?.organizer || 'O')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
)

const coverImage = computed(() =>
  props.target?.imageUrl ||
  'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&q=80&w=800'
)

// -- Reset on open ------------------------------------------------------------

watch(
  () => [props.open],
  () => {
    if (!props.open) return
    donationAmount.value = 0
    donorName.value = authStore.user?.name || ''
    donorEmail.value = authStore.user?.email || ''
    isAnonymous.value = false
    message.value = ''
    modalStep.value = 'amount'
    isSubmitting.value = false
    errorMessage.value = ''
  }
)

const close = () => emit('update:open', false)

const goToDetails = () => {
  if (!Number.isFinite(donationAmount.value) || donationAmount.value < minAmount.value) {
    errorMessage.value = `Please enter an amount of at least ${formatMoney(minAmount.value)}.`
    return
  }
  errorMessage.value = ''
  modalStep.value = 'details'
}

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

// -- Submit ------------------------------------------------------------------

const submitDonation = async () => {
  if (!props.target || donationAmount.value < minAmount.value || isSubmitting.value) return

  const email = donorEmail.value.trim() || authStore.user?.email || 'donor@helpfund.org'
  if (!isValidEmail(email)) {
    errorMessage.value = 'Please enter a valid email address for your receipt.'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const res = await campaignService.createDonation({
      campaignId: props.target.id,
      amount: donationAmount.value,
      currency: props.target.currency || 'USD',
      isAnonymous: isAnonymous.value,
      donorName: isAnonymous.value ? 'Anonymous' : (donorName.value.trim() || 'Supporter'),
      email,
      message: message.value.trim() || undefined,
      paymentMethod: 'card',
    })

    // Hosted checkout: remember the tx and hand off to the secure gateway page.
    if (res.paymentLink) {
      if (res.txRef) rememberDonation(res.txRef)
      Notify.info('Opening secure checkout...')
      emit('completed', donationAmount.value)
      redirectToGateway(res.paymentLink)
      return
    }

    // Beacon / sandbox-style direct confirmation.
    if (res.txRef) {
      rememberDonation(res.txRef)
      try {
        await campaignService.verifyDonation({ txRef: res.txRef })
      } catch {
        /* webhook/reconcile may confirm later */
      }
      emit('completed', donationAmount.value)
      router.push({ path: '/donations/success', query: { txRef: res.txRef, status: 'successful' } })
      return
    }

    // Fallback: in-modal confirmation.
    modalStep.value = 'success'
    emit('completed', donationAmount.value)
    Notify.success(`Thank you! Your donation of ${formatMoney(donationAmount.value)} has been received.`)
} catch (err) {
      errorMessage.value = err instanceof Error ? err.message : 'Failed to create donation. Please try again.'
    } finally {
      isSubmitting.value = false
    }
}

const typingAmount = (event: Event) => {
  const value = (event.target as HTMLInputElement).value.replace(/[^\d]/g, '')
  donationAmount.value = value === '' ? 0 : Number(value)
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0">
      <div v-if="open && target"
        class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
        @click.self="close">
        <div
          class="bg-white w-full max-w-lg max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-3rem)] overflow-y-auto rounded-3xl shadow-2xl border border-slate-100 relative">
          <button @click="close"
            class="absolute top-3.5 right-3.5 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-slate-100 text-slate-600 shadow flex items-center justify-center cursor-pointer transition">
            <iconify-icon icon="ph:x-bold"></iconify-icon>
          </button>

          <!-- Cover strip -->
          <div class="relative h-28 sm:h-32 bg-slate-200 w-full overflow-hidden rounded-t-3xl">
            <img :src="coverImage" class="w-full h-full object-cover" alt="" />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent"></div>
            <div class="absolute bottom-3 left-4 right-4 flex items-end gap-2.5">
              <div
                class="w-9 h-9 rounded-full bg-white text-[#024731] font-black text-xs flex items-center justify-center shrink-0 border-2 border-white shadow">
                {{ initials }}
              </div>
              <div class="min-w-0">
                <p class="text-[10px] font-bold uppercase tracking-wider text-white/80">You're donating to</p>
                <p class="text-white font-black text-sm leading-snug truncate">{{ target.title }}</p>
              </div>
            </div>
          </div>

          <!-- ================= Amount step ================= -->
          <div v-if="modalStep === 'amount'" class="p-5 sm:p-6">
            <div class="flex items-center gap-2 mb-4">
              <span class="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#024731] bg-[#edfce0] border border-[#bbf770] px-2.5 py-1 rounded-full">
                <iconify-icon icon="ph:heart-fill" class="text-[#02a95c] text-xs"></iconify-icon>
                Lend a hand
              </span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">1 of 2 · Choose an amount</span>
            </div>

            <!-- Fundraiser progress snapshot -->
            <div class="rounded-2xl bg-slate-50 border border-slate-100 p-4 mb-5">
              <div class="flex items-baseline justify-between mb-1.5">
                <p class="font-black text-slate-900 text-lg">{{ formatMoney(raised) }}</p>
                <p class="text-xs font-semibold text-slate-400">
                  raised of {{ formatMoney(goal) }} goal
                </p>
              </div>
              <div class="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
                <div class="h-full bg-[#02a95c] rounded-full transition-all duration-500"
                  :style="{ width: progressPercent + '%' }"></div>
              </div>
              <div class="flex justify-between items-center mt-1.5 text-[11px] font-semibold text-slate-500">
                <span>{{ progressPercent }}% completed</span>
                <span>{{ donorCount.toLocaleString() }} donations</span>
              </div>
            </div>

            <p class="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Choose your donation amount</p>

            <!-- Preset chips -->
            <div class="grid grid-cols-4 gap-2 mb-2">
              <button v-for="amt in presets" :key="amt" type="button" @click="donationAmount = amt"
                class="py-2.5 rounded-full border-2 font-black text-sm cursor-pointer transition text-center"
                :class="donationAmount === amt
                  ? 'bg-[#024731] border-[#024731] text-white shadow-md'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-[#024731] hover:text-[#024731]'">
                {{ presetLabel(amt) }}
              </button>
            </div>

            <!-- Custom amount -->
            <div class="relative mb-1">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 font-black text-sm text-slate-400">{{ symbol }}</span>
              <input type="text" inputmode="numeric" :value="donationAmount || ''" @input="typingAmount"
                placeholder="Enter custom amount"
                class="w-full pl-12 pr-4 py-3 rounded-xl border-2 font-black text-sm text-slate-900 focus:outline-none focus:border-[#02a95c] transition placeholder:font-semibold placeholder:text-slate-300"
                :class="presets.includes(donationAmount) ? 'border-slate-200' : 'border-[#02a95c] bg-[#f0fef5]'" />

              <p class="text-[11px] text-slate-400 font-medium mt-1.5">
                Minimum donation is {{ formatMoney(minAmount) }}. Your generosity is tax-deductible.
              </p>
            </div>

            <p class="text-xs font-bold text-slate-600 mb-3">
              You'll donate: <span class="font-black text-[#024731]">{{ donationAmount > 0 ? formatMoney(donationAmount) : '—' }}</span>
            </p>

            <div v-if="errorMessage" class="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {{ errorMessage }}
            </div>

            <button @click="goToDetails" :disabled="donationAmount < minAmount"
              class="w-full py-3.5 rounded-2xl bg-[#024731] hover:bg-[#013424] disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-black text-sm transition-all cursor-pointer">
              Donate now
            </button>

            <p class="text-center text-[11px] text-slate-400 font-medium mt-3">
              You'll review your donation before paying. See the
              <a href="#" class="text-[#024731] underline font-bold">Terms of Service</a>.
            </p>
          </div>

          <!-- ================= Details step ================= -->
          <div v-else-if="modalStep === 'details'" class="p-5 sm:p-6">
            <div class="flex items-center gap-2 mb-4">
              <button @click="modalStep = 'amount'" class="text-slate-400 hover:text-slate-700 cursor-pointer">
                <iconify-icon icon="ph:arrow-left-bold"></iconify-icon>
              </button>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">2 of 2 · Your information</span>
            </div>

            <!-- Donation summary -->
            <div class="rounded-2xl bg-[#f0fef5] border border-[#bbf770] px-4 py-3 mb-5 flex items-center justify-between">
              <div>
                <p class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Your donation</p>
                <p class="font-black text-slate-900 text-lg">{{ formatMoney(donationAmount) }}</p>
              </div>
              <span class="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white text-[#024731] border border-[#bbf770]">
                <iconify-icon icon="ph:shield-check-fill" class="text-[#02a95c]"></iconify-icon>
                Secure payment
              </span>
            </div>

            <form @submit.prevent="submitDonation" class="flex flex-col gap-3">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="flex flex-col">
                  <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Your name</label>
                  <input v-model="donorName" :disabled="isAnonymous" type="text" placeholder="John Doe"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#024731] text-sm font-semibold disabled:bg-slate-100" />
                </div>
                <div class="flex flex-col">
                  <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email (for receipt)</label>
                  <input v-model="donorEmail" type="email" placeholder="donor@example.com"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#024731] text-sm font-semibold" />
                </div>
              </div>

              <label class="flex items-start gap-2.5 cursor-pointer select-none">
                <input v-model="isAnonymous" type="checkbox"
                  class="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#024731] focus:ring-[#024731] cursor-pointer" />
                <span class="text-xs font-semibold text-slate-600 leading-relaxed">
                  Don't display my name publicly on this fundraiser
                </span>
              </label>

              <div class="flex flex-col">
                <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Leave a message of support <span class="normal-case font-semibold text-slate-400">(optional)</span>
                </label>
                <textarea v-model="message" rows="2" placeholder="Send words of encouragement..."
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#024731] text-sm font-medium resize-none"></textarea>
              </div>

              <div v-if="errorMessage" class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {{ errorMessage }}
              </div>

              <button type="submit" :disabled="isSubmitting || donationAmount < minAmount"
                class="w-full py-3.5 rounded-2xl bg-[#024731] hover:bg-[#013424] disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-black text-sm transition-all cursor-pointer flex items-center justify-center gap-2">
                <span v-if="isSubmitting"
                  class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>{{ isSubmitting ? 'Connecting to secure checkout...' : `Donate ${formatMoney(donationAmount)} now` }}</span>
              </button>

              <p class="text-[11px] text-slate-400 font-medium text-center">
                Your donation is processed securely by a trusted payment provider. A small processing fee may apply.
              </p>
            </form>
          </div>

          <!-- ================= Success step ================= -->
          <div v-else class="p-6 sm:p-8 flex flex-col items-center text-center">
            <div
              class="w-16 h-16 rounded-full bg-[#edfce0] border-2 border-[#bbf770] text-[#02a95c] flex items-center justify-center text-3xl mb-4">
              <iconify-icon icon="ph:check-circle-fill"></iconify-icon>
            </div>
            <h3 class="text-lg font-black text-slate-900 mb-1">Thank you for your support!</h3>
            <p class="text-sm text-slate-500 font-medium mb-6">
              Your donation of {{ formatMoney(donationAmount) }} to {{ target.title }} has been received.
            </p>
            <button @click="close"
              class="w-full py-3 rounded-2xl bg-[#024731] hover:bg-[#013424] text-white font-black text-sm transition-all cursor-pointer">
              Done
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>