<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title: string
}>()

const emit = defineEmits<{
  (e: 'update:title', val: string): void
}>()

const localTitle = computed({
  get: () => props.title,
  set: (val) => emit('update:title', val)
})
</script>

<template>
  <div class="text-left animate-fade-in">
    <div class="mb-4">
      <div class="relative rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
        <input type="text" v-model="localTitle" placeholder="Donate to help..." maxlength="60" class="w-full px-4 py-4 pr-12 focus:outline-none font-bold text-slate-800 text-base" />
        <span class="absolute right-4 top-4.5 text-xs text-slate-400 font-bold">
          {{ 60 - title.length }}
        </span>
      </div>
    </div>
  </div>
</template>
