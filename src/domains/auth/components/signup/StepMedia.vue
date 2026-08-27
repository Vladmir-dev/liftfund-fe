<script setup lang="ts">
defineProps<{
  mediaUrl: string | null
}>()

const emit = defineEmits<{
  (e: 'triggerUpload'): void
  (e: 'openEditMediaModal'): void
  (e: 'removeMedia'): void
}>()
</script>

<template>
  <div class="text-left animate-fade-in">
    <h2 class="text-xl font-bold text-slate-900 mb-1">Add a cover photo or video</h2>
    <p class="text-slate-400 text-xs mb-6">Cover media helps tell your story. If you find a better photo later, you can always change it.</p>

    <!-- Upload Dropzone -->
    <div v-if="!mediaUrl" @click="emit('triggerUpload')" class="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl transition-all cursor-pointer bg-slate-50/20 hover:bg-slate-50/50 p-12 text-center flex flex-col items-center justify-center gap-3">
      <div class="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl text-slate-400">
        <iconify-icon icon="ph:image-square-bold"></iconify-icon>
      </div>
      <span class="text-sm font-semibold text-slate-600">Upload a photo or video</span>
      <span class="text-[10px] text-slate-400">Drag and drop or click to browse files</span>
    </div>

    <!-- Preview & Action Container -->
    <div v-else class="relative rounded-2xl border border-slate-200 overflow-hidden bg-slate-50">
      <img :src="mediaUrl" class="w-full aspect-video object-cover cursor-pointer" @click="emit('openEditMediaModal')" />
      <div class="absolute inset-0 bg-slate-900/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3 pointer-events-none">
        <button @click.stop="emit('openEditMediaModal')" class="bg-white hover:bg-slate-100 text-slate-800 px-4 py-2 rounded-full text-xs font-bold pointer-events-auto flex items-center gap-1.5 shadow-md">
          <iconify-icon icon="ph:pencil-simple-bold"></iconify-icon>
          <span>Edit Media</span>
        </button>
        <button @click.stop="emit('removeMedia')" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-xs font-bold pointer-events-auto flex items-center gap-1.5 shadow-md">
          <iconify-icon icon="ph:trash-bold"></iconify-icon>
          <span>Delete</span>
        </button>
      </div>
    </div>
  </div>
</template>
