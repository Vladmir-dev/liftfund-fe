<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  story: string
  wordCount: number
  storyValid: boolean
  isEnhancing: boolean
}>()

const emit = defineEmits<{
  (e: 'update:story', val: string): void
  (e: 'enhanceStory'): void
}>()

const localStory = computed({
  get: () => props.story,
  set: (val) => emit('update:story', val)
})
</script>

<template>
  <div class="text-left animate-fade-in">
    <!-- Textarea area -->
    <div class="mb-4">
      <textarea v-model="localStory" placeholder="Explain who you are raising money for, what the funds will be used for, and how soon you need them..." class="w-full h-52 px-4 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#024731] focus:border-transparent text-sm font-medium leading-relaxed resize-none"></textarea>
    </div>

    <!-- Strengthen your story box -->
    <div class="bg-[#fef7e0] border border-[#feebc8] rounded-2xl p-5 text-left flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <iconify-icon icon="ph:sparkle-fill" class="text-yellow-600 text-base shrink-0"></iconify-icon>
          <div>
            <h4 class="text-xs font-bold text-slate-900">Strengthen your story</h4>
            <span class="text-[10px] text-slate-500">
              <template v-if="wordCount < 20">{{ 20 - wordCount }} words needed</template>
              <template v-else>Story meets recommended length</template>
            </span>
          </div>
        </div>
        
        <!-- Enhance button -->
        <button @click="emit('enhanceStory')" :disabled="isEnhancing" class="bg-white border border-slate-200 hover:border-[#024731] disabled:opacity-50 text-slate-800 font-bold text-xs px-4 py-1.5 rounded-full transition-all shrink-0 shadow-sm flex items-center gap-1 cursor-pointer">
          <span v-if="isEnhancing" class="h-3 w-3 border-2 border-[#024731] border-t-transparent rounded-full animate-spin"></span>
          <span>Enhance</span>
        </button>
      </div>

      <div class="border-t border-[#feebc8] pt-3.5">
        <p class="text-[10px] text-slate-500 mb-3">Write as much as you can, and we'll enhance these elements of your story with AI:</p>
        <div class="flex flex-wrap gap-2">
          <span class="inline-flex items-center gap-1 text-[10px] bg-white text-red-700 px-2.5 py-1 rounded-full border border-red-100 font-bold">
            <iconify-icon icon="ph:pencil-circle-bold" class="text-red-500 text-xs shrink-0"></iconify-icon>
            Spelling and grammar
          </span>
          <span class="inline-flex items-center gap-1 text-[10px] bg-white text-[#024731] px-2.5 py-1 rounded-full border border-[#d8fc9e] font-bold">
            <iconify-icon icon="ph:microphone-stage-bold" class="text-[#02a95c] text-xs shrink-0"></iconify-icon>
            Tone
          </span>
          <span class="inline-flex items-center gap-1 text-[10px] bg-white text-purple-700 px-2.5 py-1 rounded-full border border-purple-100 font-bold">
            <iconify-icon icon="ph:chat-circle-dots-bold" class="text-purple-500 text-xs shrink-0"></iconify-icon>
            Word choice
          </span>
          <span class="inline-flex items-center gap-1 text-[10px] bg-white text-amber-700 px-2.5 py-1 rounded-full border border-amber-100 font-bold">
            <iconify-icon icon="ph:article-bold" class="text-amber-500 text-xs shrink-0"></iconify-icon>
            Paragraph structure
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
