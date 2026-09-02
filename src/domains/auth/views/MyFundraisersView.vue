<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../../stores/auth'
import { campaignService, type BackendCampaign } from '../../../services/campaign'
import NavHeader from '../../landing/components/NavHeader.vue'
import MainFooter from '../../landing/components/MainFooter.vue'

const router = useRouter()
const authStore = useAuthStore()

const navHeaderRef = ref<any>(null)
const closeDropdowns = () => {
  navHeaderRef.value?.closeDropdowns()
}

const campaigns = ref<BackendCampaign[]>([])
const isLoading = ref(true)
const errorMessage = ref('')

const fetchMyCampaigns = async () => {
  if (!authStore.isLoggedIn) {
    isLoading.value = false
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  try {
    const list = await campaignService.getMyCampaigns()
    campaigns.value = list
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to load your campaigns.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchMyCampaigns()
})

const startFundraiser = () => {
  router.push('/start-fundraiser')
}

const manageCampaign = (id: string) => {
  router.push(`/campaign/${id}/dashboard`)
}

const viewCampaign = (id: string) => {
  router.push(`/campaign/${id}`)
}

const getCoverPhoto = (c: BackendCampaign) => {
  if (typeof c.coverImageUrl === 'string' && c.coverImageUrl) return c.coverImageUrl
  if (c.coverImageUrl && typeof c.coverImageUrl === 'object' && c.coverImageUrl.Valid) {
    return c.coverImageUrl.String
  }
  return 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&q=80&w=300'
}

const getLocation = (c: BackendCampaign) => {
  if (typeof c.location === 'string' && c.location) return c.location
  if (c.location && typeof c.location === 'object' && c.location.Valid) {
    return c.location.String
  }
  return 'Uganda'
}
</script>

<template>
  <div class="min-h-screen bg-slate-50/50 text-slate-800 font-sans text-left flex flex-col" @click="closeDropdowns">
    <NavHeader ref="navHeaderRef" />

    <!-- Main Content -->
    <main class="max-w-4xl mx-auto px-4 py-12 flex-grow w-full">
      <!-- Top Title and Action Row -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-black text-slate-900 tracking-tight">Your Fundraisers</h1>
          <p class="text-xs text-slate-500 mt-1">Manage and track your active and draft fundraising campaigns.</p>
        </div>
        <button 
          @click="startFundraiser" 
          class="bg-[#024731] hover:bg-[#013424] text-white font-extrabold text-xs px-6 py-3 rounded-full transition-all shadow-md cursor-pointer font-sans"
        >
          Start a HelpFund
        </button>
      </div>

      <!-- Auth Required Screen if not logged in -->
      <div v-if="!authStore.isLoggedIn" class="bg-white border border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center shadow-xs">
        <div class="w-16 h-16 rounded-full bg-emerald-50 text-[#024731] flex items-center justify-center text-2xl mb-4">
          <iconify-icon icon="fa6-solid:lock"></iconify-icon>
        </div>
        <h3 class="font-extrabold text-slate-900 text-lg mb-1">Sign in to view your fundraisers</h3>
        <p class="text-slate-400 text-xs font-medium max-w-sm leading-relaxed mb-6">
          You need to be logged into your HelpFund account to see your active campaigns and donations.
        </p>
        <div class="flex gap-3">
          <RouterLink to="/login" class="bg-[#024731] hover:bg-[#013424] text-white font-bold text-xs px-6 py-2.5 rounded-full transition-all shadow-sm">
            Sign In
          </RouterLink>
          <RouterLink to="/signup" class="bg-white border border-slate-200 hover:border-slate-400 text-slate-700 font-bold text-xs px-6 py-2.5 rounded-full transition-all">
            Create Account
          </RouterLink>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else-if="isLoading" class="p-16 text-center">
        <span class="h-8 w-8 border-3 border-[#024731] border-t-transparent rounded-full animate-spin inline-block mb-3"></span>
        <p class="text-sm font-bold text-slate-600">Loading your fundraisers...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="errorMessage" class="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm font-semibold mb-6 flex items-center justify-between">
        <span>{{ errorMessage }}</span>
        <button @click="fetchMyCampaigns" class="underline font-bold hover:text-rose-900">Try Again</button>
      </div>

      <!-- Published Section -->
      <div v-else>
        <!-- Card List -->
        <div v-if="campaigns.length > 0" class="flex flex-col gap-4">
          <div 
            v-for="campaign in campaigns" 
            :key="campaign.id"
            class="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow"
          >
            <!-- Details block -->
            <div class="flex items-center gap-5 w-full md:w-auto">
              <!-- Circular cover frame -->
              <div class="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm shrink-0">
                <img :src="getCoverPhoto(campaign)" class="w-full h-full object-cover" alt="Campaign avatar" />
              </div>
              <div class="text-left">
                <div class="flex items-center gap-2 mb-1">
                  <h4 class="font-extrabold text-slate-900 text-base">{{ campaign.title }}</h4>
                  <span 
                    class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider"
                    :class="campaign.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'"
                  >
                    {{ campaign.status }}
                  </span>
                </div>
                <p class="text-slate-400 text-xs font-semibold">
                  {{ campaign.currency }} {{ Number(campaign.raisedAmount || 0).toLocaleString() }} raised of {{ campaign.currency }} {{ Number(campaign.goalAmount).toLocaleString() }} &bull; {{ getLocation(campaign) }}
                </p>
              </div>
            </div>

            <!-- Action buttons -->
            <div class="flex items-center gap-3 w-full md:w-auto justify-end">
              <button 
                @click="manageCampaign(campaign.id)"
                class="border border-slate-200 text-slate-800 hover:bg-[#edfce0]/50 hover:border-[#024731] font-bold text-xs px-6 py-2.5 rounded-full transition-all shadow-xs cursor-pointer font-sans"
              >
                Manage
              </button>
              <button 
                @click="viewCampaign(campaign.id)"
                class="border border-slate-200 text-slate-800 hover:bg-[#edfce0]/50 hover:border-[#024731] font-bold text-xs px-6 py-2.5 rounded-full transition-all shadow-xs cursor-pointer font-sans"
              >
                View
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="bg-white border border-dashed border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center shadow-xs">
          <iconify-icon icon="ph:heart-handshake-bold" class="text-slate-300 text-5xl mb-3"></iconify-icon>
          <h4 class="font-extrabold text-slate-900 text-sm mb-1">No active fundraisers yet</h4>
          <p class="text-slate-400 text-xs font-medium max-w-xs leading-relaxed mb-6">
            Ready to make a difference? Start your first campaign today and share your story with the world.
          </p>
          <button 
            @click="startFundraiser" 
            class="bg-[#024731] hover:bg-[#013424] text-white font-extrabold text-xs px-6 py-3 rounded-full transition-all shadow-md cursor-pointer font-sans"
          >
            Start a HelpFund
          </button>
        </div>
      </div>
    </main>

    <MainFooter />
  </div>
</template>
