<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  targetAmount: number
  useAutomatedGoal: boolean
  startingGoal: number
  amountValid: boolean
}>()

const emit = defineEmits<{
  (e: 'update:targetAmount', val: number): void
  (e: 'update:useAutomatedGoal', val: boolean): void
}>()

const localTargetAmount = computed({
  get: () => props.targetAmount,
  set: (val) => emit('update:targetAmount', val)
})
</script>

<template>
  <div class="text-left animate-fade-in">
    <!-- Input field container -->
    <div class="mb-6">
      <div class="relative rounded-2xl border bg-white px-4 py-3 transition-all" :class="!amountValid ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 focus-within:ring-2 focus-within:ring-[#024731] focus-within:border-transparent'">
        <label class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Enter amount</label>
        <div class="flex items-center">
          <span class="text-xl font-bold text-slate-400 mr-2">$</span>
          <input type="number" v-model="localTargetAmount" class="w-full focus:outline-none text-2xl font-black text-slate-800 bg-transparent" />
          <span class="text-xs text-slate-500 font-bold bg-slate-100 border border-slate-200/50 px-3 py-1.5 rounded-lg shrink-0">USD</span>
        </div>
      </div>
      
      <!-- Error message if validation fails -->
      <div v-if="!amountValid" class="text-red-500 text-xs flex items-center gap-1.5 mt-2 animate-fade-in">
        <iconify-icon icon="fa6-solid:triangle-exclamation" class="text-sm"></iconify-icon>
        <span>Please make sure your goal is more than 1.</span>
      </div>

      <p class="text-[11px] text-slate-400 mt-2 font-medium">Fundraisers like yours typically aim to raise $12,000 or more.</p>
    </div>

    <!-- Automated goal switch box -->
    <div class="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-left mb-6">
      <div class="flex items-start justify-between">
        <div>
          <span class="inline-block bg-[#edfce0] text-[#024731] text-[9px] font-black px-2 py-0.5 rounded-full mb-1 uppercase tracking-wider border border-[#bbf770]">
            Recommended
          </span>
          <h4 class="text-sm font-bold text-slate-900 mb-0.5">Automated goal setting</h4>
          <p class="text-xs text-slate-500 leading-relaxed max-w-md">
            We'll gradually adjust your goal as donations come in to help build momentum. <a href="#" class="underline text-[#024731] font-bold">More details</a>.
          </p>
        </div>
        
        <!-- Switch toggle -->
        <button @click="emit('update:useAutomatedGoal', !useAutomatedGoal)" class="w-11 h-6 rounded-full transition-colors relative focus:outline-none shrink-0 cursor-pointer" :class="useAutomatedGoal ? 'bg-[#024731]' : 'bg-slate-300'">
          <span class="w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm" :class="useAutomatedGoal ? 'right-0.5' : 'left-0.5'"></span>
        </button>
      </div>

      <!-- Warning/Starting Goal label box -->
      <div v-if="useAutomatedGoal" class="mt-4 bg-[#fef7e0] border border-[#feebc8] rounded-xl p-3.5 flex items-center gap-2 text-xs text-[#b06000] font-semibold animate-fade-in">
        <iconify-icon icon="ph:gear-six-fill" class="text-base text-[#e0a800]"></iconify-icon>
        <span>Your starting goal would be: <strong class="text-slate-950">${{ startingGoal }}</strong></span>
      </div>
    </div>
  </div>
</template>
