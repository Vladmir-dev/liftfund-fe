<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../../stores/auth'
import { campaignService } from '../../../services/campaign'

const router = useRouter()
const authStore = useAuthStore()

const hideAllDonations = ref(false)
const savedHideAllDonations = ref(false)
const isLoading = ref(true)
const isSaving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const fetchSettings = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const settings = await campaignService.getDonationSettings()
    hideAllDonations.value = !!settings?.hideAllDonations
    savedHideAllDonations.value = hideAllDonations.value
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to load donation settings.'
  } finally {
    isLoading.value = false
  }
}

const save = async () => {
  isSaving.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const settings = await campaignService.updateDonationSettings(hideAllDonations.value)
    hideAllDonations.value = !!settings?.hideAllDonations
    savedHideAllDonations.value = hideAllDonations.value
    successMessage.value = hideAllDonations.value
      ? 'Donations are now hidden for all campaigns. New donations will not appear publicly or count toward totals.'
      : 'Donations are visible again. Campaign-specific settings continue to apply.'
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to update donation settings.'
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  if (!authStore.isLoggedIn) {
    router.push('/login')
    return
  }
  if (!authStore.isAdmin) {
    router.push('/')
    return
  }
  fetchSettings()
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-800 font-sans">

    <!-- Top Admin Bar -->
    <header class="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-3">
          <RouterLink to="/" class="flex items-center gap-1.5">
            <iconify-icon icon="lucide:sunrise" class="text-[#02a95c] text-2xl"></iconify-icon>
            <span class="text-xl font-black text-[#024731] tracking-tight">helpfund</span>
          </RouterLink>
          <span class="text-xs bg-emerald-100 text-[#024731] px-2 py-0.5 rounded font-extrabold tracking-wider uppercase">
            Admin Portal
          </span>
        </div>

        <div class="flex items-center gap-4">
          <RouterLink to="/admin/users" class="text-sm font-semibold text-slate-600 hover:text-slate-900">
            User Accounts
          </RouterLink>
          <RouterLink to="/profile" class="text-sm font-semibold text-slate-600 hover:text-slate-900">
            My Profile
          </RouterLink>
          <button
            @click="authStore.logout(); router.push('/login')"
            class="text-sm font-semibold text-rose-600 hover:text-rose-800 cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div class="mb-8">
        <h1 class="text-2xl font-black text-slate-900">Donation Settings</h1>
        <p class="text-sm text-slate-500 mt-0.5">
          Platform-wide controls that apply to every campaign at once.
        </p>
      </div>

      <div v-if="successMessage" class="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-[#024731] text-sm font-semibold flex items-center justify-between">
        <span>{{ successMessage }}</span>
        <button @click="successMessage = ''" class="text-slate-400 hover:text-slate-700">✕</button>
      </div>

      <div v-if="errorMessage" class="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold flex items-center justify-between">
        <span>{{ errorMessage }}</span>
        <button @click="errorMessage = ''" class="text-slate-400 hover:text-slate-700">✕</button>
      </div>

      <div v-if="isLoading" class="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
        <span class="h-8 w-8 border-3 border-[#024731] border-t-transparent rounded-full animate-spin inline-block mb-3"></span>
        <p class="text-sm font-bold text-slate-600">Loading donation settings...</p>
      </div>

      <div v-else class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-6 border-b border-slate-100 flex items-start justify-between gap-4">
          <div class="flex items-start gap-3">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              :class="hideAllDonations ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-[#024731]'"
            >
              <iconify-icon :icon="hideAllDonations ? 'ph:eye-slash-bold' : 'ph:eye-bold'" class="text-xl"></iconify-icon>
            </div>
            <div>
              <h2 class="text-base font-black text-slate-900">Hide donations for all campaigns</h2>
              <p class="text-sm text-slate-500 mt-0.5">
                One switch for the whole platform. It combines with each campaign's own
                &ldquo;Hide donations&rdquo; setting.
              </p>
            </div>
          </div>
          <span
            class="px-2.5 py-1 rounded-full text-xs font-bold shrink-0"
            :class="savedHideAllDonations ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'"
          >
            {{ savedHideAllDonations ? 'Hidden' : 'Visible' }}
          </span>
        </div>

        <div class="p-6 flex flex-col gap-5">
          <div
            class="rounded-2xl border p-4 flex items-start justify-between gap-4 transition"
            :class="hideAllDonations ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'"
          >
            <div>
              <div class="flex items-center gap-1.5">
                <iconify-icon icon="ph:eye-slash-bold" class="text-sm"
                  :class="hideAllDonations ? 'text-amber-700' : 'text-slate-500'"></iconify-icon>
                <span class="text-sm font-black text-slate-900">
                  Hide all donations ({{ hideAllDonations ? 'on' : 'off' }})
                </span>
              </div>
              <p class="text-xs text-slate-500 font-medium leading-relaxed mt-1.5">
                When on, <strong>new</strong> donations to every campaign are hidden from public lists and
                excluded from raised totals. Payments keep working normally.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              :aria-checked="hideAllDonations"
              @click="hideAllDonations = !hideAllDonations"
              class="relative w-12 h-6 rounded-full shrink-0 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#024731]/30"
              :class="hideAllDonations ? 'bg-amber-500' : 'bg-slate-300'"
            >
              <span
                class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
                :class="hideAllDonations ? 'translate-x-6' : 'translate-x-0'"
              ></span>
            </button>
          </div>

          <div class="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-600 font-medium leading-relaxed">
            <p class="font-black text-slate-800 mb-1.5">What this does and does not do</p>
            <ul class="list-disc pl-4 space-y-1">
              <li>Applies the hide to donations created <strong>while the switch is on</strong>, across all campaigns.</li>
              <li>Does <strong>not</strong> reveal or retroactively hide donations that already exist.</li>
              <li>Does <strong>not</strong> change any campaign's own &ldquo;Hide donations&rdquo; setting.</li>
              <li>Donations made while hidden stay hidden permanently, even after you turn this off.</li>
            </ul>
          </div>

          <div class="flex items-center justify-end gap-3">
            <button
              type="button"
              @click="fetchSettings"
              :disabled="isSaving"
              class="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 text-sm font-bold cursor-pointer disabled:opacity-50"
            >
              Reset
            </button>
            <button
              type="button"
              @click="save"
              :disabled="isSaving || hideAllDonations === savedHideAllDonations"
              class="px-5 py-2 bg-[#024731] hover:bg-[#013424] text-white rounded-xl text-sm font-bold shadow-md cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {{ isSaving ? 'Saving...' : 'Save settings' }}
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
