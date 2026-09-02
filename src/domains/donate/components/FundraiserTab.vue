<script setup lang="ts">
import { useRouter } from 'vue-router'

const props = defineProps<{
  campaignId: string
  title: string
  imageUrl: string
}>()

const emit = defineEmits<{
  (e: 'post-update'): void
  (e: 'transfers'): void
  (e: 'edit'): void
}>()

const router = useRouter()

const handlePreview = () => {
  router.push(`/campaign/${props.campaignId}`)
}
</script>

<template>
  <div class="flex flex-col gap-6 text-slate-800 animate-fade-in text-left">

    <!-- Header Row -->
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-black text-slate-900">Fundraiser</h2>
      <button
        class="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-full shadow-xs flex items-center gap-1.5 cursor-pointer">
        <iconify-icon icon="ph:user-plus-bold" class="text-sm"></iconify-icon>
        <span>Invite co-organizers</span>
      </button>
    </div>

    <!-- Fundraiser Card -->
    <div class="bg-white border border-slate-150 rounded-3xl p-5 shadow-xs flex items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <!-- Circular avatar/logo -->
        <div class="w-14 h-14 rounded-full overflow-hidden bg-slate-100 border border-slate-100 shadow-sm shrink-0">
          <img :src="imageUrl" class="w-full h-full object-cover" />
        </div>
        <div>
          <h4 class="font-extrabold text-slate-900 text-sm leading-snug mb-0.5">{{ title }}</h4>
          <button @click="handlePreview"
            class="text-[11px] text-slate-500 hover:text-slate-800 font-semibold underline flex items-center gap-1 cursor-pointer">
            <span>Preview fundraiser</span>
            <iconify-icon icon="ph:arrow-right-bold" class="text-[10px]"></iconify-icon>
          </button>
        </div>
      </div>
    </div>

    <!-- Two primary buttons -->
    <div class="flex flex-col sm:flex-row gap-3">
      <button @click="emit('post-update')"
        class="bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs py-3 rounded-2xl transition-all shadow-xs flex-1 flex items-center justify-center gap-2 cursor-pointer">
        <iconify-icon icon="ph:note-pencil-bold" class="text-sm"></iconify-icon>
        <span>Post update</span>
      </button>

      <button @click="emit('transfers')"
        class="bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs py-3 rounded-2xl transition-all shadow-xs flex-1 flex items-center justify-center gap-2 cursor-pointer">
        <iconify-icon icon="ph:bank-bold" class="text-sm"></iconify-icon>
        <span>Transfers</span>
      </button>
    </div>

    <!-- Vertical menu list -->
    <div class="flex flex-col gap-2.5">
      <!-- Edit fundraiser -->
      <div @click="emit('edit')"
        class="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group">
        <div class="flex items-center gap-3">
          <div
            class="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-100">
            <iconify-icon icon="ph:pencil-simple-bold" class="text-sm"></iconify-icon>
          </div>
          <span class="text-xs font-bold text-slate-700">Edit fundraiser</span>
        </div>
        <iconify-icon icon="ph:caret-right-bold"
          class="text-slate-400 text-sm group-hover:translate-x-0.5 transition-transform"></iconify-icon>
      </div>

      <!-- Change fundraiser settings -->
      <div
        class="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group">
        <div class="flex items-center gap-3">
          <div
            class="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-100">
            <iconify-icon icon="ph:gear-six-bold" class="text-sm"></iconify-icon>
          </div>
          <span class="text-xs font-bold text-slate-700">Change fundraiser settings</span>
        </div>
        <iconify-icon icon="ph:caret-right-bold"
          class="text-slate-400 text-sm group-hover:translate-x-0.5 transition-transform"></iconify-icon>
      </div>

      <!-- Get help from customer care -->
      <!-- <div class="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group">
        <div class="flex items-center gap-3">
          <div class="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-100">
            <iconify-icon icon="ph:question-bold" class="text-sm"></iconify-icon>
          </div>
          <span class="text-xs font-bold text-slate-700">Get help from customer care</span>
        </div>
        <iconify-icon icon="ph:caret-right-bold" class="text-slate-400 text-sm group-hover:translate-x-0.5 transition-transform"></iconify-icon>
      </div> -->
    </div>

  </div>
</template>
