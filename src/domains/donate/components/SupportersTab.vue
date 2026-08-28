<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  campaignId: string
}>()

const emit = defineEmits<{
  (e: 'copy-link'): void
}>()

const activeSubTab = ref<'opportunities' | 'donated' | 'shared'>('opportunities')
const searchQuery = ref('')

const handleCopyLink = () => {
  emit('copy-link')
}
</script>

<template>
  <div class="flex flex-col gap-6 text-slate-800 animate-fade-in text-left">
    
    <!-- Header Row -->
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-black text-slate-900">Supporters</h2>
      <button class="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-full shadow-xs flex items-center gap-1.5 cursor-pointer">
        <iconify-icon icon="ph:address-book-bold" class="text-sm"></iconify-icon>
        <span>Import</span>
      </button>
    </div>

    <!-- Search input -->
    <div class="relative w-full">
      <iconify-icon icon="ph:magnifying-glass-bold" class="absolute left-4 top-3.5 text-slate-400 text-base"></iconify-icon>
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Search your network" 
        class="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
      />
      <iconify-icon icon="ph:sliders-horizontal-bold" class="absolute right-4 top-3.5 text-slate-400 text-base cursor-pointer hover:text-slate-700"></iconify-icon>
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
        Donated
      </button>
      <button 
        @click="activeSubTab = 'shared'" 
        class="text-xs font-black pb-3 relative tracking-wide cursor-pointer"
        :class="activeSubTab === 'shared' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 hover:text-slate-600'"
      >
        Shared
      </button>
    </div>

    <!-- Active Tab content -->
    <div v-if="activeSubTab === 'opportunities'" class="flex flex-col gap-6">
      
      <!-- Purple Connect Contacts Card -->
      <div class="bg-[#f5f0ff] border border-purple-100 rounded-3xl p-6 text-center flex flex-col items-center shadow-xs">
        <div class="flex items-center gap-1.5 mb-3">
          <div class="w-8 h-8 rounded-full bg-purple-200/50 flex items-center justify-center text-purple-700">
            <iconify-icon icon="ph:question-bold" class="text-sm"></iconify-icon>
          </div>
          <div class="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center text-purple-800 font-bold border-2 border-white -ml-2.5">
            <iconify-icon icon="ph:chats-circle-bold" class="text-base"></iconify-icon>
          </div>
        </div>
        <h3 class="text-lg font-black text-purple-950 mb-1 leading-snug">Fundraising takes a village.<br/>Let's find yours.</h3>
        <p class="text-[11px] text-purple-700/80 max-w-sm leading-relaxed mb-4 font-semibold">
          Thousands have found fundraising success by connecting their contacts. Discover who's already cheering you on, and who might be ready to help next.
        </p>
        <button class="bg-[#5830c1] hover:bg-[#4a24a6] text-white font-bold text-xs px-6 py-2.5 rounded-full transition-all shadow-md">
          Connect your contacts
        </button>
      </div>

      <!-- Who should we connect with first? -->
      <div>
        <h3 class="text-sm font-black text-slate-900 mb-3 uppercase tracking-wider">Who should we connect with first?</h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <!-- classmate card -->
          <div class="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col items-center text-center justify-center min-h-[110px] hover:shadow-md transition-shadow cursor-pointer">
            <div class="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 mb-2.5 border border-slate-100">
              <iconify-icon icon="ph:student-bold" class="text-lg"></iconify-icon>
            </div>
            <span class="text-[10px] font-bold text-slate-700 leading-tight">Reconnect with your classmates</span>
          </div>

          <!-- already know card -->
          <div class="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col items-center text-center justify-center min-h-[110px] hover:shadow-md transition-shadow cursor-pointer">
            <div class="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 mb-2.5 border border-slate-100">
              <iconify-icon icon="ph:magnifying-glass-bold" class="text-lg"></iconify-icon>
            </div>
            <span class="text-[10px] font-bold text-slate-700 leading-tight">See who you already know on HelpFund</span>
          </div>

          <!-- linkedin card -->
          <div class="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col items-center text-center justify-center min-h-[110px] hover:shadow-md transition-shadow cursor-pointer">
            <div class="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 mb-2.5 border border-slate-100">
              <iconify-icon icon="ph:users-bold" class="text-lg"></iconify-icon>
            </div>
            <span class="text-[10px] font-bold text-slate-700 leading-tight">Connect with coworkers via LinkedIn</span>
          </div>
        </div>
      </div>

      <!-- Share your fundraiser -->
      <div>
        <h3 class="text-sm font-black text-slate-900 mb-3 uppercase tracking-wider">Share your fundraiser</h3>
        
        <!-- Copy link row -->
        <button 
          @click="handleCopyLink" 
          class="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs py-3.5 rounded-2xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mb-4"
        >
          <iconify-icon icon="ph:link-bold" class="text-sm"></iconify-icon>
          <span>Copy fundraiser link</span>
        </button>

        <div class="flex flex-col gap-2.5">
          <!-- Text link -->
          <div class="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group">
            <div class="flex items-center gap-3">
              <iconify-icon icon="ph:chat-text-bold" class="text-slate-400 text-base"></iconify-icon>
              <span class="text-xs font-bold text-slate-700">Send in a text</span>
            </div>
            <iconify-icon icon="ph:caret-right-bold" class="text-slate-400 text-sm group-hover:translate-x-0.5 transition-transform"></iconify-icon>
          </div>

          <!-- Email link -->
          <div class="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group">
            <div class="flex items-center gap-3">
              <iconify-icon icon="ph:envelope-bold" class="text-slate-400 text-base"></iconify-icon>
              <span class="text-xs font-bold text-slate-700">Send in an email</span>
            </div>
            <iconify-icon icon="ph:caret-right-bold" class="text-slate-400 text-sm group-hover:translate-x-0.5 transition-transform"></iconify-icon>
          </div>

          <!-- More options -->
          <div class="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group">
            <div class="flex items-center gap-3">
              <iconify-icon icon="ph:dots-three-circle-bold" class="text-slate-400 text-base"></iconify-icon>
              <span class="text-xs font-bold text-slate-700">More options</span>
            </div>
            <iconify-icon icon="ph:caret-right-bold" class="text-slate-400 text-sm group-hover:translate-x-0.5 transition-transform"></iconify-icon>
          </div>
        </div>
      </div>

    </div>

    <!-- Donated/Shared Empty States -->
    <div v-else class="py-16 text-center bg-white border border-slate-100 rounded-3xl p-8 shadow-xs">
      <iconify-icon icon="ph:users-bold" class="text-slate-300 text-4xl mb-3"></iconify-icon>
      <p class="text-slate-400 text-xs font-semibold">No activity to display yet.</p>
    </div>

  </div>
</template>
