<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { campaignService, type CampaignStatsResponse } from '../../../services/campaign'

const props = withDefaults(
  defineProps<{
    campaignId?: string
    title: string
    targetAmount: number
    raisedAmount: number
    imageUrl: string
    organizer: string
    currency?: string
    donorCount?: number
    shareCount?: number
    likeCount?: number
  }>(),
  {
    currency: 'UGX',
    donorCount: 0,
    shareCount: 0,
    likeCount: 0,
  }
)

const emit = defineEmits<{
  (e: 'share'): void
  (e: 'post-update'): void
}>()

const stats = ref<CampaignStatsResponse | null>(null)
const isLoadingStats = ref(false)

const fetchStats = async () => {
  if (!props.campaignId) return
  isLoadingStats.value = true
  try {
    const res = await campaignService.getCampaignStats(props.campaignId)
    stats.value = res
  } catch (err) {
    console.warn('Failed to load campaign detailed stats:', err)
  } finally {
    isLoadingStats.value = false
  }
}

onMounted(() => {
  fetchStats()
})

const liveLikeCount = computed(() => {
  return stats.value?.likeCount ?? props.likeCount
})

const liveShareCount = computed(() => {
  return stats.value?.shareCount ?? props.shareCount
})

const commentCount = computed(() => {
  return stats.value?.commentCount || 0
})

const averageDonation = computed(() => {
  if (!props.donorCount || props.donorCount <= 0) return 0
  return Math.round(props.raisedAmount / props.donorCount)
})

const progressPercent = computed(() => {
  if (props.targetAmount <= 0) return 0
  const pct = (props.raisedAmount / props.targetAmount) * 100
  return Math.min(100, Math.round(pct))
})

const strokeCircumference = 2 * Math.PI * 18
const strokeDashoffset = computed(() => {
  return strokeCircumference - (progressPercent.value / 100) * strokeCircumference
})

const platformIcons: Record<string, string> = {
  whatsapp: 'logos:whatsapp-icon',
  facebook: 'logos:facebook',
  twitter: 'logos:twitter',
  x: 'ri:twitter-x-fill',
  copy: 'ph:link-bold',
}

const getPlatformLabel = (p: string) => {
  const norm = p.toLowerCase()
  if (norm === 'whatsapp') return 'WhatsApp'
  if (norm === 'facebook') return 'Facebook'
  if (norm === 'twitter' || norm === 'x') return 'X / Twitter'
  if (norm === 'copy') return 'Direct Link'
  return p.charAt(0).toUpperCase() + p.slice(1)
}
</script>

<template>
  <div class="flex flex-col gap-6 text-slate-800 animate-fade-in text-left">
    
    <!-- Today Top Goal Container -->
    <div class="bg-gradient-to-br from-emerald-500/20 via-emerald-400/10 to-transparent border border-emerald-100 rounded-3xl p-6 relative text-center shadow-sm overflow-hidden flex flex-col items-center">
      
      <!-- Circle Progress Container -->
      <div class="relative w-24 h-24 flex items-center justify-center shrink-0 mb-3">
        <svg class="w-full h-full transform -rotate-90" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="18" fill="transparent" stroke="#e2e8f0" stroke-width="2.5" />
          <circle cx="20" cy="20" r="18" fill="transparent" stroke="#02a95c" stroke-width="2.5" 
                  :stroke-dasharray="strokeCircumference" 
                  :stroke-dashoffset="strokeDashoffset" 
                  stroke-linecap="round" />
        </svg>
        <div class="absolute w-16 h-16 rounded-full overflow-hidden bg-white shadow-inner">
          <img :src="imageUrl" class="w-full h-full object-cover" alt="Campaign Thumbnail" />
        </div>
      </div>

      <div class="mb-4">
        <h2 class="text-2xl font-black text-slate-900 flex items-center justify-center gap-1.5">
          <span>{{ currency }} {{ Number(raisedAmount).toLocaleString() }} raised</span>
        </h2>
        <p class="text-xs font-semibold text-slate-500 mt-0.5">
          of {{ currency }} {{ Number(targetAmount).toLocaleString() }} goal &bull; {{ progressPercent }}% completed
        </p>
      </div>

      <!-- Stats Pill Row -->
      <div class="bg-white/90 backdrop-blur-xs border border-slate-100 rounded-full px-5 sm:px-6 py-2.5 flex flex-wrap items-center justify-center gap-4 sm:gap-6 shadow-xs text-xs font-bold text-slate-700">
        <div><span class="text-slate-900 font-black mr-1">{{ donorCount }}</span> Donors</div>
        <div class="w-px h-3.5 bg-slate-200 hidden sm:block"></div>
        <div><span class="text-slate-900 font-black mr-1">{{ liveShareCount }}</span> Shares</div>
        <div class="w-px h-3.5 bg-slate-200 hidden sm:block"></div>
        <div><span class="text-slate-900 font-black mr-1">{{ liveLikeCount }}</span> Likes</div>
        <div class="w-px h-3.5 bg-slate-200 hidden sm:block"></div>
        <div><span class="text-slate-900 font-black mr-1">{{ commentCount }}</span> Words of Support</div>
      </div>
    </div>

    <!-- Advanced Campaign Performance & Channel Engagement -->
    <div class="bg-white border border-slate-150 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col gap-5">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3.5">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-full bg-emerald-50 text-[#024731] flex items-center justify-center text-base">
            <iconify-icon icon="ph:chart-line-up-bold"></iconify-icon>
          </div>
          <div>
            <h3 class="font-extrabold text-slate-900 text-sm leading-snug">Campaign Analytics & Channel Reach</h3>
            <p class="text-[11px] text-slate-400 font-medium">Real-time breakdown of social shares and audience interest</p>
          </div>
        </div>
        <span class="text-[10px] font-black uppercase px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-100">
          Live Insights
        </span>
      </div>

      <!-- KPI Summary Tiles -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div class="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-150 flex flex-col gap-0.5">
          <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Average Donation</span>
          <span class="text-base font-black text-slate-900">
            {{ currency }} {{ Number(averageDonation).toLocaleString() }}
          </span>
          <span class="text-[10px] text-slate-500 font-medium">per supporter</span>
        </div>

        <div class="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-150 flex flex-col gap-0.5">
          <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Supporter Encouragement</span>
          <span class="text-base font-black text-slate-900">
            {{ commentCount }} message{{ commentCount === 1 ? '' : 's' }}
          </span>
          <span class="text-[10px] text-slate-500 font-medium">words of support posted</span>
        </div>

        <div class="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-150 flex flex-col gap-0.5 col-span-2 sm:col-span-1">
          <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Viral Distribution</span>
          <span class="text-base font-black text-slate-900">
            {{ liveShareCount }} total share{{ liveShareCount === 1 ? '' : 's' }}
          </span>
          <span class="text-[10px] text-slate-500 font-medium">across all networks</span>
        </div>
      </div>

      <!-- Social Shares Breakdown by Channel -->
      <div v-if="stats && stats.shares && stats.shares.length > 0" class="flex flex-col gap-3 pt-1">
        <h4 class="text-xs font-black text-slate-900 uppercase tracking-wider">Shares by Platform</h4>
        <div class="flex flex-col gap-2.5">
          <div
            v-for="s in stats.shares"
            :key="s.platform"
            class="flex items-center justify-between gap-3 text-xs font-semibold text-slate-700">
            <div class="flex items-center gap-2 min-w-[120px]">
              <iconify-icon
                :icon="platformIcons[s.platform.toLowerCase()] || 'ph:share-bold'"
                class="text-base shrink-0 text-slate-600"
              ></iconify-icon>
              <span>{{ getPlatformLabel(s.platform) }}</span>
            </div>
            
            <!-- Channel Progress bar -->
            <div class="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden mx-2">
              <div
                class="bg-[#02a95c] h-full rounded-full transition-all duration-500"
                :style="{ width: `${Math.min(100, Math.round((s.shareCount / (liveShareCount || 1)) * 100))}%` }">
              </div>
            </div>

            <div class="text-right min-w-[60px] text-[11px] font-bold text-slate-900">
              <span>{{ s.shareCount }}</span>
              <span class="text-slate-400 font-normal ml-1">
                ({{ Math.round((s.shareCount / (liveShareCount || 1)) * 100) }}%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Daily Plan Checklist Section -->
    <div>
      <div class="flex items-center gap-2 mb-4">
        <h3 class="text-lg font-black text-slate-900 tracking-tight">{{ organizer.split(' ')[0] }}'s action plan</h3>
        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100 uppercase tracking-wider">
          <iconify-icon icon="ph:check-bold"></iconify-icon>
          Active
        </span>
      </div>

      <div class="flex flex-col gap-3">
        <!-- Checklist Item 1: Share -->
        <div @click="emit('share')" class="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group">
          <div class="flex items-center gap-4">
            <div class="w-7 h-7 rounded-full bg-emerald-50 text-[#024731] flex items-center justify-center shrink-0 text-xs font-bold">
              <iconify-icon icon="ph:share-network-bold"></iconify-icon>
            </div>
            <div>
              <span class="text-xs font-bold text-slate-800 leading-snug block">Share campaign link with your network</span>
              <span class="text-[10px] text-slate-400 font-semibold">Each share brings an average of 5 new supporters</span>
            </div>
          </div>
          <iconify-icon icon="ph:caret-right-bold" class="text-slate-400 text-sm group-hover:translate-x-0.5 transition-transform"></iconify-icon>
        </div>

        <!-- Checklist Item 2: Post Update -->
        <div @click="emit('post-update')" class="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group">
          <div class="flex items-center gap-4">
            <div class="w-7 h-7 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 text-xs font-bold">
              <iconify-icon icon="ph:pencil-simple-line-bold"></iconify-icon>
            </div>
            <div>
              <span class="text-xs font-bold text-slate-800 leading-snug block">Keep donors updated on your progress</span>
              <span class="inline-flex items-center px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-wider border border-emerald-100/50 mt-1">
                ⚡ Boosts recurring donations
              </span>
            </div>
          </div>
          <iconify-icon icon="ph:caret-right-bold" class="text-slate-400 text-sm group-hover:translate-x-0.5 transition-transform"></iconify-icon>
        </div>
      </div>
    </div>

  </div>
</template>
