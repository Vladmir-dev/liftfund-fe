<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLandingStore } from '../../landing/stores'
import { useAuthStore } from '../../../stores/auth'
import { storeToRefs } from 'pinia'
import NavHeader from '../../landing/components/NavHeader.vue'
import MainFooter from '../../landing/components/MainFooter.vue'

const router = useRouter()
const landingStore = useLandingStore()
const authStore = useAuthStore()
const { fundraisers } = storeToRefs(landingStore)

const navHeaderRef = ref<any>(null)
const closeDropdowns = () => {
  navHeaderRef.value?.closeDropdowns()
}

// Filter fundraisers managed by the logged-in user
const myFundraisers = computed(() => {
  return fundraisers.value.filter(f => f.organizer === 'John Doe')
})

const startFundraiser = () => {
  router.push('/signup')
}

const manageCampaign = (id: string) => {
  router.push(`/campaign/${id}/dashboard`)
}

const viewCampaign = (id: string) => {
  router.push(`/campaign/${id}`)
}
</script>

<template>
  <div class="min-h-screen bg-slate-50/50 text-slate-800 font-sans text-left flex flex-col" @click="closeDropdowns">
    <NavHeader ref="navHeaderRef" />

    <!-- Main Content -->
    <main class="max-w-4xl mx-auto px-4 py-12 flex-grow w-full">
      
      <!-- Top Title and Action Row -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 class="text-3xl font-black text-slate-900 tracking-tight">Fundraisers</h1>
        <button 
          @click="startFundraiser" 
          class="bg-[#0f2e24] hover:bg-[#153f31] text-white font-extrabold text-xs px-6 py-3 rounded-full transition-all shadow-md cursor-pointer font-sans"
        >
          Start a HelpFund
        </button>
      </div>

      <!-- Published Section -->
      <div>
        <h3 class="text-sm font-black text-slate-900 mb-4 uppercase tracking-wider">Published</h3>

        <!-- Card List -->
        <div v-if="myFundraisers.length > 0" class="flex flex-col gap-4">
          <div 
            v-for="campaign in myFundraisers" 
            :key="campaign.id"
            class="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow"
          >
            <!-- Details block -->
            <div class="flex items-center gap-5 w-full md:w-auto">
              <!-- Circular cover frame -->
              <div class="w-16 h-16 rounded-full overflow-hidden bg-slate-100 border border-slate-150 shadow-sm shrink-0">
                <img :src="campaign.imageUrl" class="w-full h-full object-cover" alt="Campaign avatar" />
              </div>
              <div class="text-left">
                <h4 class="font-extrabold text-slate-900 text-base mb-1">{{ campaign.title }}</h4>
                <p class="text-slate-400 text-xs font-semibold">Fundraiser created &bull; Active in {{ campaign.city }}</p>
              </div>
            </div>

            <!-- Action buttons -->
            <div class="flex items-center gap-3 w-full md:w-auto justify-end">
              <button 
                @click="manageCampaign(campaign.id)"
                class="border border-slate-200 text-slate-800 hover:bg-slate-50 font-bold text-xs px-6 py-2.5 rounded-full transition-all shadow-xs cursor-pointer font-sans"
              >
                Manage
              </button>
              <button 
                @click="viewCampaign(campaign.id)"
                class="border border-slate-200 text-slate-800 hover:bg-slate-50 font-bold text-xs px-6 py-2.5 rounded-full transition-all shadow-xs cursor-pointer font-sans"
              >
                View
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="bg-white border border-dashed border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center shadow-xs">
          <iconify-icon icon="ph:heart-handshake-bold" class="text-slate-300 text-5xl mb-3"></iconify-icon>
          <h4 class="font-extrabold text-slate-900 text-sm mb-1">No active fundraisers</h4>
          <p class="text-slate-400 text-xs font-medium max-w-xs leading-relaxed mb-6">
            You haven't created any fundraisers yet. Start one today to support your favorite causes!
          </p>
          <button 
            @click="startFundraiser" 
            class="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-md shadow-blue-100 transition-all cursor-pointer"
          >
            Start first fundraiser
          </button>
        </div>
      </div>

    </main>

    <MainFooter />
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
main {
  animation: fadeIn 0.3s ease-out forwards;
}
</style>
