<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLandingStore } from '../../landing/stores'
import { storeToRefs } from 'pinia'
import NavHeader from '../../landing/components/NavHeader.vue'
import MainFooter from '../../landing/components/MainFooter.vue'

// Import subcomponents
import TodayTab from '../components/TodayTab.vue'
import SupportersTab from '../components/SupportersTab.vue'
import SharehubTab from '../components/SharehubTab.vue'
import FundraiserTab from '../components/FundraiserTab.vue'
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

// Left sidebar options: 'today' | 'supporters' | 'sharehub' | 'fundraiser'
const activeTab = ref<'today' | 'supporters' | 'sharehub' | 'fundraiser'>('today')

// Modal states
const showUpdateModal = ref(false)
const showTransfersModal = ref(false)

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

// Circular progress calculations (for Today tab preview)
const progressPercent = computed(() => {
  if (!fundraiser.value) return 0
  const pct = (fundraiser.value.raisedAmount / fundraiser.value.targetAmount) * 100
  return Math.min(100, Math.round(pct))
})

const handlePostUpdate = (text: string) => {
  toastMessage.value = 'Update sent to donors!'
  showToast.value = true
  showUpdateModal.value = false
  setTimeout(() => {
    showToast.value = false
  }, 2500)
}
</script>

<template>
  <div v-if="fundraiser" class="min-h-screen bg-slate-50 text-slate-800 font-sans text-left flex flex-col"
    @click="closeDropdowns">
    <NavHeader ref="navHeaderRef" />

    <!-- Core Content Container: Sidebar + Dashboard body -->
    <div class="max-w-7xl w-full mx-auto px-4 py-8 lg:py-12 flex-grow flex flex-col md:flex-row gap-8 items-start">

      <!-- Left Sidebar Navigation -->
      <aside class="w-full md:w-60 shrink-0 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
        <ul class="flex flex-col gap-1.5 text-xs font-bold text-slate-500">
          <li>
            <button @click="activeTab = 'today'"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer text-left"
              :class="activeTab === 'today' ? 'bg-[#edfce0] text-[#024731] border-l-4 border-[#024731] font-extrabold' : 'hover:bg-slate-50 hover:text-slate-800'">
              <iconify-icon icon="ph:check-circle-bold" class="text-base" :class="activeTab === 'today' ? 'text-[#024731]' : 'text-slate-400'"></iconify-icon>
              <span>Today</span>
            </button>
          </li>
          <li>
            <button @click="activeTab = 'supporters'"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer text-left"
              :class="activeTab === 'supporters' ? 'bg-[#edfce0] text-[#024731] border-l-4 border-[#024731] font-extrabold' : 'hover:bg-slate-50 hover:text-slate-800'">
              <iconify-icon icon="ph:users-bold" class="text-base" :class="activeTab === 'supporters' ? 'text-[#024731]' : 'text-slate-400'"></iconify-icon>
              <span>Supporters</span>
            </button>
          </li>
          <li>
            <button @click="activeTab = 'sharehub'"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer text-left"
              :class="activeTab === 'sharehub' ? 'bg-[#edfce0] text-[#024731] border-l-4 border-[#024731] font-extrabold' : 'hover:bg-slate-50 hover:text-slate-800'">
              <iconify-icon icon="ph:megaphone-bold" class="text-base" :class="activeTab === 'sharehub' ? 'text-[#024731]' : 'text-slate-400'"></iconify-icon>
              <span>Sharehub</span>
            </button>
          </li>
          <li>
            <button @click="activeTab = 'fundraiser'"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer text-left"
              :class="activeTab === 'fundraiser' ? 'bg-[#edfce0] text-[#024731] border-l-4 border-[#024731] font-extrabold' : 'hover:bg-slate-50 hover:text-slate-800'">
              <iconify-icon icon="ph:heart-bold" class="text-base" :class="activeTab === 'fundraiser' ? 'text-[#024731]' : 'text-slate-400'"></iconify-icon>
              <span>Fundraiser</span>
            </button>
          </li>
        </ul>
      </aside>

      <!-- Right Dashboard Panel -->
      <div class="flex-grow flex flex-col gap-6 w-full">

        <!-- Welcome banner (Always shown) -->
        <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center justify-between gap-4">
          <div class="text-xs text-slate-500 font-bold text-left">
            HI, {{ fundraiser.organizer.split(' ')[0] }} &bull; <span class="text-slate-400">We're in this together</span>
          </div>
          <RouterLink :to="`/campaign/${fundraiser.id}`"
            class="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs px-5 py-2 rounded-full transition-all shadow-sm">
            View page
          </RouterLink>
        </div>

        <!-- Render subcomponent corresponding to active tab -->
        <TodayTab 
          v-if="activeTab === 'today'" 
          :title="fundraiser.title" 
          :targetAmount="fundraiser.targetAmount"
          :raisedAmount="fundraiser.raisedAmount" 
          :imageUrl="fundraiser.imageUrl"
          :organizer="fundraiser.organizer"
          @share="activeTab = 'sharehub'"
        />

        <SupportersTab 
          v-else-if="activeTab === 'supporters'" 
          :campaignId="fundraiser.id"
          @copy-link="copyLink"
        />

        <SharehubTab 
          v-else-if="activeTab === 'sharehub'" 
          :campaignId="fundraiser.id"
          :title="fundraiser.title"
          :organizer="fundraiser.organizer"
          :imageUrl="fundraiser.imageUrl"
          @copy-link="copyLink"
        />

        <FundraiserTab 
          v-else-if="activeTab === 'fundraiser'" 
          :campaignId="fundraiser.id"
          :title="fundraiser.title"
          :imageUrl="fundraiser.imageUrl"
          @post-update="showUpdateModal = true"
          @transfers="showTransfersModal = true"
          @edit="editCampaign"
        />

      </div>

    </div>

    <!-- Modals Overlay -->
    <!-- Post Update Modal -->
    <div v-if="showUpdateModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4" @click.self="showUpdateModal = false">
      <div class="bg-white rounded-3xl w-full max-w-xl p-8 border border-slate-100 shadow-2xl relative overflow-y-auto max-h-[85vh] text-left animate-scale">
        <button @click="showUpdateModal = false" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xl focus:outline-none cursor-pointer">
          <iconify-icon icon="ph:x-bold"></iconify-icon>
        </button>
        <UpdatesTab @postUpdate="handlePostUpdate" />
      </div>
    </div>

    <!-- Transfers Modal -->
    <div v-if="showTransfersModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4" @click.self="showTransfersModal = false">
      <div class="bg-white rounded-3xl w-full max-w-2xl p-8 border border-slate-100 shadow-2xl relative overflow-y-auto max-h-[85vh] text-left animate-scale">
        <button @click="showTransfersModal = false" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xl focus:outline-none cursor-pointer">
          <iconify-icon icon="ph:x-bold"></iconify-icon>
        </button>
        <TransfersTab />
      </div>
    </div>

    <!-- Copy/Success Toast Notification -->
    <div v-if="showToast"
      class="fixed bottom-6 right-6 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50 animate-bounce">
      <iconify-icon icon="ph:check-circle-bold" class="text-[#02a95c] text-base"></iconify-icon>
      <span>{{ toastMessage }}</span>
    </div>

    <MainFooter />
  </div>

  <div v-else class="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
    <iconify-icon icon="ph:warning-bold" class="text-red-500 text-5xl mb-4"></iconify-icon>
    <h3 class="text-xl font-bold text-slate-900 mb-2">Fundraiser Not Found</h3>
    <RouterLink to="/"
      class="px-5 py-2.5 bg-[#024731] text-white font-bold text-xs rounded-full shadow hover:bg-[#013424] transition-all">
      Return Home
    </RouterLink>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fadeIn 0.25s ease-out forwards;
}
@keyframes scale {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-scale {
  animation: scale 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
