<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { campaignService, type WithdrawalRecord } from '../../../services/campaign'

const props = withDefaults(
  defineProps<{
    campaignId: string
    raisedAmount: number
    currency?: string
  }>(),
  {
    currency: 'UGX',
  }
)

const withdrawals = ref<WithdrawalRecord[]>([])
const isLoading = ref(true)
const loadError = ref('')

// Request withdrawal modal state
const showWithdrawModal = ref(false)
const withdrawAmount = ref<number>(props.raisedAmount || 50000)
const payoutMethod = ref<'momo_mtn' | 'momo_airtel' | 'bank'>('momo_mtn')
const accountNumber = ref('')
const accountName = ref('')
const bankName = ref('')
const withdrawNotes = ref('')
const isSubmitting = ref(false)
const submitError = ref('')
const submitSuccess = ref(false)

const fetchWithdrawals = async () => {
  isLoading.value = true
  loadError.value = ''
  try {
    const list = await campaignService.listWithdrawals(props.campaignId)
    withdrawals.value = list
  } catch (err: any) {
    loadError.value = err.message || 'Failed to load transfer history.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchWithdrawals()
})

const openWithdrawModal = () => {
  withdrawAmount.value = props.raisedAmount > 0 ? props.raisedAmount : 50000
  accountNumber.value = ''
  accountName.value = ''
  bankName.value = ''
  withdrawNotes.value = ''
  submitError.value = ''
  submitSuccess.value = false
  showWithdrawModal.value = true
}

const handleRequestWithdrawal = async () => {
  if (withdrawAmount.value <= 0) {
    submitError.value = 'Please specify a valid withdrawal amount.'
    return
  }
  if (!accountNumber.value.trim()) {
    submitError.value = 'Please provide your account / phone number.'
    return
  }

  isSubmitting.value = true
  submitError.value = ''

  let destinationSummary = `${payoutMethod.value.toUpperCase()} - ${accountNumber.value}`
  if (accountName.value.trim()) destinationSummary += ` (${accountName.value.trim()})`
  if (bankName.value.trim()) destinationSummary += ` at ${bankName.value.trim()}`
  if (withdrawNotes.value.trim()) destinationSummary += ` - ${withdrawNotes.value.trim()}`

  try {
    await campaignService.createWithdrawal({
      campaignId: props.campaignId,
      amount: withdrawAmount.value,
      currency: props.currency,
      notes: destinationSummary,
    })

    submitSuccess.value = true
    await fetchWithdrawals()
    setTimeout(() => {
      showWithdrawModal.value = false
    }, 2000)
  } catch (err: any) {
    submitError.value = err.message || 'Failed to request withdrawal. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

const formatStatus = (status: string) => {
  switch (status) {
    case 'completed':
      return { label: 'Completed', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
    case 'processing':
      return { label: 'Processing', class: 'bg-blue-50 text-blue-700 border-blue-200' }
    case 'failed':
      return { label: 'Failed', class: 'bg-rose-50 text-rose-700 border-rose-200' }
    default:
      return { label: 'Pending Approval', class: 'bg-amber-50 text-amber-700 border-amber-200' }
  }
}
</script>

<template>
  <div class="flex flex-col gap-6 animate-fade-in text-left">
    <!-- Header Row -->
    <div class="border-b border-slate-150 pb-4 mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-black text-slate-900 mb-1">Transfers & Payouts</h2>
        <span class="text-xs text-slate-500 font-semibold">
          Withdraw funds directly to your Mobile Money number or verified Bank account.
        </span>
      </div>

      <button
        @click="openWithdrawModal"
        class="bg-[#024731] hover:bg-[#013424] text-white font-extrabold text-xs px-6 py-3 rounded-full transition-all shadow-md self-start sm:self-auto cursor-pointer"
      >
        Request Payout
      </button>
    </div>

    <!-- Balance Banner -->
    <div class="bg-gradient-to-r from-[#edfce0] via-emerald-50 to-white border border-[#bbf770] rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Available Campaign Balance</span>
        <h3 class="text-3xl font-black text-[#024731]">
          {{ currency }} {{ Number(raisedAmount).toLocaleString() }}
        </h3>
        <p class="text-[11px] text-slate-500 font-semibold mt-1">
          Zero platform fees. Funds are disbursed within 1-2 business hours.
        </p>
      </div>

      <button
        @click="openWithdrawModal"
        class="bg-white border border-slate-200 hover:border-[#024731] text-[#024731] font-extrabold text-xs px-5 py-2.5 rounded-full transition-all shadow-xs cursor-pointer"
      >
        Withdraw Funds
      </button>
    </div>

    <!-- Payout History Section -->
    <div class="flex flex-col gap-4 mt-2">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-extrabold text-slate-900">Withdrawal History</h3>
        <button @click="fetchWithdrawals" class="text-xs font-bold text-[#024731] hover:underline cursor-pointer">Refresh</button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="p-8 text-center bg-white rounded-2xl border border-slate-100">
        <span class="h-6 w-6 border-2 border-[#024731] border-t-transparent rounded-full animate-spin inline-block mb-2"></span>
        <p class="text-xs font-bold text-slate-500">Loading payout records...</p>
      </div>

      <!-- List of withdrawals -->
      <div v-else-if="withdrawals.length > 0" class="flex flex-col gap-3">
        <div
          v-for="w in withdrawals"
          :key="w.id"
          class="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 text-[#024731] flex items-center justify-center font-bold text-base shrink-0">
              <iconify-icon icon="ph:bank-bold"></iconify-icon>
            </div>
            <div>
              <div class="flex items-center gap-2 mb-0.5">
                <h4 class="font-extrabold text-slate-900 text-sm">
                  {{ w.currency }} {{ Number(w.amount).toLocaleString() }}
                </h4>
                <span
                  class="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border"
                  :class="formatStatus(w.status).class"
                >
                  {{ formatStatus(w.status).label }}
                </span>
              </div>
              <p class="text-slate-400 text-xs font-medium">
                {{ typeof w.notes === 'string' ? w.notes : (w.notes?.Valid ? w.notes.String : 'Direct Transfer') }} &bull; {{ new Date(w.createdAt).toLocaleDateString() }}
              </p>
            </div>
          </div>

          <div class="text-right text-xs font-semibold text-slate-500">
            <span v-if="w.status === 'completed'" class="text-emerald-700 font-bold">Disbursed</span>
            <span v-else-if="w.status === 'processing'" class="text-blue-700 font-bold">In transit</span>
            <span v-else class="text-amber-700 font-bold">Reviewing</span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white border border-dashed border-slate-200 rounded-3xl p-10 text-center flex flex-col items-center justify-center">
        <iconify-icon icon="ph:receipt-bold" class="text-slate-300 text-4xl mb-2.5"></iconify-icon>
        <h4 class="font-bold text-slate-800 text-sm mb-1">No withdrawals yet</h4>
        <p class="text-slate-400 text-xs font-medium max-w-sm leading-relaxed mb-4">
          When you are ready to withdraw raised funds, submit a payout request here to transfer money to your phone or bank.
        </p>
        <button
          @click="openWithdrawModal"
          class="bg-[#024731] hover:bg-[#013424] text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-xs cursor-pointer"
        >
          Request First Withdrawal
        </button>
      </div>
    </div>

    <!-- REQUEST WITHDRAWAL MODAL -->
    <div v-if="showWithdrawModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl w-full max-w-md p-6 border border-slate-100 shadow-2xl relative animate-in fade-in duration-200">
        <button @click="showWithdrawModal = false" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xl cursor-pointer">
          <iconify-icon icon="ph:x-bold"></iconify-icon>
        </button>

        <!-- Success view -->
        <div v-if="submitSuccess" class="py-8 text-center">
          <div class="w-14 h-14 rounded-full bg-[#edfce0] border border-[#bbf770] flex items-center justify-center text-3xl mb-3 text-[#02a95c] mx-auto">
            <iconify-icon icon="ph:check-circle-fill"></iconify-icon>
          </div>
          <h3 class="text-xl font-bold text-slate-900 mb-1">Withdrawal Requested!</h3>
          <p class="text-slate-500 text-xs font-semibold leading-relaxed">
            Your request for {{ currency }} {{ Number(withdrawAmount).toLocaleString() }} has been submitted and is being processed.
          </p>
        </div>

        <!-- Form view -->
        <div v-else>
          <h3 class="text-lg font-black text-slate-900 mb-1">Request Withdrawal</h3>
          <p class="text-xs text-slate-400 mb-5 font-semibold">Disburse funds to your registered payment channel.</p>

          <div v-if="submitError" class="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {{ submitError }}
          </div>

          <form @submit.prevent="handleRequestWithdrawal" class="flex flex-col gap-4">
            <!-- Amount -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Withdrawal Amount</label>
              <div class="relative rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-[#024731]">
                <span class="absolute left-3 top-3 text-xs font-bold text-slate-500">{{ currency }}</span>
                <input
                  type="number"
                  v-model="withdrawAmount"
                  required
                  min="5000"
                  class="w-full pl-14 pr-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <!-- Method Selection -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Payout Method</label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  @click="payoutMethod = 'momo_mtn'"
                  class="py-2.5 px-2 rounded-xl border font-bold text-xs flex flex-col items-center gap-1 transition-all cursor-pointer"
                  :class="payoutMethod === 'momo_mtn' ? 'bg-[#edfce0] border-[#024731] text-[#024731]' : 'border-slate-200 text-slate-600'"
                >
                  <iconify-icon icon="ph:device-mobile-bold" class="text-base"></iconify-icon>
                  <span>MTN MoMo</span>
                </button>
                <button
                  type="button"
                  @click="payoutMethod = 'momo_airtel'"
                  class="py-2.5 px-2 rounded-xl border font-bold text-xs flex flex-col items-center gap-1 transition-all cursor-pointer"
                  :class="payoutMethod === 'momo_airtel' ? 'bg-[#edfce0] border-[#024731] text-[#024731]' : 'border-slate-200 text-slate-600'"
                >
                  <iconify-icon icon="ph:device-mobile-bold" class="text-base"></iconify-icon>
                  <span>Airtel Money</span>
                </button>
                <button
                  type="button"
                  @click="payoutMethod = 'bank'"
                  class="py-2.5 px-2 rounded-xl border font-bold text-xs flex flex-col items-center gap-1 transition-all cursor-pointer"
                  :class="payoutMethod === 'bank' ? 'bg-[#edfce0] border-[#024731] text-[#024731]' : 'border-slate-200 text-slate-600'"
                >
                  <iconify-icon icon="ph:bank-bold" class="text-base"></iconify-icon>
                  <span>Bank Account</span>
                </button>
              </div>
            </div>

            <!-- Destination Account / Phone Number -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">
                {{ payoutMethod === 'bank' ? 'Bank Account Number' : 'Mobile Money Phone Number' }}
              </label>
              <input
                type="text"
                v-model="accountNumber"
                required
                :placeholder="payoutMethod === 'bank' ? 'e.g. 010203040506' : '+256 700 000 000'"
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#024731] text-xs font-semibold"
              />
            </div>

            <!-- Optional Bank Name if Bank -->
            <div v-if="payoutMethod === 'bank'">
              <label class="block text-xs font-bold text-slate-700 mb-1">Bank Name</label>
              <input
                type="text"
                v-model="bankName"
                placeholder="e.g. Stanbic Bank Uganda"
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#024731] text-xs font-semibold"
              />
            </div>

            <!-- Account Name -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Account Holder Name</label>
              <input
                type="text"
                v-model="accountName"
                placeholder="Full legal name"
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#024731] text-xs font-semibold"
              />
            </div>

            <button
              type="submit"
              :disabled="isSubmitting"
              class="w-full mt-2 py-3 bg-[#024731] hover:bg-[#013424] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span v-if="isSubmitting" class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Submit Withdrawal Request</span>
            </button>
          </form>
        </div>
      </div>
    </div>

  </div>
</template>
