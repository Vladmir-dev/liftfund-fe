<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  donorCount: number
}>()

const emit = defineEmits<{
  (e: 'share'): void
  (e: 'addOffline', payload: { amount: number; firstName: string; lastName: string; anonymous: boolean }): void
}>()

const showOfflineModal = ref(false)
const offlineFirstName = ref('')
const offlineLastName = ref('')
const offlineAmount = ref<number>(20)
const offlineAnonymous = ref(false)

const openOfflineModal = () => {
  offlineFirstName.value = ''
  offlineLastName.value = ''
  offlineAmount.value = 20
  offlineAnonymous.value = false
  showOfflineModal.value = true
}

const addOfflineDonation = () => {
  if (offlineAmount.value <= 0) return
  emit('addOffline', {
    amount: offlineAmount.value,
    firstName: offlineFirstName.value.trim(),
    lastName: offlineLastName.value.trim(),
    anonymous: offlineAnonymous.value
  })
  showOfflineModal.value = false
}
</script>

<template>
  <div class="flex flex-col gap-6 animate-fade-in text-left">
    <div class="flex items-center justify-between border-b border-slate-150 pb-3 mb-2">
      <h2 class="text-2xl font-bold text-slate-900">Donations</h2>
      <button @click="openOfflineModal" class="w-8 h-8 rounded-full border border-[#024731] text-[#024731] hover:bg-[#edfce0] flex items-center justify-center text-lg font-bold cursor-pointer transition-all shadow-sm focus:outline-none">
        +
      </button>
    </div>

    <!-- Empty donations callout card -->
    <div class="rounded-3xl bg-slate-100/60 border border-slate-200/50 p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative min-h-[220px] overflow-hidden">
      <div class="max-w-md">
        <h3 class="text-base md:text-lg font-extrabold text-slate-900 mb-3 leading-snug">
          Let's get to your goal, one step at a time. Connect with those who can help.
        </h3>
        <button @click="emit('share')" class="inline-flex items-center gap-2 text-xs font-bold text-slate-800 bg-white border border-slate-200 hover:bg-[#edfce0]/50 hover:border-[#024731] px-4 py-2.5 rounded-full transition-all shadow-sm shrink-0 cursor-pointer">
          <span>Share your fundraiser</span>
          <span class="w-5 h-5 rounded-full bg-[#024731] text-white flex items-center justify-center text-[10px]">➔</span>
        </button>
      </div>

      <!-- Avatars graphic -->
      <div class="relative w-48 h-48 flex items-center justify-center shrink-0">
        <div class="w-20 h-20 rounded-full bg-[#024731] text-[#02a95c] flex items-center justify-center text-3xl shadow-lg relative z-25">
          <iconify-icon icon="lucide:sunrise"></iconify-icon>
        </div>
        <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=80" class="absolute top-2 left-6 w-11 h-11 rounded-full border-2 border-white shadow z-10" />
        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80" class="absolute top-8 right-6 w-12 h-12 rounded-full border-2 border-white shadow z-10" />
        <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=80" class="absolute bottom-6 left-8 w-10 h-10 rounded-full border-2 border-white shadow z-10" />
        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=80" class="absolute bottom-4 right-10 w-11 h-11 rounded-full border-2 border-white shadow z-10" />
      </div>
    </div>

    <!-- ================= MODAL: ADD AN OFFLINE DONATION ================= -->
    <div v-if="showOfflineModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl w-full max-w-md p-6 border border-slate-100 shadow-2xl relative text-left animate-in fade-in zoom-in-95 duration-200">
        
        <button @click="showOfflineModal = false" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xl focus:outline-none cursor-pointer">
          <iconify-icon icon="ph:x-bold"></iconify-icon>
        </button>

        <h3 class="text-lg font-bold text-slate-900 mb-1">Add an offline donation</h3>
        <p class="text-slate-500 text-xs leading-relaxed mb-6 font-medium">
          Funds you receive outside of HelpFund can count towards your goal. Donations you add can't be withdrawn, so there are no fees.
        </p>

        <!-- Inputs fields -->
        <div class="flex flex-col gap-4 mb-5">
          <!-- Name grid -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">First name</label>
              <input type="text" v-model="offlineFirstName" placeholder="First name" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#024731] text-xs font-semibold" />
            </div>
            <div>
              <label class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Last name</label>
              <input type="text" v-model="offlineLastName" placeholder="Last name" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#024731] text-xs font-semibold" />
            </div>
          </div>

          <!-- Donation amount -->
          <div>
            <label class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Donation amount</label>
            <div class="relative rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-[#024731] focus-within:border-transparent transition-all">
              <span class="absolute left-3.5 top-3.5 font-bold text-xs text-slate-500">$</span>
              <input type="number" v-model="offlineAmount" class="w-full pl-8 pr-12 py-3 focus:outline-none text-xs font-bold text-slate-800" min="1" />
              <span class="absolute right-3.5 top-3.5 text-[10px] text-slate-400 font-bold uppercase">USD</span>
            </div>
          </div>

          <!-- Anonymous check -->
          <div class="flex gap-2.5 items-start">
            <input type="checkbox" v-model="offlineAnonymous" id="anon-check" class="mt-1 cursor-pointer w-4 h-4 accent-[#024731] shrink-0 animate-fade-in" />
            <label for="anon-check" class="text-[10px] text-slate-500 font-medium leading-relaxed cursor-pointer select-none">
              Hide this donation from the public. This offline donor will show as "Anonymous" on your fundraiser.
            </label>
          </div>
        </div>

        <button @click="addOfflineDonation" :disabled="offlineAmount <= 0" class="w-full py-3 bg-[#024731] hover:bg-[#013424] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer">
          Add
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-in {
  animation: in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fadeIn 0.25s ease-out forwards;
}
</style>
