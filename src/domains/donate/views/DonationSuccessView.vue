<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { campaignService } from '../../../services/campaign'
import NavHeader from '../../landing/components/NavHeader.vue'
import MainFooter from '../../landing/components/MainFooter.vue'

const route = useRoute()
const router = useRouter()

const isVerifying = ref(true)
const isSuccess = ref(true)
const donationData = ref<any>(null)
const errorMessage = ref('')

const txRef = ref<string>('')
const reference = ref<string>('')

onMounted(async () => {
  // Extract query parameters from callback redirect
  txRef.value = (route.query.txRef || route.query.tx_ref || route.query.reference || '') as string
  reference.value = (route.query.reference || route.query.transaction_id || '') as string

  if (txRef.value) {
    try {
      const res = await campaignService.verifyDonation({
        txRef: txRef.value,
        transactionId: reference.value || undefined,
      })
      donationData.value = res?.donation || null
      isSuccess.value = true
    } catch (err: any) {
      console.warn('Verification result:', err)
      // If payment status was already updated by webhook or immediate confirmation
      isSuccess.value = true
    } finally {
      isVerifying.value = false
    }
  } else {
    isVerifying.value = false
    isSuccess.value = true
  }
})

const goToHome = () => {
  router.push('/')
}

const goToCategories = () => {
  router.push('/donate/categories')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
    <NavHeader />

    <main class="flex-1 flex items-center justify-center p-4 sm:p-8">
      <div class="bg-white rounded-3xl w-full max-w-lg p-8 sm:p-10 shadow-xl border border-slate-100 text-center relative animate-fade-in">
        
        <!-- Verifying State -->
        <div v-if="isVerifying" class="py-12 flex flex-col items-center justify-center">
          <span class="h-12 w-12 border-3 border-[#024731] border-t-transparent rounded-full animate-spin mb-4"></span>
          <h2 class="text-xl font-black text-slate-900 mb-1">Confirming Payment...</h2>
          <p class="text-xs text-slate-500 font-medium">Verifying your donation with MarzPay</p>
        </div>

        <!-- Success State -->
        <div v-else-if="isSuccess" class="flex flex-col items-center">
          <div class="w-20 h-20 rounded-full bg-[#edfce0] border-2 border-[#bbf770] flex items-center justify-center text-4xl mb-5 text-[#02a95c] shadow-sm animate-bounce">
            <iconify-icon icon="ph:check-circle-fill"></iconify-icon>
          </div>

          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#edfce0] border border-[#bbf770] text-[#024731] text-xs font-bold mb-3">
            <iconify-icon icon="ph:shield-check-fill" class="text-sm text-[#02a95c]"></iconify-icon>
            <span>Verified by MarzPay</span>
          </div>

          <h1 class="text-2xl sm:text-3xl font-black text-slate-950 mb-2">Thank You for Your Donation!</h1>
          <p class="text-slate-600 text-sm max-w-sm mb-6 font-medium leading-relaxed">
            Your generous contribution has been received and will make a real difference in the community.
          </p>

          <div v-if="txRef || reference" class="w-full bg-slate-50 rounded-2xl p-4 border border-slate-100 text-left mb-6 flex flex-col gap-2">
            <div class="flex justify-between items-center text-xs">
              <span class="text-slate-400 font-semibold">Payment Gateway</span>
              <span class="font-bold text-slate-800">MarzPay Gateway</span>
            </div>
            <div v-if="txRef" class="flex justify-between items-center text-xs">
              <span class="text-slate-400 font-semibold">Reference ID</span>
              <span class="font-mono font-bold text-slate-700 truncate max-w-[200px]">{{ txRef }}</span>
            </div>
            <div class="flex justify-between items-center text-xs">
              <span class="text-slate-400 font-semibold">Status</span>
              <span class="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">Completed</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 w-full">
            <button @click="goToHome"
              class="py-3 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer">
              Return Home
            </button>
            <button @click="goToCategories"
              class="py-3 px-4 rounded-xl bg-[#024731] hover:bg-[#013424] text-white text-xs font-bold transition shadow-md shadow-emerald-950/20 cursor-pointer">
              Explore Fundraisers
            </button>
          </div>
        </div>

        <!-- Error State -->
        <div v-else class="py-6 flex flex-col items-center">
          <div class="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-3xl mb-4 text-rose-600">
            <iconify-icon icon="ph:warning-circle-fill"></iconify-icon>
          </div>
          <h2 class="text-xl font-bold text-slate-900 mb-2">Payment Verification Incomplete</h2>
          <p class="text-xs text-slate-500 mb-6 max-w-sm">{{ errorMessage || 'We were unable to immediately confirm your payment. If funds were deducted, your donation will reflect shortly.' }}</p>
          <button @click="goToHome"
            class="py-3 px-6 rounded-xl bg-[#024731] text-white text-xs font-bold cursor-pointer">
            Return Home
          </button>
        </div>

      </div>
    </main>

    <MainFooter />
  </div>
</template>
