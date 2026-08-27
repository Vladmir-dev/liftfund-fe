<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLandingStore } from '../../landing/stores'
import { storeToRefs } from 'pinia'
import NavHeader from '../../landing/components/NavHeader.vue'
import MainFooter from '../../landing/components/MainFooter.vue'

// Import subcomponents
import DashboardTab from '../components/DashboardTab.vue'
import DonationsTab from '../components/DonationsTab.vue'
import TransfersTab from '../components/TransfersTab.vue'
import UpdatesTab from '../components/UpdatesTab.vue'

const route = useRoute()
const router = useRouter()
const landingStore = useLandingStore()
const { fundraisers } = storeToRefs(landingStore)

const campaignId = ref(route.params.id as string)
const fundraiser = computed(() => {
  return fundraisers.value.find((f) => f.id === campaignId.value)
})

// Left sidebar options: 'dashboard' | 'donations' | 'transfers' | 'update'
const activeTab = ref<'dashboard' | 'donations' | 'transfers' | 'update'>('dashboard')

// Header view dropdowns
const navHeaderRef = ref<any>(null)
const closeDropdowns = () => {
  navHeaderRef.value?.closeDropdowns()
}

// Copy link action Toast
const showToast = ref(false)
const toastMessage = ref('')
const copyLink = () => {
  const link = `${window.location.origin}/campaign/${campaignId.value}`
  navigator.clipboard.writeText(link)
  toastMessage.value = 'Campaign link copied to clipboard!'
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2500)
}

// Navigate to edit in wizard
const editCampaign = () => {
  router.push('/signup')
}

// Circular progress calculations
const progressPercent = computed(() => {
  if (!fundraiser.value) return 0
  const pct = (fundraiser.value.raisedAmount / fundraiser.value.targetAmount) * 100
  return Math.min(100, Math.round(pct))
})

const strokeCircumference = 2 * Math.PI * 18 // radius is 18
const strokeDashoffset = computed(() => {
  const percent = progressPercent.value
  return strokeCircumference - (percent / 100) * strokeCircumference
})

// Event handlers from subcomponents
const handleAddOffline = (payload: { amount: number; firstName: string; lastName: string; anonymous: boolean }) => {
  if (!fundraiser.value) return
  
  // Update campaign in store
  fundraiser.value.raisedAmount += payload.amount
  fundraiser.value.donorCount += 1

  // Update in localStorage
  const savedCampaigns = JSON.parse(localStorage.getItem('helpfund_campaigns') || '[]')
  const index = savedCampaigns.findIndex((c: any) => c.id === fundraiser.value?.id)
  if (index !== -1) {
    savedCampaigns[index].raisedAmount = fundraiser.value.raisedAmount
    savedCampaigns[index].donorCount = fundraiser.value.donorCount
    localStorage.setItem('helpfund_campaigns', JSON.stringify(savedCampaigns))
  }

  toastMessage.value = `Offline donation of $${payload.amount} added!`
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2500)
}

const handlePostUpdate = (text: string) => {
  toastMessage.value = 'Update sent to donors!'
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2500)
}

const openTransfersTab = () => {
  activeTab.value = 'transfers'
}
</script>

<template>
  <div v-if="fundraiser" class="min-h-screen bg-slate-50 text-slate-800 font-sans text-left flex flex-col" @click="closeDropdowns">
    <NavHeader ref="navHeaderRef" />

    <!-- Core Content Container: Sidebar + Dashboard body -->
    <div class="max-w-7xl w-full mx-auto px-4 py-8 lg:py-12 flex-grow flex flex-col md:flex-row gap-8 items-start">
      
      <!-- Left Sidebar Navigation -->
      <aside class="w-full md:w-60 shrink-0 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
        <ul class="flex flex-col gap-1.5 text-xs font-bold text-slate-500">
          <li>
            <button @click="activeTab = 'dashboard'" class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer text-left" :class="activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-extrabold' : 'hover:bg-slate-50 hover:text-slate-800'">
              <iconify-icon icon="ph:squares-four-bold" class="text-base"></iconify-icon>
              <span>Dashboard</span>
            </button>
          </li>
          <li>
            <button @click="activeTab = 'donations'" class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer text-left" :class="activeTab === 'donations' ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-extrabold' : 'hover:bg-slate-50 hover:text-slate-800'">
              <iconify-icon icon="ph:heart-bold" class="text-base"></iconify-icon>
              <span>Donations</span>
            </button>
          </li>
          <li>
            <button @click="activeTab = 'transfers'" class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer text-left" :class="activeTab === 'transfers' ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-extrabold' : 'hover:bg-slate-50 hover:text-slate-800'">
              <iconify-icon icon="ph:bank-bold" class="text-base"></iconify-icon>
              <span>Transfers</span>
            </button>
          </li>
          <li>
            <button @click="activeTab = 'update'" class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer text-left" :class="activeTab === 'update' ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-extrabold' : 'hover:bg-slate-50 hover:text-slate-800'">
              <iconify-icon icon="ph:note-pencil-bold" class="text-base"></iconify-icon>
              <span>Update</span>
            </button>
          </li>
        </ul>
      </aside>

      <!-- Right Dashboard Panel -->
      <div class="flex-grow flex flex-col gap-6 w-full">
        
        <!-- Welcome banner (Always shown) -->
        <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center justify-between gap-4">
          <div class="text-xs text-slate-500 font-bold text-left">
            HI, RAYMOND &bull; <span class="text-slate-400">We're in this together</span>
          </div>
          <RouterLink :to="`/campaign/${fundraiser.id}`" class="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs px-5 py-2 rounded-full transition-all shadow-sm">
            View page
          </RouterLink>
        </div>

        <!-- Render subcomponent corresponding to active tab -->
        <DashboardTab
          v-if="activeTab === 'dashboard'"
          :title="fundraiser.title"
          :targetAmount="fundraiser.targetAmount"
          :raisedAmount="fundraiser.raisedAmount"
          :progressPercent="progressPercent"
          :strokeDashoffset="strokeDashoffset"
          :strokeCircumference="strokeCircumference"
          @edit="editCampaign"
          @share="copyLink"
          @transfers="openTransfersTab"
        />

        <DonationsTab
          v-else-if="activeTab === 'donations'"
          :donorCount="fundraiser.donorCount"
          @share="copyLink"
          @addOffline="handleAddOffline"
        />

        <TransfersTab
          v-else-if="activeTab === 'transfers'"
        />

        <UpdatesTab
          v-else-if="activeTab === 'update'"
          @postUpdate="handlePostUpdate"
        />

      </div>

    </div>

    <!-- Copy/Success Toast Notification -->
    <div v-if="showToast" class="fixed bottom-6 right-6 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50 animate-bounce">
      <iconify-icon icon="ph:check-circle-bold" class="text-blue-400 text-base"></iconify-icon>
      <span>{{ toastMessage }}</span>
    </div>

    <MainFooter />
  </div>

  <div v-else class="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
    <iconify-icon icon="ph:warning-bold" class="text-red-500 text-5xl mb-4"></iconify-icon>
    <h3 class="text-xl font-bold text-slate-900 mb-2">Fundraiser Not Found</h3>
    <RouterLink to="/" class="px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-full shadow hover:bg-blue-700 transition-all">
      Return Home
    </RouterLink>
  </div>
</template>

<style scoped>
/* Scoped styles kept minimal for transitions */
</style>
