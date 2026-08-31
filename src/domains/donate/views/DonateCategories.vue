<script setup lang="ts">
import { ref } from 'vue'
import { useLandingStore } from '../../landing/stores'
import { storeToRefs } from 'pinia'
import NavHeader from '../../landing/components/NavHeader.vue'
import MainFooter from '../../landing/components/MainFooter.vue'

const store = useLandingStore()
const { categories, searchQuery, selectedCategory, filteredFundraisers } = storeToRefs(store)

const navHeaderRef = ref<any>(null)
const closeDropdowns = () => {
  navHeaderRef.value?.closeDropdowns()
}

// Simulated Donation Action
const activeFundraiserId = ref<string | null>(null)
const donationAmount = ref<number>(25)
const isDonating = ref(false)
const donationSuccess = ref(false)

const openDonateModal = (id: string) => {
  activeFundraiserId.value = id
  donationAmount.value = 25
  donationSuccess.value = false
  isDonating.value = false
}

const closeDonateModal = () => {
  activeFundraiserId.value = null
}

const handleDonate = async () => {
  if (activeFundraiserId.value && donationAmount.value > 0) {
    isDonating.value = true
    const success = await store.donateToFundraiser(activeFundraiserId.value, donationAmount.value)
    isDonating.value = false
    if (success) {
      donationSuccess.value = true
      setTimeout(() => {
        closeDonateModal()
      }, 1500)
    }
  }
}

const getProgressPercent = (raised: number, target: number) => {
  const percent = Math.round((raised / target) * 100)
  return percent > 100 ? 100 : percent
}
</script>

<template>
  <div class="min-h-screen bg-[#fafaf8] text-slate-800 font-sans text-left" @click="closeDropdowns">
    <NavHeader ref="navHeaderRef" />

    <main class="max-w-7xl mx-auto px-4 py-12">
      <!-- Breadcrumbs -->
      <nav class="text-xs font-semibold text-slate-400 mb-4 flex items-center gap-1.5">
        <RouterLink to="/" class="hover:text-[#024731] transition-colors">Home</RouterLink>
        <span>/</span>
        <span class="text-slate-600">Donate Categories</span>
      </nav>

      <!-- Hero Header -->
      <div class="mb-12">
        <span class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#bbf770] text-[#024731] text-xs font-black uppercase tracking-wider mb-4">
          EXPLORE CAUSES
        </span>
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight mb-4">
          Browse fundraisers by category
        </h1>
        <p class="text-slate-600 text-sm sm:text-base max-w-2xl leading-relaxed">
          Select a category below to explore verified campaigns raising money for critical medical needs, disaster relief, animal welfare, and community development worldwide.
        </p>
      </div>

      <!-- Categories Block Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        <div v-for="cat in categories" :key="cat.id" 
             @click="selectedCategory = cat.name"
             class="p-6 rounded-2xl border bg-white cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
             :class="selectedCategory === cat.name ? 'border-[#024731] ring-2 ring-[#024731]/20 bg-[#edfce0]/20' : 'border-slate-100'">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl" :class="cat.colorClass">
              <iconify-icon :icon="'lucide:' + cat.icon"></iconify-icon>
            </div>
            <h3 class="font-bold text-slate-900 text-base">{{ cat.name }}</h3>
          </div>
          <p class="text-slate-500 text-xs leading-relaxed mb-4">
            {{ cat.description }}
          </p>
          <span class="text-xs font-bold text-[#024731] flex items-center gap-1">
            Explore {{ cat.name }} campaigns ➔
          </span>
        </div>
      </div>

      <!-- Active Section Header -->
      <div class="border-t border-slate-100 pt-12 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-900">
            {{ selectedCategory || 'All Categories' }} Campaigns
          </h2>
          <p class="text-slate-400 text-xs mt-1">Showing {{ filteredFundraisers.length }} active campaigns.</p>
        </div>

        <!-- Inline Filters -->
        <div class="flex items-center gap-4">
          <button v-if="selectedCategory" @click="selectedCategory = null" class="text-xs font-bold text-[#024731] hover:underline cursor-pointer">
            Clear Category Filter
          </button>
          
          <div class="relative w-full max-w-xs">
            <input type="text" v-model="searchQuery" placeholder="Search inside category..." class="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#024731] text-xs font-medium bg-white" />
            <svg class="absolute left-3 top-2.5 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
        </div>
      </div>

      <!-- Fundraiser Grid -->
      <div v-if="filteredFundraisers.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="fund in filteredFundraisers" :key="fund.id" class="flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-lg transition-all group">
          <div class="aspect-video relative overflow-hidden bg-slate-100">
            <img :src="fund.imageUrl" class="w-full h-full object-cover group-hover:scale-103 transition-all duration-300" />
            <span class="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-[#024731] text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-[#d8fc9e] shadow-sm">
              {{ fund.category }}
            </span>
          </div>
          <div class="p-6 flex-1 flex flex-col justify-between">
            <div>
              <span class="text-[10px] text-slate-400 font-bold mb-1.5 block">{{ fund.city }}, {{ fund.country }}</span>
              <h3 class="font-bold text-slate-800 group-hover:text-[#024731] transition-colors mb-2 leading-snug line-clamp-1">{{ fund.title }}</h3>
              <p class="text-slate-500 text-xs line-clamp-2 mb-4 leading-relaxed">{{ fund.description }}</p>
            </div>
            
            <div class="mt-4 pt-4 border-t border-slate-50">
              <div class="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                <span>${{ fund.raisedAmount.toLocaleString() }} raised</span>
                <span class="text-[#024731] font-black">{{ getProgressPercent(fund.raisedAmount, fund.targetAmount) }}%</span>
              </div>
              <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-[#02a95c] rounded-full" :style="{ width: getProgressPercent(fund.raisedAmount, fund.targetAmount) + '%' }"></div>
              </div>
              
              <button @click="openDonateModal(fund.id)" class="w-full mt-4 bg-[#edfce0] hover:bg-[#024731] hover:text-white text-[#024731] text-xs font-bold py-2.5 rounded-xl transition-all border border-[#bbf770] hover:border-[#024731] cursor-pointer text-center">
                Donate Now
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="py-16 text-center bg-white rounded-2xl border border-slate-100 flex flex-col items-center">
        <svg class="text-slate-300 w-12 h-12 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
        <h3 class="text-base font-bold text-slate-700">No campaigns in this category yet</h3>
        <p class="text-slate-400 text-xs mt-1">Try clearing your filters or searching a different term.</p>
      </div>

    </main>

    <MainFooter />

    <!-- Simulate Donation Modal -->
    <div v-if="activeFundraiserId" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm" @click.self="closeDonateModal">
      <div class="bg-white rounded-3xl w-full max-w-md p-6 border border-slate-100 shadow-2xl animate-scale text-left relative">
        <button @click="closeDonateModal" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
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
            {{ store.fundraisers.find(f => f.id === activeFundraiserId)?.title }}
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
