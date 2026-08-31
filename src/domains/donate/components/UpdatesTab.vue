<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'postUpdate', text: string): void
}>()

const showAddUpdateInput = ref(false)
const updateText = ref('')
const updatesList = ref<Array<{ text: string; date: string }>>([])

const postUpdate = () => {
  if (!updateText.value.trim()) return
  const text = updateText.value.trim()
  updatesList.value.unshift({
    text,
    date: 'Just now'
  })
  emit('postUpdate', text)
  updateText.value = ''
  showAddUpdateInput.value = false
}
</script>

<template>
  <div class="flex flex-col gap-6 animate-fade-in text-left">
    <div class="border-b border-slate-150 pb-3 mb-2">
      <h2 class="text-2xl font-bold text-slate-900">Update</h2>
    </div>

    <!-- Add update card -->
    <div class="rounded-3xl bg-slate-100/60 border border-slate-200/50 p-6 flex flex-col gap-5">
      <p class="text-xs text-slate-650 font-semibold leading-relaxed">
        <span class="text-[#024731] font-black block text-sm mb-1.5">Send fundraiser updates to your donors.</span>
        Successful fundraisers send updates to encourage donations and keep the momentum going.
      </p>

      <div v-if="showAddUpdateInput" class="flex flex-col gap-3 animate-fade-in">
        <textarea v-model="updateText" placeholder="Write an update for your donors (e.g. We reached our first milestone!)..." class="w-full h-32 p-4 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#024731] rounded-xl text-xs font-medium resize-none"></textarea>
        <div class="flex justify-end gap-2.5">
          <button @click="showAddUpdateInput = false" class="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-lg cursor-pointer">Cancel</button>
          <button @click="postUpdate" :disabled="!updateText.trim()" class="px-4 py-2 bg-[#024731] hover:bg-[#013424] disabled:opacity-50 text-white font-bold text-xs rounded-lg cursor-pointer">Post update</button>
        </div>
      </div>

      <button v-else @click="showAddUpdateInput = true" class="inline-flex items-center gap-1.5 self-start bg-[#024731] hover:bg-[#013424] text-white font-extrabold text-xs px-5 py-3 rounded-full transition-all shadow-md cursor-pointer focus:outline-none font-sans">
        <span class="text-sm font-bold">+</span>
        <span>Add update</span>
      </button>
    </div>

    <!-- Updates posted list -->
    <div v-if="updatesList.length > 0" class="flex flex-col gap-4 mt-4">
      <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Posted Updates</h4>
      <div v-for="(upd, idx) in updatesList" :key="idx" class="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
        <span class="text-[10px] text-slate-400 font-bold block mb-2">{{ upd.date }}</span>
        <p class="text-xs text-slate-650 font-medium leading-relaxed">{{ upd.text }}</p>
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
