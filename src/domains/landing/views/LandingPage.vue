<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLandingStore } from '../stores'
import { storeToRefs } from 'pinia'
import NavHeader from '../components/NavHeader.vue'
import MainFooter from '../components/MainFooter.vue'

const router = useRouter()
const store = useLandingStore()
const { faqs, searchQuery, selectedCategory, filteredFundraisers } = storeToRefs(store)

const navHeaderRef = ref<any>(null)
const closeDropdowns = () => {
  navHeaderRef.value?.closeDropdowns()
}

// Support Banner State
const showBanner = ref(true)

// Donation Modal Simulator States
const activeFundraiserId = ref<string | null>(null)
const donationAmount = ref<number>(25)
const isDonating = ref(false)
const donationSuccess = ref(false)

const activeFundraiser = computed(() => {
  return store.fundraisers.find(f => f.id === activeFundraiserId.value) || null
})

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

// Helper: Calculate progress percentage
const getProgressPercent = (raised: number, target: number) => {
  const percent = Math.round((raised / target) * 100)
  return percent > 100 ? 100 : percent
}

const startFundraiser = () => {
  router.push('/signup')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50/50 text-slate-800 font-sans" @click="closeDropdowns">

    <!-- Support Banner (Top) -->
    <div v-if="showBanner"
      class="bg-blue-50 text-blue-700 py-3 px-4 text-sm font-medium border-b border-blue-100 transition-all duration-300">
      <div class="max-w-7xl mx-auto flex items-center justify-center relative">
        <div class="flex items-center gap-2">
          <span class="flex h-2 w-2 relative">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span class="text-center">Support urgent earthquake relief and future recovery in Colombia. <RouterLink
              to="/donate/crisis-relief" class="underline hover:text-blue-900 font-bold">Learn more</RouterLink></span>
        </div>
        <button @click="showBanner = false" class="text-blue-500 hover:text-blue-800 p-1 absolute right-0 hidden sm:block">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor"
            stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Reusable Navbar -->
    <NavHeader ref="navHeaderRef" />

    <!-- Hero Section -->
    <section class="max-w-7xl mx-auto px-4 pt-12 pb-24 text-center flex flex-col items-center">
      <span
        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-6">
        #1 crowdfunding platform
      </span>
      <h1 class="text-4xl sm:text-6xl font-black text-slate-900 leading-tight tracking-tight mb-8 max-w-4xl">
        Where successful <br class="hidden sm:inline" /> fundraisers start
      </h1>
      <div class="mb-16">
        <button @click="startFundraiser"
          class="bg-blue-600 hover:bg-blue-700 text-white text-base font-bold px-10 py-4 rounded-full shadow-lg shadow-blue-200/50 hover:shadow-xl hover:scale-[1.02] transition-all text-center">
          Start a HelpFund
        </button>
      </div>

      <!-- 5 Overlapping Curved Images Container forming an arch -->
      <div class="w-full max-w-6xl mt-4 px-4">
        <div class="grid grid-cols-5 gap-3 md:gap-4 items-end relative min-h-[220px] md:min-h-[280px]">
          <!-- Image 1: Leftmost, tilted down and outward -->
          <div
            class="rounded-2xl md:rounded-[24px] overflow-hidden shadow-lg border border-slate-100/50 rotate-[-16deg] translate-y-[40px] scale-[0.85] origin-bottom hover:scale-[0.9] transition-all duration-300">
            <img src="https://images.unsplash.com/photo-1531983412531-1f49a365ffed?auto=format&fit=crop&q=80&w=300"
              class="w-full aspect-[4/5] object-cover" alt="Mom and baby" />
          </div>
          <!-- Image 2: Left, slightly tilted -->
          <div
            class="rounded-2xl md:rounded-[24px] overflow-hidden shadow-lg border border-slate-100/50 rotate-[-8deg] translate-y-[15px] scale-[0.95] origin-bottom hover:scale-[1.0] transition-all duration-300">
            <img src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=300"
              class="w-full aspect-[4/5] object-cover" alt="Volunteer help" />
          </div>
          <!-- Image 3: Center, straight and highlighted -->
          <div
            class="rounded-2xl md:rounded-[24px] overflow-hidden shadow-xl border border-slate-100/50 rotate-0 translate-y-[-10px] scale-[1.05] origin-bottom hover:scale-[1.1] transition-all duration-300 z-10">
            <img src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=300"
              class="w-full aspect-[4/5] object-cover" alt="Volunteer dog support" />
          </div>
          <!-- Image 4: Right, slightly tilted -->
          <div
            class="rounded-2xl md:rounded-[24px] overflow-hidden shadow-lg border border-slate-100/50 rotate-[8deg] translate-y-[15px] scale-[0.95] origin-bottom hover:scale-[1.0] transition-all duration-300">
            <img src="https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=300"
              class="w-full aspect-[4/5] object-cover" alt="Rowers teamwork" />
          </div>
          <!-- Image 5: Rightmost, tilted down and outward -->
          <div
            class="rounded-2xl md:rounded-[24px] overflow-hidden shadow-lg border border-slate-100/50 rotate-[16deg] translate-y-[40px] scale-[0.85] origin-bottom hover:scale-[0.9] transition-all duration-300">
            <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300"
              class="w-full aspect-[4/5] object-cover" alt="Smiling coordinator" />
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Banner -->
    <section class="bg-blue-600 text-white py-12">
      <div class="max-w-4xl mx-auto px-4 text-center">
        <h2 class="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight text-white leading-tight">
          More than $50 million raised every week on HelpFund.
        </h2>
        <p class="text-blue-100 text-lg max-w-xl mx-auto mb-6">
          With a global community of millions, HelpFund provides the direct connection, verification, and support to
          start raising money immediately.
        </p>
        <button @click="startFundraiser"
          class="bg-white text-blue-600 hover:bg-blue-50 font-bold px-6 py-3 rounded-full shadow-md transition-all">
          Start Fundraising Now
        </button>
      </div>
    </section>

    <!-- How HelpFund works -->
    <section id="how-it-works" class="max-w-7xl mx-auto px-4 py-20 text-center">
      <span class="text-blue-600 font-bold text-xs uppercase tracking-wider">Simple Steps</span>
      <h2 class="text-3xl sm:text-4xl font-black text-slate-900 mt-2 mb-12">
        Fundraising on HelpFund is easy, powerful, and trusted.
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
        <!-- Step 1 -->
        <div
          class="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100 group hover:border-blue-100 transition-colors">
          <div
            class="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            1
          </div>
          <h3 class="text-lg font-bold text-slate-800 mb-3">Start with the basics</h3>
          <p class="text-slate-500 text-sm leading-relaxed">
            Set your fundraising goal, name your fundraiser, and tell your unique story. Add a photo or video to engage
            readers.
          </p>
        </div>
        <!-- Step 2 -->
        <div
          class="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100 group hover:border-blue-100 transition-colors">
          <div
            class="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            2
          </div>
          <h3 class="text-lg font-bold text-slate-800 mb-3">Share with friends</h3>
          <p class="text-slate-500 text-sm leading-relaxed">
            Send emails, share on Facebook and Instagram, text your community, and post updates to keep donors involved
            in your journey.
          </p>
        </div>
        <!-- Step 3 -->
        <div
          class="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100 group hover:border-blue-100 transition-colors">
          <div
            class="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            3
          </div>
          <h3 class="text-lg font-bold text-slate-800 mb-3">Accept donations</h3>
          <p class="text-slate-500 text-sm leading-relaxed">
            Receive support from across the world. Request transfers directly to your bank account and thank your
            supporters.
          </p>
        </div>
      </div>
    </section>

    <!-- Fundraiser Discovery / Explorer Section -->
    <section id="explore" class="bg-white border-y border-slate-100 py-20">
      <div class="max-w-7xl mx-auto px-4">

        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div class="text-left">
            <span class="text-blue-600 font-bold text-xs uppercase tracking-wider">Discover Fundraisers</span>
            <h2 class="text-3xl sm:text-4xl font-black text-slate-900 mt-2">
              Browse fundraisers by what you care about
            </h2>
          </div>
          <!-- Search bar inside explorer -->
          <div class="relative w-full max-w-sm">
            <input type="text" v-model="searchQuery" placeholder="Search fundraisers..."
              class="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition-all" />
            <svg class="absolute left-3.5 top-3 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="16"
              height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
        </div>

        <!-- Category Tabs -->
        <div class="flex items-center gap-2 overflow-x-auto pb-4 mb-8 -mx-4 px-4 scrollbar-none">
          <button @click="selectedCategory = null"
            class="px-5 py-2 rounded-full text-sm font-semibold border transition-all whitespace-nowrap"
            :class="!selectedCategory ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'">
            All Fundraisers
          </button>
          <button v-for="cat in store.categories" :key="cat.id" @click="selectedCategory = cat.name"
            class="px-5 py-2 rounded-full text-sm font-semibold border transition-all whitespace-nowrap"
            :class="selectedCategory === cat.name ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'">
            {{ cat.name }}
          </button>
        </div>

        <!-- Cards Grid -->
        <div v-if="filteredFundraisers.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="fund in filteredFundraisers" :key="fund.id"
            class="flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
            <!-- Thumbnail Image -->
            <div class="aspect-video relative overflow-hidden bg-slate-100">
              <img :src="fund.imageUrl"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                alt="Fundraiser image" />
              <span
                class="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-blue-700 border border-blue-100/50 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-sm">
                {{ fund.category }}
              </span>
            </div>
            <!-- Body -->
            <div class="p-6 flex-1 flex flex-col text-left">
              <span class="text-xs text-slate-400 font-semibold mb-2 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor"
                  stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25z" />
                </svg>
                {{ fund.city }}, {{ fund.country }}
              </span>
              <h3
                class="font-bold text-slate-800 group-hover:text-blue-600 transition-colors mb-2 leading-snug line-clamp-1">
                {{ fund.title }}
              </h3>
              <p class="text-slate-500 text-xs mb-4 line-clamp-2 leading-relaxed">
                {{ fund.description }}
              </p>

              <!-- Progress Bar -->
              <div class="mt-auto pt-4 border-t border-slate-50">
                <div class="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>${{ fund.raisedAmount.toLocaleString() }} raised</span>
                  <span class="text-blue-600">{{ getProgressPercent(fund.raisedAmount, fund.targetAmount) }}%</span>
                </div>
                <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full bg-blue-600 rounded-full transition-all duration-500"
                    :style="{ width: getProgressPercent(fund.raisedAmount, fund.targetAmount) + '%' }"></div>
                </div>
                <div class="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-medium">
                  <span>{{ fund.donorCount }} donors</span>
                  <span>{{ fund.daysLeft }} days left</span>
                </div>
              </div>

              <!-- Inline Quick Donate Trigger -->
              <button @click="openDonateModal(fund.id)"
                class="w-full mt-4 bg-slate-50 hover:bg-blue-600 hover:text-white text-blue-600 text-xs font-bold py-2.5 rounded-xl transition-all border border-blue-50 hover:border-blue-600 text-center">
                Donate Now
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="py-20 text-center flex flex-col items-center">
          <svg class="text-slate-300 w-16 h-16 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none"
            stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <h3 class="text-lg font-bold text-slate-700 mb-1">No fundraisers found</h3>
          <p class="text-slate-400 text-sm">We couldn't find anything matching your search term.</p>
        </div>

      </div>
    </section>

    <!-- Success section yellow banner matching Image 5 -->
    <section class="bg-amber-400 py-16 text-slate-900 border-y border-amber-500/20 text-center">
      <div class="max-w-5xl mx-auto px-4">
        <span
          class="bg-amber-900/10 text-amber-950 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">Success
          Tips</span>
        <h2 class="text-3xl sm:text-4xl font-black tracking-tight mt-3 mb-4 leading-tight">
          Get what you need to help your fundraiser succeed on HelpFund
        </h2>
        <p class="text-amber-950/80 text-lg max-w-xl mx-auto mb-8">
          Gain access to local donation organizers, share sheets, tax relief guidelines, and smart dashboards to analyze
          donor trends.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-left">
          <div class="p-5 bg-white/70 rounded-xl border border-white/40">
            <h4 class="font-bold mb-2">HelpFund Toolkit</h4>
            <p class="text-xs text-slate-700">Pre-designed posters, social copy builders, and direct link QR codes to
              share your fundraiser offline.</p>
          </div>
          <div class="p-5 bg-white/70 rounded-xl border border-white/40">
            <h4 class="font-bold mb-2">Tax Deductibility</h4>
            <p class="text-xs text-slate-700">Verify 501(c)(3) tax exemptions for donors automatically and export tax
              receipt forms.</p>
          </div>
          <div class="p-5 bg-white/70 rounded-xl border border-white/40">
            <h4 class="font-bold mb-2">24/7 Safety Advisors</h4>
            <p class="text-xs text-slate-700">Chat with trust and safety specialists anytime to review compliance and
              secure withdrawals.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Mock Video section -->
    <section class="max-w-6xl mx-auto px-4 py-20 text-center">
      <span class="text-blue-600 font-bold text-xs uppercase tracking-wider">See It In Action</span>
      <h2 class="text-3xl font-black text-slate-900 mt-2 mb-10">How HelpFund works</h2>
      <div
        class="relative rounded-3xl overflow-hidden aspect-video max-w-4xl mx-auto bg-slate-950 shadow-2xl border border-slate-900 group">
        <!-- Mock thumbnail image -->
        <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1200"
          class="w-full h-full object-cover opacity-60 group-hover:scale-101 transition-all duration-700"
          alt="Video cover" />

        <!-- Hover overlay -->
        <div
          class="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/10 transition-colors flex items-center justify-center">
          <button
            class="w-20 h-20 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 hover:scale-110 transition-all">
            <svg class="ml-1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor"
              viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>

        <div
          class="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white text-xs font-semibold py-1 px-3 rounded-full">
          Watch: Rebuilding communities together (2:45)
        </div>
      </div>
    </section>

    <!-- Trusted Leader -->
    <section class="bg-slate-50 border-t border-slate-100 py-20 text-left">
      <div class="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <span class="text-blue-600 font-bold text-xs uppercase tracking-wider">Trust & Safety</span>
          <h2 class="text-3xl sm:text-4xl font-black mt-2 mb-6 text-slate-900">
            HelpFund is a trusted leader in online fundraising.
          </h2>
          <div class="flex flex-col gap-6">
            <div class="flex items-start gap-3">
              <div
                class="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                ✓</div>
              <div>
                <h4 class="font-bold text-sm mb-1 text-slate-800">HelpFund Giving Guarantee</h4>
                <p class="text-xs text-slate-500 leading-relaxed">In the rare event that something isn't right, we will
                  refund your donation or redirect it appropriately. Your trust is our commitment.</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div
                class="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                ✓</div>
              <div>
                <h4 class="font-bold text-sm mb-1 text-slate-800">Fraud Prevention Experts</h4>
                <p class="text-xs text-slate-500 leading-relaxed">Our advanced automated systems and manual audits check
                  details of campaigns daily to prevent bad actors and verify bank documents.</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div
                class="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                ✓</div>
              <div>
                <h4 class="font-bold text-sm mb-1 text-slate-800">Simple, Instant Withdrawals</h4>
                <p class="text-xs text-slate-500 leading-relaxed">Fundraisers don't have to reach their target to
                  withdraw. Take out what you need, whenever you need it, with secure local bank connections.</p>
              </div>
            </div>
          </div>
        </div>
        <div class="flex justify-center">
          <div
            class="relative max-w-sm w-full aspect-square rounded-3xl overflow-hidden bg-white shadow-xl border border-slate-100">
            <img src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=500"
              class="w-full h-full object-cover" alt="Volunteer profile" />
            <div
              class="absolute bottom-6 left-6 right-6 p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-100 shadow-md text-left">
              <h4 class="font-bold text-xs text-blue-600 mb-1">Impact Highlight</h4>
              <p class="text-xs text-slate-700">"Having safety advisers walk me through the tax guidelines was
                incredibly helpful. Highly secure platform!"</p>
              <span class="block text-[10px] text-slate-400 mt-2 font-bold">— Maria S., Volunteer Organizer</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Reusable Footer -->
    <MainFooter />

    <!-- Interactive Donation Modal (WOW Micro-Interaction Feature) -->
    <div v-if="activeFundraiserId"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm"
      @click.self="closeDonateModal">
      <div
        class="bg-white rounded-3xl w-full max-w-md p-6 border border-slate-100 shadow-2xl animate-scale text-left relative">
        <button @click="closeDonateModal" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor"
            stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Success Animation Overlay -->
        <div v-if="donationSuccess" class="py-12 flex flex-col items-center justify-center text-center">
          <div
            class="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center text-2xl mb-4 animate-bounce">
            ✓
          </div>
          <h3 class="text-xl font-bold text-slate-800 mb-1">Thank You!</h3>
          <p class="text-slate-500 text-sm">Your simulated donation of ${{ donationAmount }} was received.</p>
        </div>

        <!-- Form content -->
        <div v-else>
          <span class="text-xs text-blue-600 font-bold uppercase tracking-wider">Simulate Donation</span>
          <h3 class="text-lg font-black text-slate-900 mt-1 mb-4 leading-tight">
            {{ activeFundraiser?.title }}
          </h3>

          <div class="mb-5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span class="text-xs text-slate-400 block font-semibold mb-1">Current Progress</span>
            <div class="flex items-baseline gap-1 text-slate-800">
              <span class="text-lg font-bold">${{ activeFundraiser?.raisedAmount.toLocaleString() }}</span>
              <span class="text-xs text-slate-400 font-medium">raised of ${{
                activeFundraiser?.targetAmount.toLocaleString() }}</span>
            </div>
          </div>

          <form @submit.prevent="handleDonate" class="flex flex-col gap-4">
            <div class="flex flex-col">
              <label class="text-xs text-slate-500 font-semibold mb-1.5">Select or Input Donation Amount ($)</label>
              <!-- Presets -->
              <div class="grid grid-cols-4 gap-2 mb-3">
                <button type="button" @click="donationAmount = 10"
                  class="py-2.5 rounded-xl border text-sm font-bold transition-all text-center"
                  :class="donationAmount === 10 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'">$10</button>
                <button type="button" @click="donationAmount = 25"
                  class="py-2.5 rounded-xl border text-sm font-bold transition-all text-center"
                  :class="donationAmount === 25 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'">$25</button>
                <button type="button" @click="donationAmount = 50"
                  class="py-2.5 rounded-xl border text-sm font-bold transition-all text-center"
                  :class="donationAmount === 50 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'">$50</button>
                <button type="button" @click="donationAmount = 100"
                  class="py-2.5 rounded-xl border text-sm font-bold transition-all text-center"
                  :class="donationAmount === 100 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'">$100</button>
              </div>
              <input type="number" v-model="donationAmount" min="5" required
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm" />
            </div>

            <button type="submit" :disabled="isDonating || donationAmount < 5"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-3 rounded-xl transition-all shadow-md shadow-blue-100 hover:shadow-lg disabled:opacity-50 text-center flex items-center justify-center gap-2">
              <span v-if="isDonating"
                class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>{{ isDonating ? 'Processing payment...' : 'Confirm Donation' }}</span>
            </button>
          </form>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* Extra utility to hide default scrollbars */
.scrollbar-none::-webkit-scrollbar {
  display: none;
}

.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
