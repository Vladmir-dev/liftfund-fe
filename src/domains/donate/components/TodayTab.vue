<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title: string
  targetAmount: number
  raisedAmount: number
  imageUrl: string
  organizer: string
}>()

const emit = defineEmits<{
  (e: 'share'): void
}>()

const progressPercent = computed(() => {
  const pct = (props.raisedAmount / props.targetAmount) * 100
  return Math.min(100, Math.round(pct))
})

const strokeCircumference = 2 * Math.PI * 18
const strokeDashoffset = computed(() => {
  return strokeCircumference - (progressPercent.value / 100) * strokeCircumference
})
</script>

<template>
  <div class="flex flex-col gap-6 text-slate-800 animate-fade-in">
    
    <!-- Today Top Goal Container -->
    <div class="bg-gradient-to-br from-emerald-500/20 via-emerald-400/10 to-transparent border border-emerald-100 rounded-3xl p-6 relative text-center shadow-sm overflow-hidden flex flex-col items-center">
      
      <!-- Circle Progress Container -->
      <div class="relative w-20 h-20 flex items-center justify-center shrink-0 mb-3">
        <svg class="w-full h-full transform -rotate-90" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="18" fill="transparent" stroke="#e2e8f0" stroke-width="2.5" />
          <circle cx="20" cy="20" r="18" fill="transparent" stroke="#10b981" stroke-width="2.5" 
                  :stroke-dasharray="strokeCircumference" 
                  :stroke-dashoffset="strokeDashoffset" 
                  stroke-linecap="round" />
        </svg>
        <div class="absolute w-14 h-14 rounded-full overflow-hidden bg-white">
          <img :src="imageUrl" class="w-full h-full object-cover" alt="Campaign Thumbnail" />
        </div>
      </div>

      <div class="mb-4">
        <h2 class="text-2xl font-black text-slate-900 flex items-center justify-center gap-1 cursor-pointer">
          ${{ targetAmount }} goal
          <iconify-icon icon="ph:caret-right-bold" class="text-slate-400 text-sm"></iconify-icon>
        </h2>
        <p class="text-xs font-semibold text-slate-500">{{ title }}</p>
      </div>

      <!-- Small Stats Pill Row -->
      <div class="bg-white/80 backdrop-blur-xs border border-slate-100 rounded-full px-5 py-2.5 flex items-center gap-6 shadow-xs text-xs font-bold text-slate-700">
        <div><span class="text-slate-900 font-extrabold mr-1">0</span> Donors</div>
        <div class="w-px h-3.5 bg-slate-200"></div>
        <div><span class="text-slate-900 font-extrabold mr-1">0</span> Shares</div>
        <div class="w-px h-3.5 bg-slate-200"></div>
        <div><span class="text-slate-900 font-extrabold mr-1">2</span> Views</div>
      </div>
    </div>

    <!-- Daily Plan Checklist Section -->
    <div class="text-left">
      <div class="flex items-center gap-2 mb-4">
        <h3 class="text-lg font-black text-slate-900 tracking-tight">{{ organizer.split(' ')[0] }}'s daily plan</h3>
        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100 uppercase tracking-wider">
          <iconify-icon icon="ph:check-bold"></iconify-icon>
          0 tasks
        </span>
      </div>

      <div class="flex flex-col gap-3">
        <!-- Checklist Item 1 -->
        <div class="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group">
          <div class="flex items-center gap-4">
            <div class="w-6 h-6 rounded-full border-2 border-slate-200 flex items-center justify-center shrink-0 text-[10px] text-slate-300"></div>
            <span class="text-xs font-bold text-slate-700 leading-snug">Text close friends and family to get your first views</span>
          </div>
          <iconify-icon icon="ph:caret-right-bold" class="text-slate-400 text-sm group-hover:translate-x-0.5 transition-transform"></iconify-icon>
        </div>

        <!-- Checklist Item 2 -->
        <div class="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group">
          <div class="flex items-center gap-4">
            <div class="w-6 h-6 rounded-full border-2 border-slate-200 flex items-center justify-center shrink-0 text-[10px] text-slate-300"></div>
            <div>
              <span class="text-xs font-bold text-slate-700 leading-snug block mb-1">Connect your contacts to find supporters you know</span>
              <span class="inline-flex items-center px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-wider border border-emerald-100/50">
                ⚡ Up to 55% more donations
              </span>
            </div>
          </div>
          <iconify-icon icon="ph:caret-right-bold" class="text-slate-400 text-sm group-hover:translate-x-0.5 transition-transform"></iconify-icon>
        </div>

        <!-- Checklist Item 3 -->
        <div class="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group">
          <div class="flex items-center gap-4">
            <div class="w-6 h-6 rounded-full border-2 border-slate-200 flex items-center justify-center shrink-0 text-[10px] text-slate-300"></div>
            <span class="text-xs font-bold text-slate-700 leading-snug">Download the app to manage on the go</span>
          </div>
          <iconify-icon icon="ph:caret-right-bold" class="text-slate-400 text-sm group-hover:translate-x-0.5 transition-transform"></iconify-icon>
        </div>
      </div>
    </div>

  </div>
</template>
