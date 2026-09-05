<script setup lang="ts">
import { ref } from 'vue'
import NavHeader from '../../landing/components/NavHeader.vue'
import MainFooter from '../../landing/components/MainFooter.vue'

const navHeaderRef = ref<any>(null)
const closeDropdowns = () => {
  navHeaderRef.value?.closeDropdowns()
}

// Mock Signature Funds (Screenshot 1)
const funds = ref([
  {
    id: 'fund-flood',
    name: 'Flood Relief Fund',
    category: 'Signature Impact Funds',
    description: 'Provides rapid emergency relief to communities facing severe flooding. Funds go toward housing, food, and urgent repairs.',
    raisedAmount: 185000,
    targetAmount: 250000,
    imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'fund-hurricane',
    name: 'Hurricane Relief Fund',
    category: 'Signature Impact Funds',
    description: 'Enables quick support for victims of destructive storms, deploying immediate medical packages and supply transfers.',
    raisedAmount: 295000,
    targetAmount: 400000,
    imageUrl: 'https://images.unsplash.com/photo-1527030280862-64139fbe04ca?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'fund-wildfire',
    name: 'Wildfire Relief Fund',
    category: 'Signature Impact Funds',
    description: 'Helps fire departments and displaced families during critical forest fires, funding animal shelters and emergency supplies.',
    raisedAmount: 320000,
    targetAmount: 350000,
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'fund-essentials',
    name: 'Essentials Fund',
    category: 'Signature Impact Funds',
    description: 'Covers essential expenses including food distributions, healthcare, clothing, and transport for vulnerable populations.',
    raisedAmount: 95000,
    targetAmount: 150000,
    imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=600'
  }
])

// Simulate Donation States
const activeFundId = ref<string | null>(null)
const donationAmount = ref<number>(100)
const isDonating = ref(false)
const donationSuccess = ref(false)

const openDonateModal = (id: string) => {
  activeFundId.value = id
  donationAmount.value = 100
  donationSuccess.value = false
  isDonating.value = false
}

const closeDonateModal = () => {
  activeFundId.value = null
}

const handleDonate = async () => {
  const fund = funds.value.find(f => f.id === activeFundId.value)
  if (fund && donationAmount.value > 0) {
    isDonating.value = true
    await new Promise(resolve => setTimeout(resolve, 800))
    fund.raisedAmount += donationAmount.value
    isDonating.value = false
    donationSuccess.value = true
    setTimeout(() => {
      closeDonateModal()
    }, 1500)
  }
}

const getProgressPercent = (raised: number, target: number) => {
  return Math.min(Math.round((raised / target) * 100), 100)
}
</script>

<template>
  <div class="min-h-screen bg-[#fafaf8] text-slate-800 font-sans text-left animate-fade-in" @click="closeDropdowns">
    <NavHeader ref="navHeaderRef" />

    <main class="max-w-7xl mx-auto px-4 py-16">
      <!-- Breadcrumbs -->
      <nav class="text-xs font-semibold text-slate-400 mb-6 flex items-center gap-1.5">
        <RouterLink to="/" class="hover:text-[#024731] transition-colors">Home</RouterLink>
        <span>/</span>
        <span class="text-slate-600">Signature Funds</span>
      </nav>

      <!-- Signature Funds Header -->
      <div class="text-center max-w-4xl mx-auto mb-12">
        <span class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#bbf770] text-[#024731] text-xs font-black uppercase tracking-wider mb-4">
          DIRECT CRISIS RELIEF
        </span>
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-tight mb-6">
          Signature Funds
        </h1>
        <p class="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto">
          Our Signature Impact funds provide rapid, dignified relief in times of crisis. Using HelpFund's trusted tools, we verify recipients and deliver grants—often within 24 hours—to help cover urgent needs, including housing, food, clothing, transportation, repairs, and other essential expenses.
        </p>
      </div>

      <!-- Divider line -->
      <hr class="border-slate-200/60 mb-16" />

      <!-- Grid Layout for 4 funds -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
        <div v-for="fund in funds" :key="fund.id" @click="openDonateModal(fund.id)" class="group bg-white rounded-3xl border border-slate-100/80 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer">
          <div>
            <div class="aspect-[16/10] overflow-hidden bg-slate-100 relative">
              <img :src="fund.imageUrl" class="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" :alt="fund.name" />
              <span class="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-[#024731] text-[10px] font-black uppercase px-3 py-1 rounded-full border border-[#d8fc9e] shadow-sm">
                {{ fund.category }}
              </span>
            </div>
            <div class="p-6">
              <h3 class="font-extrabold text-slate-900 text-xl mb-1 group-hover:text-[#024731] transition-colors">{{ fund.name }}</h3>
              <p class="text-slate-500 text-xs sm:text-sm leading-relaxed mt-2">{{ fund.description }}</p>
            </div>
          </div>

          <div class="p-6 pt-0">
            <!-- Simulated progress metrics -->
            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-4 text-xs font-bold text-slate-700">
              <div class="flex items-center justify-between mb-1.5">
                <span>${{ fund.raisedAmount.toLocaleString() }} raised</span>
                <span class="text-[#024731] font-black">{{ getProgressPercent(fund.raisedAmount, fund.targetAmount) }}%</span>
              </div>
              <div class="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div class="h-full bg-[#02a95c] rounded-full transition-all duration-500" :style="{ width: getProgressPercent(fund.raisedAmount, fund.targetAmount) + '%' }"></div>
              </div>
            </div>
            <button class="w-full bg-[#024731] hover:bg-[#013424] text-white text-xs font-bold py-3.5 rounded-xl transition-all shadow-md shadow-emerald-950/15 text-center cursor-pointer">
              Donate to {{ fund.name }}
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Ways to Give GoFundMe Forest Green Section -->
    <section class="bg-[#024731] text-white py-16 text-center border-t border-emerald-950">
      <div class="max-w-4xl mx-auto px-4">
        <span class="inline-flex items-center px-3 py-1 rounded-full bg-[#bbf770] text-[#024731] text-xs font-black uppercase tracking-wider mb-4">
          FLEXIBLE GIVING
        </span>
        <h2 class="text-3xl sm:text-4xl font-black mb-4 text-white">Ways to Give</h2>
        <p class="text-emerald-100/90 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
          We accept tax-deductible donations via checks, crypto, donor-advised funds (DAFs), and wire or ACH transfers.
        </p>
        <button @click="openDonateModal('fund-flood')" class="bg-white hover:bg-emerald-50 text-[#024731] font-black px-8 py-3.5 rounded-full shadow-lg hover:scale-[1.02] transition-all text-sm cursor-pointer">
          Make a donation
        </button>
      </div>
    </section>

    <MainFooter />

    <!-- Simulate Donation Modal -->
    <div v-if="activeFundId" class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/60 backdrop-blur-sm" @click.self="closeDonateModal">
      <div class="bg-white rounded-2xl sm:rounded-3xl w-full max-w-md max-h-[calc(100vh-1rem)] sm:max-h-[calc(100vh-2rem)] overflow-y-auto p-4 sm:p-6 border border-slate-100 shadow-2xl animate-scale text-left relative">
        <button @click="closeDonateModal" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div v-if="donationSuccess" class="py-12 flex flex-col items-center justify-center text-center">
          <div class="w-16 h-16 rounded-full bg-[#edfce0] text-[#02a95c] border-2 border-[#bbf770] flex items-center justify-center text-3xl mb-4 animate-bounce font-black">
            ✓
          </div>
          <h3 class="text-xl font-black text-slate-900 mb-1">Thank You!</h3>
          <p class="text-slate-600 text-sm font-medium">Your simulated donation of ${{ donationAmount }} was received.</p>
        </div>

        <div v-else>
          <span class="text-xs text-[#024731] font-black uppercase tracking-wider">Simulate Donation</span>
          <h3 class="text-lg font-black text-slate-900 mt-1 mb-4 leading-tight">
            {{ funds.find(f => f.id === activeFundId)?.name || 'Signature Fund' }}
          </h3>

          <form @submit.prevent="handleDonate" class="flex flex-col gap-4">
            <div class="flex flex-col">
              <label class="text-xs text-slate-600 font-bold mb-1.5">Donation Amount ($)</label>
              <input type="number" v-model="donationAmount" min="5" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#024731] text-sm" />
            </div>
            <button type="submit" :disabled="isDonating" class="w-full bg-[#024731] hover:bg-[#013424] text-white text-sm font-bold py-3.5 rounded-xl transition-all shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2 cursor-pointer">
              <span v-if="isDonating" class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Confirm Donation</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
