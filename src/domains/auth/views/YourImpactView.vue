<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../../stores/auth'
import NavHeader from '../../landing/components/NavHeader.vue'
import MainFooter from '../../landing/components/MainFooter.vue'

const router = useRouter()
const authStore = useAuthStore()

const navHeaderRef = ref<any>(null)
const closeDropdowns = () => {
  navHeaderRef.value?.closeDropdowns()
}

const activeActivityTab = ref<'share' | 'donation'>('share')

const findFundraisers = () => {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50/50 text-slate-800 font-sans text-left" @click="closeDropdowns">
    <NavHeader ref="navHeaderRef" />

    <main class="max-w-4xl mx-auto px-4 py-16 flex flex-col items-center">
      
      <!-- User Portrait Avatar -->
      <div class="w-16 h-16 rounded-full overflow-hidden bg-slate-200 shadow-sm border border-slate-200 mb-4">
        <img :src="authStore.user.avatar" class="w-full h-full object-cover" alt="User portrait" />
      </div>

      <!-- Impact Score -->
      <span class="text-6xl font-black text-slate-900 mb-2 leading-none">$0</span>
      <p class="text-slate-500 text-sm font-semibold mb-10 text-center">
        Your total impact from donating, organizing and sharing
      </p>

      <!-- Stats Grid Card (Matches Screenshot 1) -->
      <div class="bg-white rounded-3xl border border-slate-100 shadow-sm w-full grid grid-cols-2 divide-x divide-slate-100 p-6 mb-8 text-center sm:text-left">
        <div class="p-4 flex flex-col items-center sm:items-start">
          <div class="flex items-center gap-2 text-slate-700 font-extrabold text-lg mb-1">
            <iconify-icon icon="lucide:heart-handshake" class="text-slate-400"></iconify-icon>
            <span>0</span>
          </div>
          <span class="text-slate-400 text-xs font-semibold">Fundraisers supported</span>
        </div>
        <div class="p-4 flex flex-col items-center sm:items-start pl-8">
          <div class="flex items-center gap-2 text-slate-700 font-extrabold text-lg mb-1">
            <iconify-icon icon="lucide:users" class="text-slate-400"></iconify-icon>
            <span>0</span>
          </div>
          <span class="text-slate-400 text-xs font-semibold">People you inspired to help</span>
        </div>
      </div>

      <!-- Green CTA Callout Banner -->
      <div class="bg-[#0f2e24] text-white rounded-3xl p-8 w-full text-left mb-16 flex flex-col sm:flex-row justify-between sm:items-center gap-6">
        <div>
          <h3 class="font-extrabold text-lg mb-2">Start seeing your impact</h3>
          <p class="text-emerald-100 text-xs sm:text-sm leading-relaxed max-w-md">
            When you donate to and share fundraisers, you can view the total impact above.
          </p>
        </div>
        <button @click="findFundraisers" class="bg-white hover:bg-emerald-50 text-[#0f2e24] font-bold px-6 py-3 rounded-full text-xs transition-colors shrink-0 cursor-pointer">
          Find a fundraiser &gt;
        </button>
      </div>

      <!-- Fundraisers you support activity list -->
      <div class="w-full text-left bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
        <h3 class="font-black text-slate-900 text-lg mb-6">Fundraisers you support</h3>

        <!-- Tab toggles -->
        <div class="flex items-center gap-2 border-b border-slate-100 pb-3 mb-8">
          <button @click="activeActivityTab = 'share'" class="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer"
            :class="activeActivityTab === 'share' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800'">
            Share activity
          </button>
          <button @click="activeActivityTab = 'donation'" class="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer"
            :class="activeActivityTab === 'donation' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800'">
            Donation activity
          </button>
        </div>

        <!-- Activity logs empty state -->
        <div class="py-16 text-center text-slate-400 text-xs sm:text-sm font-semibold leading-relaxed">
          <template v-if="activeActivityTab === 'share'">
            Donations made from fundraisers you've shared will appear here.
          </template>
          <template v-else>
            Donations you make directly will be detailed here in your activity timeline.
          </template>
        </div>
      </div>

    </main>

    <MainFooter />
  </div>
</template>
