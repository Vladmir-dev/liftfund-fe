<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../../stores/auth'
import {
  campaignService,
  type UserDashboardMetrics,
  type DonorDonationRecord,
} from '../../../services/campaign'
import NavHeader from '../../landing/components/NavHeader.vue'
import MainFooter from '../../landing/components/MainFooter.vue'

const router = useRouter()
const authStore = useAuthStore()

const navHeaderRef = ref<any>(null)
const closeDropdowns = () => {
  navHeaderRef.value?.closeDropdowns()
}

const activeActivityTab = ref<'donation' | 'share'>('donation')

// State
const isLoading = ref(true)
const errorMessage = ref('')
const metrics = ref<UserDashboardMetrics>({
  totalCampaigns: 0,
  totalDonations: 0,
  totalDonated: 0,
})
const donations = ref<DonorDonationRecord[]>([])

const loadImpactData = async () => {
  if (!authStore.isLoggedIn) {
    isLoading.value = false
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  try {
    const [dashboardRes, donationsRes] = await Promise.all([
      campaignService.getMyDashboard(),
      campaignService.getMyDonations(1, 50),
    ])
    metrics.value = dashboardRes
    donations.value = donationsRes.content || []
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to load impact details.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadImpactData()
})

const findFundraisers = () => {
  router.push('/')
}

const viewCampaign = (campaignId: string) => {
  if (campaignId) {
    router.push(`/campaign/${campaignId}`)
  }
}

const getCampaignCover = (d: DonorDonationRecord) => {
  if (typeof d.campaignCover === 'string' && d.campaignCover) return d.campaignCover
  if (d.campaignCover && typeof d.campaignCover === 'object' && d.campaignCover.Valid) {
    return d.campaignCover.String
  }
  return 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&q=80&w=300'
}

const getStatusBadge = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'succeeded':
      return { label: 'Completed', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
    case 'pending':
      return { label: 'Processing', class: 'bg-amber-50 text-amber-700 border-amber-200' }
    case 'failed':
      return { label: 'Failed', class: 'bg-red-50 text-red-700 border-red-200' }
    case 'refunded':
      return { label: 'Refunded', class: 'bg-purple-50 text-purple-700 border-purple-200' }
    default:
      return { label: status || 'Pending', class: 'bg-slate-50 text-slate-700 border-slate-200' }
  }
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50/50 text-slate-800 font-sans text-left" @click="closeDropdowns">
    <NavHeader ref="navHeaderRef" />

    <main class="max-w-4xl mx-auto px-4 py-16 flex flex-col items-center">
      <!-- User Portrait Avatar -->
      <div class="w-16 h-16 rounded-full overflow-hidden bg-slate-200 shadow-sm border border-slate-200 mb-4 flex items-center justify-center">
        <img v-if="authStore.user?.avatar" :src="authStore.user.avatar" class="w-full h-full object-cover" alt="User portrait" />
        <iconify-icon v-else icon="ph:user-circle-fill" class="text-5xl text-slate-400"></iconify-icon>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="py-8 flex flex-col items-center">
        <span class="h-8 w-8 border-3 border-[#024731] border-t-transparent rounded-full animate-spin mb-3"></span>
        <span class="text-xs font-semibold text-slate-500">Loading your impact summary...</span>
      </div>

      <template v-else>
        <!-- Impact Score -->
        <span class="text-5xl sm:text-6xl font-black text-slate-900 mb-2 leading-none">
          UGX {{ metrics.totalDonated.toLocaleString() }}
        </span>
        <p class="text-slate-500 text-sm font-semibold mb-10 text-center">
          Your total impact from donating and supporting causes on HelpFund
        </p>

        <!-- Stats Grid Card -->
        <div class="bg-white rounded-3xl border border-slate-100 shadow-sm w-full grid grid-cols-2 divide-x divide-slate-100 p-6 mb-8 text-center sm:text-left">
          <div class="p-4 flex flex-col items-center sm:items-start">
            <div class="flex items-center gap-2 text-slate-700 font-extrabold text-xl mb-1">
              <iconify-icon icon="lucide:heart-handshake" class="text-[#02a95c]"></iconify-icon>
              <span>{{ metrics.totalDonations }}</span>
            </div>
            <span class="text-slate-400 text-xs font-semibold">Donations made</span>
          </div>
          <div class="p-4 flex flex-col items-center sm:items-start pl-8">
            <div class="flex items-center gap-2 text-slate-700 font-extrabold text-xl mb-1">
              <iconify-icon icon="lucide:folder-heart" class="text-emerald-700"></iconify-icon>
              <span>{{ metrics.totalCampaigns }}</span>
            </div>
            <span class="text-slate-400 text-xs font-semibold">Fundraisers organized</span>
          </div>
        </div>

        <!-- Green CTA Callout Banner -->
        <div class="bg-[#0f2e24] text-white rounded-3xl p-8 w-full text-left mb-12 flex flex-col sm:flex-row justify-between sm:items-center gap-6 shadow-sm">
          <div>
            <h3 class="font-extrabold text-lg mb-2">Continue making a difference</h3>
            <p class="text-emerald-100 text-xs sm:text-sm leading-relaxed max-w-md">
              Discover verified fundraisers in Uganda needing urgent support today.
            </p>
          </div>
          <button @click="findFundraisers" class="bg-white hover:bg-emerald-50 text-[#0f2e24] font-bold px-6 py-3 rounded-full text-xs transition-colors shrink-0 cursor-pointer shadow-sm">
            Find a fundraiser &gt;
          </button>
        </div>

        <!-- Fundraisers you support activity list -->
        <div class="w-full text-left bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm">
          <h3 class="font-black text-slate-900 text-lg mb-6">Your Giving Activity</h3>

          <!-- Tab toggles -->
          <div class="flex items-center gap-2 border-b border-slate-100 pb-3 mb-6">
            <button @click="activeActivityTab = 'donation'" class="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer"
              :class="activeActivityTab === 'donation' ? 'bg-[#024731] text-white' : 'text-slate-500 hover:text-slate-800'">
              Donations ({{ donations.length }})
            </button>
            <button @click="activeActivityTab = 'share'" class="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer"
              :class="activeActivityTab === 'share' ? 'bg-[#024731] text-white' : 'text-slate-500 hover:text-slate-800'">
              Share &amp; Advocate
            </button>
          </div>

          <!-- Donations List -->
          <div v-if="activeActivityTab === 'donation'">
            <div v-if="donations.length > 0" class="flex flex-col divide-y divide-slate-100">
              <div
                v-for="d in donations"
                :key="d.id"
                class="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                <div class="flex items-center gap-4 min-w-0">
                  <div
                    @click="viewCampaign(d.campaignId)"
                    class="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 shrink-0 cursor-pointer border border-slate-100">
                    <img :src="getCampaignCover(d)" class="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="Cover" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <h4
                      @click="viewCampaign(d.campaignId)"
                      class="text-sm font-bold text-slate-900 truncate hover:text-[#024731] cursor-pointer">
                      {{ d.campaignTitle || 'HelpFund Fundraiser' }}
                    </h4>
                    <div class="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <span>{{ formatDate(d.createdAt) }}</span>
                      <span v-if="d.txRef" class="truncate max-w-[140px] font-mono text-[11px] text-slate-400">#{{ d.txRef }}</span>
                    </div>
                    <p v-if="d.message" class="text-xs text-slate-600 italic mt-1.5 line-clamp-1">
                      "{{ d.message }}"
                    </p>
                  </div>
                </div>

                <div class="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                  <span class="text-sm font-black text-slate-900">
                    {{ d.currency || 'UGX' }} {{ d.amount.toLocaleString() }}
                  </span>
                  <span
                    :class="getStatusBadge(d.paymentStatus).class"
                    class="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border">
                    {{ getStatusBadge(d.paymentStatus).label }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Empty Donations State -->
            <div v-else class="py-16 text-center flex flex-col items-center">
              <div class="w-14 h-14 rounded-full bg-emerald-50 text-[#024731] flex items-center justify-center text-2xl mb-3">
                <iconify-icon icon="lucide:heart"></iconify-icon>
              </div>
              <h4 class="text-sm font-bold text-slate-800 mb-1">No donations yet</h4>
              <p class="text-xs text-slate-400 max-w-sm mb-5 leading-relaxed">
                When you make a direct donation to any campaign, it will be documented here with its receipt and progress.
              </p>
              <button
                @click="findFundraisers"
                class="bg-[#024731] hover:bg-[#013424] text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-sm transition-all cursor-pointer">
                Explore Fundraisers
              </button>
            </div>
          </div>

          <!-- Share Activity Tab -->
          <div v-else class="py-10 text-center flex flex-col items-center">
            <div class="w-14 h-14 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-2xl mb-3">
              <iconify-icon icon="lucide:share-2"></iconify-icon>
            </div>
            <h4 class="text-sm font-bold text-slate-800 mb-1">Spread the Word</h4>
            <p class="text-xs text-slate-500 max-w-md leading-relaxed mb-6">
              Sharing a fundraiser on WhatsApp, Twitter, or Facebook is one of the most impactful ways to help organizers hit their goal.
            </p>
            <button
              @click="findFundraisers"
              class="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-sm transition-all cursor-pointer">
              Find Fundraisers to Share
            </button>
          </div>
        </div>
      </template>
    </main>

    <MainFooter />
  </div>
</template>
