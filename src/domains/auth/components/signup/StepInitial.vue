<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  country: string
  zipCode: string
  selectedCategory: string | null
  categories: string[]
}>()

const emit = defineEmits<{
  (e: 'update:country', val: string): void
  (e: 'update:zipCode', val: string): void
  (e: 'selectCategory', val: string): void
}>()

const localCountry = computed({
  get: () => props.country,
  set: (val) => emit('update:country', val)
})

const localZipCode = computed({
  get: () => props.zipCode,
  set: (val) => emit('update:zipCode', val)
})
</script>

<template>
  <div>
    <div class="mb-10 text-left animate-fade-in">
      <h3 class="text-base font-bold text-slate-900 mb-1">Where will the funds go?</h3>
      <p class="text-slate-400 text-xs mb-4">Choose the location where you plan to withdraw your funds. <a href="#" class="text-slate-500 underline font-medium hover:text-slate-800">Countries we support</a>.</p>
      
      <div class="grid grid-cols-1 sm:grid-cols-12 gap-4">
        <div class="sm:col-span-8 flex flex-col">
          <label class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Country</label>
          <div class="relative">
            <select v-model="localCountry" class="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm appearance-none cursor-pointer pr-10 font-medium">
              <option>United States</option>
              <option>Canada</option>
              <option>United Kingdom</option>
              <option>Australia</option>
              <option>Germany</option>
              <option>France</option>
            </select>
            <iconify-icon icon="fa6-solid:chevron-down" class="absolute right-3.5 top-4 pointer-events-none text-slate-400 text-xs"></iconify-icon>
          </div>
        </div>

        <div class="sm:col-span-4 flex flex-col">
          <label class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Zip code</label>
          <input type="text" v-model="localZipCode" placeholder="Zip code" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm font-semibold" />
        </div>
      </div>
    </div>

    <div class="mb-6 text-left">
      <h3 class="text-base font-bold text-slate-900 mb-1">What best describes why you're fundraising?</h3>
      <p class="text-slate-400 text-xs mb-4">Select the primary category for your campaign to help donors find you.</p>

      <div class="flex flex-wrap gap-2.5">
        <button v-for="cat in categories" :key="cat" @click="emit('selectCategory', cat)" class="px-4 py-2 border rounded-full text-xs font-bold transition-all" :class="selectedCategory === cat ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100' : 'bg-white border-slate-200 hover:border-slate-400 text-slate-700'">
          {{ cat }}
        </button>
      </div>
    </div>
  </div>
</template>
