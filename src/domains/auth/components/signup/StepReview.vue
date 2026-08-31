<script setup lang="ts">
const props = defineProps<{
  title: string
  targetAmount: number
  useAutomatedGoal: boolean
  startingGoal: number
  selectedCategory: string | null
  zipCode: string
  resolvedCity: string
  story: string
  mediaUrl: string | null
}>()

const emit = defineEmits<{
  (e: 'editStep', step: number): void
  (e: 'openPreview'): void
  (e: 'launch'): void
}>()
</script>

<template>
  <div class="text-left animate-fade-in">
    <h2 class="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-3">Review details</h2>
    
    <div class="flex flex-col gap-6">
      <!-- Media review block -->
      <div class="flex flex-col gap-2">
        <label class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Media</label>
        <div class="relative group rounded-xl overflow-hidden aspect-video border bg-slate-100 border-slate-150 shadow-sm max-w-md">
          <img v-if="mediaUrl" :src="mediaUrl" class="w-full h-full object-cover" />
          <div v-else @click="emit('editStep', 3)" class="w-full h-full border border-dashed border-slate-300 flex flex-col items-center justify-center gap-2 cursor-pointer p-6 bg-slate-50/50">
            <iconify-icon icon="ph:image-square-bold" class="text-slate-400 text-2xl"></iconify-icon>
            <span class="text-xs font-bold text-slate-500">Upload photos</span>
            <p class="text-[9px] text-slate-400">Bright and clear media helps donors connect to your fundraiser.</p>
            <button class="bg-white border border-slate-200 hover:border-slate-400 text-slate-700 px-3.5 py-1 rounded-lg text-[10px] font-bold mt-1 shadow-sm font-sans">
              Upload
            </button>
          </div>
          <button v-if="mediaUrl" @click="emit('editStep', 3)" class="absolute top-2 right-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-[10px] px-3 py-1 rounded-full shadow-md z-10 transition-all font-sans">
            Edit
          </button>
        </div>
      </div>

      <!-- Title section -->
      <div class="flex flex-col gap-1.5 border-b border-slate-100 pb-4">
        <div class="flex justify-between items-center">
          <label class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Title</label>
          <button @click="emit('editStep', 5)" class="text-xs font-bold text-slate-500 hover:text-slate-900 border border-slate-200 px-3 py-0.5 rounded-full hover:bg-slate-50 font-sans">Edit</button>
        </div>
        <p class="text-sm font-bold text-slate-800">{{ title || 'Help Cats' }}</p>
      </div>

      <!-- Fundraising Goal section -->
      <div class="flex flex-col gap-1.5 border-b border-slate-100 pb-4">
        <div class="flex justify-between items-center">
          <label class="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span>Fundraising goal</span>
            <span v-if="useAutomatedGoal" class="bg-[#edfce0] text-[#024731] text-[9px] font-black px-2 py-0.5 rounded-full uppercase border border-[#bbf770]">Automated</span>
          </label>
          <button @click="emit('editStep', 2)" class="text-xs font-bold text-slate-500 hover:text-slate-900 border border-slate-200 px-3 py-0.5 rounded-full hover:bg-slate-50 font-sans cursor-pointer">Edit</button>
        </div>
        <p class="text-sm font-bold text-slate-800">${{ targetAmount }} USD</p>
        
        <!-- Yellow started goal info -->
        <div v-if="useAutomatedGoal" class="bg-[#fef7e0] border border-[#feebc8] rounded-xl p-3 flex items-center gap-2 text-xs text-[#b06000] font-semibold mt-1">
          <iconify-icon icon="ph:gear-six-fill" class="text-sm text-[#e0a800]"></iconify-icon>
          <span>Your starting goal is ${{ startingGoal }}</span>
        </div>
      </div>

      <!-- Category section -->
      <div class="flex flex-col gap-1.5 border-b border-slate-100 pb-4">
        <div class="flex justify-between items-center">
          <label class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Category</label>
          <button @click="emit('editStep', 0)" class="text-xs font-bold text-slate-500 hover:text-slate-900 border border-slate-200 px-3 py-0.5 rounded-full hover:bg-slate-50 font-sans">Edit</button>
        </div>
        <p class="text-sm font-bold text-slate-800">{{ selectedCategory || 'Community' }}</p>
      </div>

      <!-- Location section -->
      <div class="flex flex-col gap-1.5 border-b border-slate-100 pb-4">
        <div class="flex justify-between items-center">
          <label class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Location</label>
          <button @click="emit('editStep', 0)" class="text-xs font-bold text-slate-500 hover:text-slate-900 border border-slate-200 px-3 py-0.5 rounded-full hover:bg-slate-50 font-sans">Edit</button>
        </div>
        <p class="text-sm font-bold text-slate-800">{{ zipCode }} - {{ resolvedCity }}</p>
      </div>

      <!-- Story section -->
      <div class="flex flex-col gap-1.5">
        <div class="flex justify-between items-center">
          <label class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Story</label>
          <button @click="emit('editStep', 4)" class="text-xs font-bold text-slate-500 hover:text-slate-900 border border-slate-200 px-3 py-0.5 rounded-full hover:bg-slate-50 font-sans">Edit</button>
        </div>
        <p class="text-sm text-slate-600 leading-relaxed line-clamp-3 font-medium">{{ story || 'lorem20...' }}</p>
      </div>

    </div>
  </div>
</template>
