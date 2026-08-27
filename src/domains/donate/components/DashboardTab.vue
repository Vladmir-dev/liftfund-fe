<script setup lang="ts">
const props = defineProps<{
  title: string
  targetAmount: number
  raisedAmount: number
  progressPercent: number
  strokeDashoffset: number
  strokeCircumference: number
}>()

const emit = defineEmits<{
  (e: 'edit'): void
  (e: 'share'): void
  (e: 'message'): void
  (e: 'transfers'): void
}>()
</script>

<template>
  <div class="flex flex-col gap-6 animate-fade-in text-left">
    <!-- Dashboard core section -->
    <div class="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm flex flex-col gap-6 text-left">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 class="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">{{ title }}</h2>
        <button @click="emit('share')" class="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-6 py-3 rounded-full transition-all shadow-md shrink-0 cursor-pointer font-sans">
          Share fundraiser
        </button>
      </div>

      <!-- Goal Info Panel -->
      <div class="rounded-2xl border border-slate-100 p-5 flex items-center gap-4">
        <!-- Progress Circle Circular -->
        <div class="relative w-12 h-12 flex items-center justify-center shrink-0">
          <svg class="w-full h-full transform -rotate-90" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="18" fill="transparent" stroke="#f1f5f9" stroke-width="3" />
            <circle cx="20" cy="20" r="18" fill="transparent" stroke="#2563eb" stroke-width="3" 
                    :stroke-dasharray="strokeCircumference" 
                    :stroke-dashoffset="strokeDashoffset" 
                    stroke-linecap="round" />
          </svg>
          <span class="absolute text-[10px] font-black text-slate-800">{{ progressPercent }}%</span>
        </div>

        <div>
          <h4 class="text-sm font-bold text-slate-900 mb-0.5">${{ targetAmount }} goal</h4>
          <button @click="emit('transfers')" class="text-xs text-blue-600 font-bold hover:underline cursor-pointer focus:outline-none">Set up transfers</button>
        </div>
      </div>

      <!-- Action buttons row -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button @click="emit('edit')" class="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer font-sans">
          <iconify-icon icon="ph:pencil-simple-bold" class="text-sm"></iconify-icon>
          <span>Edit</span>
        </button>
        <button @click="emit('share')" class="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer font-sans">
          <iconify-icon icon="ph:link-bold" class="text-sm"></iconify-icon>
          <span>Copy unique link</span>
        </button>
        <button @click="emit('message')" class="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer font-sans">
          <iconify-icon icon="ph:users-bold" class="text-sm"></iconify-icon>
          <span>Message co-organizers</span>
        </button>
      </div>
    </div>

    <!-- Raymond's Fundraising Checklist -->
    <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-left">
      <h3 class="text-base font-bold text-slate-900 mb-4">Raymond's fundraising checklist</h3>

      <div class="flex flex-col gap-4">
        <!-- Boost item -->
        <div class="border border-slate-100 rounded-2xl p-4 flex items-center gap-4 bg-slate-50/30">
          <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg shrink-0">
            <iconify-icon icon="ph:plant-bold"></iconify-icon>
          </div>
          <div class="text-xs">
            <h5 class="font-bold text-slate-800 mb-0.5">Boost fundraiser</h5>
            <div class="flex items-center gap-1.5 text-slate-400 font-semibold">
              <iconify-icon icon="ph:circle"></iconify-icon>
              <span>1 of 5</span>
            </div>
          </div>
        </div>

        <!-- Share item -->
        <div class="border border-slate-100 rounded-2xl p-4 flex items-center gap-4 bg-slate-50/30">
          <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg shrink-0">
            <iconify-icon icon="ph:paper-plane-tilt-bold"></iconify-icon>
          </div>
          <div class="text-xs">
            <h5 class="font-bold text-slate-800 mb-0.5">Share early and often</h5>
            <div class="flex items-center gap-1.5 text-slate-400 font-semibold">
              <iconify-icon icon="ph:circle"></iconify-icon>
              <span>0 of 4</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Expert Resources Guide -->
    <div class="text-left flex flex-col gap-4">
      <h3 class="text-base font-extrabold text-slate-900">Our experts are here for you</h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Main Resource card left -->
        <div class="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm flex flex-col group hover:shadow-md transition-shadow">
          <div class="aspect-video bg-slate-100 relative overflow-hidden">
            <img src="https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=600" class="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
          </div>
          <div class="p-5 flex flex-col justify-between flex-grow">
            <h4 class="text-sm font-bold text-slate-900 mb-2 leading-snug">Tips & templates for writing thank you notes</h4>
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">5 min read</span>
          </div>
        </div>

        <!-- Sub resources list right -->
        <div class="flex flex-col gap-4 justify-between">
          <!-- Sub item 1 -->
          <div class="bg-white border border-slate-100 rounded-3xl p-4 flex gap-4 items-center shadow-sm group hover:shadow-md transition-shadow cursor-pointer font-sans">
            <div class="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden shrink-0">
              <img src="https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=150" class="w-full h-full object-cover" />
            </div>
            <div class="text-xs">
              <h4 class="font-bold text-slate-800 mb-1.5 leading-snug">What to do when your fundraiser stalls</h4>
              <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">6 min read</span>
            </div>
          </div>

          <!-- Sub item 2 -->
          <div class="bg-white border border-slate-100 rounded-3xl p-4 flex gap-4 items-center shadow-sm group hover:shadow-md transition-shadow cursor-pointer font-sans">
            <div class="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden shrink-0">
              <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=150" class="w-full h-full object-cover" />
            </div>
            <div class="text-xs">
              <h4 class="font-bold text-slate-800 mb-1.5 leading-snug">Ideas for online and in-person fundraising</h4>
              <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">10 min read</span>
            </div>
          </div>
        </div>
      </div>
    </div>
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
</style>
