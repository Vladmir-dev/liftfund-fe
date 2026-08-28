<script setup lang="ts">
const props = defineProps<{
  campaignId: string
  title: string
  organizer: string
  imageUrl: string
}>()

const emit = defineEmits<{
  (e: 'copy-link'): void
}>()

const handleCopyLink = () => {
  emit('copy-link')
}
</script>

<template>
  <div class="flex flex-col gap-6 text-slate-800 animate-fade-in text-left">
    
    <!-- Header Row -->
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-black text-slate-900">Sharehub</h2>
      <button @click="handleCopyLink" class="bg-[#0f2e24] hover:bg-[#153f31] text-white font-extrabold text-xs px-5 py-2.5 rounded-full transition-all shadow-md cursor-pointer font-sans">
        Share fundraiser
      </button>
    </div>

    <p class="text-slate-500 text-xs font-semibold leading-relaxed -mt-3">
      Sharing your link anywhere is a quick way to spread the word — paste it everywhere you can.
    </p>

    <!-- Brand sharing circle row -->
    <div class="flex items-center justify-center gap-4 py-2 border-y border-slate-100/50">
      <!-- Copy Link -->
      <button @click="handleCopyLink" class="flex flex-col items-center gap-1.5 cursor-pointer group">
        <div class="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center transition-colors">
          <iconify-icon icon="ph:link-bold" class="text-base"></iconify-icon>
        </div>
        <span class="text-[9px] font-bold text-slate-500 group-hover:text-slate-700">Copy link</span>
      </button>

      <!-- WhatsApp -->
      <button class="flex flex-col items-center gap-1.5 cursor-pointer group">
        <div class="w-10 h-10 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 flex items-center justify-center transition-colors">
          <iconify-icon icon="ph:whatsapp-logo-fill" class="text-lg"></iconify-icon>
        </div>
        <span class="text-[9px] font-bold text-slate-500 group-hover:text-slate-700">WhatsApp</span>
      </button>

      <!-- Email -->
      <button class="flex flex-col items-center gap-1.5 cursor-pointer group">
        <div class="w-10 h-10 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors">
          <iconify-icon icon="ph:envelope-bold" class="text-base"></iconify-icon>
        </div>
        <span class="text-[9px] font-bold text-slate-500 group-hover:text-slate-700">Email</span>
      </button>

      <!-- Text -->
      <button class="flex flex-col items-center gap-1.5 cursor-pointer group">
        <div class="w-10 h-10 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors">
          <iconify-icon icon="ph:chat-text-bold" class="text-base"></iconify-icon>
        </div>
        <span class="text-[9px] font-bold text-slate-500 group-hover:text-slate-700">Text</span>
      </button>

      <!-- Facebook -->
      <button class="flex flex-col items-center gap-1.5 cursor-pointer group">
        <div class="w-10 h-10 rounded-full bg-[#1877F2] text-white hover:bg-[#166fe5] flex items-center justify-center transition-colors">
          <iconify-icon icon="ph:facebook-logo-fill" class="text-base"></iconify-icon>
        </div>
        <span class="text-[9px] font-bold text-slate-500 group-hover:text-slate-700">Facebook</span>
      </button>

      <!-- Instagram -->
      <button class="flex flex-col items-center gap-1.5 cursor-pointer group">
        <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 text-white hover:scale-105 flex items-center justify-center transition-all">
          <iconify-icon icon="ph:instagram-logo-fill" class="text-base"></iconify-icon>
        </div>
        <span class="text-[9px] font-bold text-slate-500 group-hover:text-slate-700">Instagram</span>
      </button>
    </div>

    <!-- Preview Card Graphic -->
    <div class="bg-slate-50 rounded-3xl p-6 border border-slate-150 flex flex-col gap-6 shadow-xs relative">
      <div class="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center shadow-xs">
        <!-- left content -->
        <div class="flex-1 text-left">
          <h4 class="font-extrabold text-slate-900 text-sm mb-1 leading-snug">{{ title }}</h4>
          <p class="text-[10px] text-slate-400 font-bold mb-3">Organized by {{ organizer }}</p>
          <div class="flex items-center gap-3">
            <span class="inline-flex px-3 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-black border border-emerald-100 rounded-full uppercase tracking-wider">
              $200 to goal
            </span>
            <button class="bg-[#0f2e24] text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider cursor-pointer">
              Donate now!
            </button>
          </div>
        </div>
        <!-- right image -->
        <div class="w-28 h-20 rounded-xl overflow-hidden shrink-0 shadow-sm border border-slate-100">
          <img :src="imageUrl" class="w-full h-full object-cover" />
        </div>
      </div>

      <!-- Big Copy Link Button -->
      <button @click="handleCopyLink" class="bg-[#0f2e24] hover:bg-[#153f31] text-white font-extrabold text-xs py-3.5 rounded-full flex items-center justify-center gap-2 cursor-pointer shadow-md">
        <iconify-icon icon="ph:link-bold" class="text-sm"></iconify-icon>
        <span>Copy Link</span>
      </button>
    </div>

    <!-- More ways to amplify -->
    <div>
      <div class="flex items-center justify-between mb-3.5">
        <h3 class="text-sm font-black text-slate-900 uppercase tracking-wider">More ways to amplify</h3>
        <button class="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1">
          <iconify-icon icon="ph:download-bold" class="text-sm"></iconify-icon>
          <span>Download all assets</span>
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <!-- Option 1: Post update -->
        <div class="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col items-center text-center justify-center min-h-[100px] hover:shadow-md transition-shadow cursor-pointer">
          <div class="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 mb-2 border border-slate-100">
            <iconify-icon icon="ph:megaphone-bold" class="text-base"></iconify-icon>
          </div>
          <span class="text-[10px] font-bold text-slate-700 leading-tight">Post an update</span>
        </div>

        <!-- Option 2: Say thanks -->
        <div class="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col items-center text-center justify-center min-h-[100px] hover:shadow-md transition-shadow cursor-pointer">
          <div class="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 mb-2 border border-slate-100">
            <iconify-icon icon="ph:heart-bold" class="text-base"></iconify-icon>
          </div>
          <span class="text-[10px] font-bold text-slate-700 leading-tight">Say thanks</span>
        </div>

        <!-- Option 3: Create a team -->
        <div class="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col items-center text-center justify-center min-h-[100px] hover:shadow-md transition-shadow cursor-pointer">
          <div class="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 mb-2 border border-slate-100">
            <iconify-icon icon="ph:users-bold" class="text-base"></iconify-icon>
          </div>
          <span class="text-[10px] font-bold text-slate-700 leading-tight">Create a team</span>
        </div>
      </div>
    </div>

  </div>
</template>
