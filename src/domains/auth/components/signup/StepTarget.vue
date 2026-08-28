<script setup lang="ts">
defineProps<{
  beneficiary: 'Yourself' | 'Someone else' | 'Charity'
}>()

const emit = defineEmits<{
  (e: 'update:beneficiary', val: 'Yourself' | 'Someone else' | 'Charity'): void
}>()
</script>

<template>
  <div class="text-left animate-fade-in">
    <h2 class="text-2xl font-bold text-slate-900 mb-6">Who are you fundraising for?</h2>

    <div class="flex flex-col gap-4">
      <!-- Yourself card -->
      <div @click="emit('update:beneficiary', 'Yourself')" class="border rounded-2xl p-5 flex items-start gap-4 cursor-pointer transition-all hover:bg-slate-50/50" :class="beneficiary === 'Yourself' ? 'border-blue-600 ring-2 ring-blue-500/10 bg-blue-50/10' : 'border-slate-200'">
        <div class="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 text-3xl transition-colors" :class="beneficiary === 'Yourself' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-500 border border-slate-100'">
          <iconify-icon icon="ph:hand-heart-bold"></iconify-icon>
        </div>
        <div>
          <h4 class="text-sm font-bold text-slate-800 mb-0.5">Yourself</h4>
          <p class="text-xs text-slate-500">Funds are delivered to your bank account for your own use</p>
        </div>
      </div>

      <!-- Someone else card -->
      <div @click="emit('update:beneficiary', 'Someone else')" class="border rounded-2xl p-5 flex items-start gap-4 cursor-pointer transition-all hover:bg-slate-50/50" :class="beneficiary === 'Someone else' ? 'border-blue-600 ring-2 ring-blue-500/10 bg-blue-50/10' : 'border-slate-200'">
        <div class="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 text-3xl transition-colors" :class="beneficiary === 'Someone else' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-500 border border-slate-100'">
          <iconify-icon icon="ph:users-three-bold"></iconify-icon>
        </div>
        <div>
          <h4 class="text-sm font-bold text-slate-800 mb-0.5">Someone else</h4>
          <p class="text-xs text-slate-500">You'll invite a beneficiary to receive funds or distribute them yourself</p>
        </div>
      </div>

      <!-- Charity card -->
      <div @click="emit('update:beneficiary', 'Charity')" class="border rounded-2xl p-5 flex items-start gap-4 cursor-pointer transition-all hover:bg-slate-50/50" :class="beneficiary === 'Charity' ? 'border-blue-600 ring-2 ring-blue-500/10 bg-blue-50/10' : 'border-slate-200'">
        <div class="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 text-3xl transition-colors" :class="beneficiary === 'Charity' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-500 border border-slate-100'">
          <iconify-icon icon="lucide:ribbon"></iconify-icon>
        </div>
        <div>
          <h4 class="text-sm font-bold text-slate-800 mb-0.5">Charity</h4>
          <p class="text-xs text-slate-500">Funds are delivered to your chosen nonprofit for you</p>
        </div>
      </div>
    </div>
  </div>
</template>
