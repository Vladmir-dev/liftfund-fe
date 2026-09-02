<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { campaignService, type CampaignDonation } from '../../../services/campaign'

const props = withDefaults(
  defineProps<{
    campaignId: string
    currency?: string
  }>(),
  {
    currency: 'UGX',
  }
)

const emit = defineEmits<{
  (e: 'copy-link'): void
}>()

const activeSubTab = ref<'opportunities' | 'donated' | 'shared'>('opportunities')
const searchQuery = ref('')
const donations = ref<CampaignDonation[]>([])
const isLoadingDonations = ref(false)

const fetchDonations = async () => {
  isLoadingDonations.value = true
  try {
    const list = await campaignService.listCampaignDonations(props.campaignId)
    donations.value = list
  } catch (err) {
    console.warn('Could not load campaign donations:', err)
  } finally {
    isLoadingDonations.value = false
  }
}

onMounted(() => {
  fetchDonations()
})

const getDonationMessage = (donation: any): string => {
  if (!donation) return ''
  let val = donation.message
  if (!val) return ''

  // If val is a JSON-encoded string like '{"String":"...","Valid":true}'
  if (typeof val === 'string' && val.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(val)
      if (parsed && typeof parsed === 'object' && 'String' in parsed) {
        return parsed.Valid !== false ? (parsed.String || '') : ''
      }
    } catch {
      // Fall through if not JSON
    }
  }

  // If val is an object like { String: "...", Valid: true }
  if (typeof val === 'object' && 'String' in val) {
    return val.Valid !== false ? (val.String || '') : ''
  }

  // Plain string
  if (typeof val === 'string') {
    return val.trim()
  }

  return ''
}

const getDonorName = (donation: any): string => {
  if (!donation) return 'Generous Donor'
  if (donation.isAnonymous) return 'Anonymous Supporter'
  let val = donation.donorName
  if (!val) return 'Generous Donor'

  if (typeof val === 'string' && val.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(val)
      if (parsed && typeof parsed === 'object' && 'String' in parsed) {
        return parsed.Valid !== false ? (parsed.String || 'Generous Donor') : 'Generous Donor'
      }
    } catch {
      // Fall through
    }
  }

  if (typeof val === 'object' && 'String' in val) {
    return val.Valid !== false ? (val.String || 'Generous Donor') : 'Generous Donor'
  }

  return typeof val === 'string' && val.trim() ? val : 'Generous Donor'
}

const filteredDonations = computed(() => {
  if (!searchQuery.value.trim()) return donations.value
  const q = searchQuery.value.toLowerCase()
  return donations.value.filter((d) => {
    const name = getDonorName(d).toLowerCase()
    const msg = getDonationMessage(d).toLowerCase()
    return name.includes(q) || msg.includes(q)
  })
})

const handleCopyLink = () => {
  emit('copy-link')
}
</script>

<template>
  <div class="flex flex-col gap-6 text-slate-800 animate-fade-in text-left">
    
    <!-- Header Row -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-black text-slate-900">Supporters</h2>
        <p class="text-xs text-slate-500 font-semibold mt-0.5">Manage and engage with people backing your cause.</p>
      </div>
      <button
        @click="handleCopyLink"
        class="bg-[#024731] hover:bg-[#013424] text-white font-bold text-xs px-4 py-2 rounded-full shadow-xs flex items-center gap-1.5 cursor-pointer"
      >
        <iconify-icon icon="ph:link-bold" class="text-sm"></iconify-icon>
        <span>Share Link</span>
      </button>
    </div>

    <!-- Search input -->
    <div class="relative w-full">
      <iconify-icon icon="ph:magnifying-glass-bold" class="absolute left-4 top-3.5 text-slate-400 text-base"></iconify-icon>
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Search supporters by name or message..." 
        class="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#024731] focus:bg-white transition-all"
      />
    </div>

    <!-- Tabs header -->
    <div class="flex items-center gap-6 border-b border-slate-100 pb-0.5">
      <button 
        @click="activeSubTab = 'opportunities'" 
        class="text-xs font-black pb-3 relative tracking-wide cursor-pointer"
        :class="activeSubTab === 'opportunities' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 hover:text-slate-600'"
      >
        Opportunities
      </button>
      <button 
        @click="activeSubTab = 'donated'" 
        class="text-xs font-black pb-3 relative tracking-wide cursor-pointer"
        :class="activeSubTab === 'donated' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 hover:text-slate-600'"
      >
        Donated ({{ donations.length }})
      </button>
      <button 
        @click="activeSubTab = 'shared'" 
        class="text-xs font-black pb-3 relative tracking-wide cursor-pointer"
        :class="activeSubTab === 'shared' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 hover:text-slate-600'"
      >
        Shared
      </button>
    </div>

    <!-- Opportunities Tab content -->
    <div v-if="activeSubTab === 'opportunities'" class="flex flex-col gap-6">
      
      <!-- Connect Contacts Card -->
      <div class="bg-[#edfce0] border border-[#bbf770] rounded-3xl p-6 text-center flex flex-col items-center shadow-xs">
        <div class="flex items-center gap-1.5 mb-3">
          <div class="w-8 h-8 rounded-full bg-emerald-200/50 flex items-center justify-center text-[#024731]">
            <iconify-icon icon="ph:heart-bold" class="text-sm"></iconify-icon>
          </div>
          <div class="w-10 h-10 rounded-full bg-[#024731] flex items-center justify-center text-white font-bold border-2 border-white -ml-2.5">
            <iconify-icon icon="ph:users-bold" class="text-base"></iconify-icon>
          </div>
        </div>
        <h3 class="text-lg font-black text-slate-900 mb-1 leading-snug">Fundraising takes a community.<br/>Let's find yours.</h3>
        <p class="text-[11px] text-slate-600 max-w-sm leading-relaxed mb-4 font-semibold">
          Share your campaign with family, colleagues, and social networks to kickstart donations.
        </p>
        <button @click="handleCopyLink" class="bg-[#024731] hover:bg-[#013424] text-white font-bold text-xs px-6 py-2.5 rounded-full transition-all shadow-md cursor-pointer">
          Copy Campaign Link
        </button>
      </div>

      <!-- Share your fundraiser options -->
      <div>
        <h3 class="text-sm font-black text-slate-900 mb-3 uppercase tracking-wider">Direct outreach channels</h3>
        
        <button 
          @click="handleCopyLink" 
          class="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs py-3.5 rounded-2xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mb-4"
        >
          <iconify-icon icon="ph:link-bold" class="text-sm"></iconify-icon>
          <span>Copy fundraiser link</span>
        </button>

        <div class="flex flex-col gap-2.5">
          <div @click="handleCopyLink" class="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group">
            <div class="flex items-center gap-3">
              <iconify-icon icon="ph:chat-text-bold" class="text-emerald-700 text-base"></iconify-icon>
              <span class="text-xs font-bold text-slate-700">Send in WhatsApp or SMS</span>
            </div>
            <iconify-icon icon="ph:caret-right-bold" class="text-slate-400 text-sm group-hover:translate-x-0.5 transition-transform"></iconify-icon>
          </div>

          <div @click="handleCopyLink" class="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group">
            <div class="flex items-center gap-3">
              <iconify-icon icon="ph:envelope-bold" class="text-emerald-700 text-base"></iconify-icon>
              <span class="text-xs font-bold text-slate-700">Send via Email</span>
            </div>
            <iconify-icon icon="ph:caret-right-bold" class="text-slate-400 text-sm group-hover:translate-x-0.5 transition-transform"></iconify-icon>
          </div>
        </div>
      </div>

    </div>

    <!-- Donated Tab content -->
    <div v-else-if="activeSubTab === 'donated'" class="flex flex-col gap-4">
      <div v-if="isLoadingDonations" class="p-8 text-center bg-white rounded-3xl border border-slate-100">
        <span class="h-6 w-6 border-2 border-[#024731] border-t-transparent rounded-full animate-spin inline-block mb-2"></span>
        <p class="text-xs font-bold text-slate-500">Loading supporters...</p>
      </div>

      <div v-else-if="filteredDonations.length > 0" class="flex flex-col gap-3">
        <div
          v-for="donation in filteredDonations"
          :key="donation.id"
          class="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs flex items-start justify-between gap-3"
        >
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-full bg-emerald-50 text-[#024731] flex items-center justify-center font-bold text-sm shrink-0">
              {{ donation.isAnonymous ? 'A' : getDonorName(donation).charAt(0).toUpperCase() }}
            </div>
            <div>
              <h4 class="font-extrabold text-slate-900 text-xs">
                {{ getDonorName(donation) }}
              </h4>
              <p v-if="getDonationMessage(donation)" class="text-xs text-slate-600 font-medium italic mt-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100/80">
                "{{ getDonationMessage(donation) }}"
              </p>
              <span class="text-[10px] text-slate-400 font-semibold block mt-1">
                {{ new Date(donation.createdAt).toLocaleDateString() }}
              </span>
            </div>
          </div>

          <div class="text-right shrink-0">
            <span class="font-black text-sm text-[#024731]">
              {{ donation.currency || currency }} {{ Number(donation.amount).toLocaleString() }}
            </span>
          </div>
        </div>
      </div>

      <div v-else class="py-16 text-center bg-white border border-slate-100 rounded-3xl p-8 shadow-xs">
        <iconify-icon icon="ph:heart-bold" class="text-slate-300 text-4xl mb-3"></iconify-icon>
        <p class="text-slate-800 text-sm font-bold mb-1">No donations received yet</p>
        <p class="text-slate-400 text-xs font-medium max-w-xs mx-auto mb-4">
          Once supporters start donating, their contributions and messages will appear here.
        </p>
        <button
          @click="handleCopyLink"
          class="bg-[#024731] hover:bg-[#013424] text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-xs cursor-pointer"
        >
          Share Fundraiser
        </button>
      </div>
    </div>

    <!-- Shared Tab content -->
    <div v-else class="py-16 text-center bg-white border border-slate-100 rounded-3xl p-8 shadow-xs">
      <iconify-icon icon="ph:share-network-bold" class="text-slate-300 text-4xl mb-3"></iconify-icon>
      <p class="text-slate-800 text-sm font-bold mb-1">Share tracking</p>
      <p class="text-slate-400 text-xs font-medium max-w-xs mx-auto">
        Share activities across WhatsApp, Facebook, and Twitter will be reflected here.
      </p>
    </div>

  </div>
</template>
