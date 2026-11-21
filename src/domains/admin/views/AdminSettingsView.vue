<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../../stores/auth'
import {
  campaignService,
  type BackendCampaign,
  type DonationSettings,
  type HiddenDonation,
} from '../../../services/campaign'

const router = useRouter()
const authStore = useAuthStore()

const hideAllDonations = ref(false)
const savedHideAllDonations = ref(false)

const redirectEnabled = ref(false)
const savedRedirectEnabled = ref(false)
const redirectCampaignId = ref('')
const savedRedirectCampaignId = ref('')
const campaigns = ref<BackendCampaign[]>([])
const hiddenDonations = ref<HiddenDonation[]>([])

const isLoading = ref(true)
const isSavingHide = ref(false)
const isSavingRouting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const applySettings = (settings: DonationSettings) => {
  hideAllDonations.value = !!settings.hideAllDonations
  savedHideAllDonations.value = hideAllDonations.value

  redirectEnabled.value = !!settings.redirectDonationsEnabled
  savedRedirectEnabled.value = redirectEnabled.value
  redirectCampaignId.value = settings.redirectCampaignId || ''
  savedRedirectCampaignId.value = redirectCampaignId.value
}

const fetchSettings = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const [settings, campaignRes, hidden] = await Promise.all([
      campaignService.getDonationSettings(),
      campaignService.listPublicCampaigns(1, 100),
      campaignService.listHiddenDonations(),
    ])
    applySettings(settings)
    campaigns.value = campaignRes?.campaigns || []
    hiddenDonations.value = hidden || []
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to load donation settings.'
  } finally {
    isLoading.value = false
  }
}

const saveHide = async () => {
  isSavingHide.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const settings = await campaignService.updateDonationSettings({
      hideAllDonations: hideAllDonations.value,
    })
    applySettings(settings)
    successMessage.value = hideAllDonations.value
      ? 'Donations are now hidden for all campaigns. New donations will not appear publicly or count toward totals.'
      : 'Donations are visible again. Campaign-specific settings continue to apply.'
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to update donation settings.'
  } finally {
    isSavingHide.value = false
  }
}

const saveRouting = async () => {
  if (redirectEnabled.value && !redirectCampaignId.value) {
    errorMessage.value = 'Choose the campaign that should receive the tally.'
    return
  }
  isSavingRouting.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const settings = await campaignService.updateDonationSettings({
      redirectDonationsEnabled: redirectEnabled.value,
      redirectCampaignId: redirectEnabled.value ? redirectCampaignId.value : null,
    })
    applySettings(settings)
    hiddenDonations.value = await campaignService.listHiddenDonations()
    const target = campaigns.value.find((c) => c.id === redirectCampaignId.value)
    successMessage.value = redirectEnabled.value
      ? `New donations are now hidden publicly and tallied onto "${target?.title || 'the selected campaign'}". Payments still settle to the campaign the donor chose.`
      : 'Donation routing is off. New donations return to their own campaigns.'
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to update donation routing.'
  } finally {
    isSavingRouting.value = false
  }
}

const campaignTitle = (id?: string | null) => {
  if (!id) return '—'
  return campaigns.value.find((c) => c.id === id)?.title || id.slice(0, 8)
}

const formatAmount = (value?: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0))

const formatDate = (value?: string) => {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString()
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

    <main class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
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

      <div v-else class="flex flex-col gap-6">

        <!-- Routing / tally setting -->
        <section class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-6 border-b border-slate-100 flex items-start justify-between gap-4">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                :class="redirectEnabled ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'">
                <iconify-icon icon="ph:arrows-left-right-bold" class="text-xl"></iconify-icon>
              </div>
              <div>
                <h2 class="text-base font-black text-slate-900">Tally donations onto a chosen campaign</h2>
                <p class="text-sm text-slate-500 mt-0.5">
                  Hide new donations from the public and count them toward one campaign you select.
                </p>
              </div>
            </div>
            <span class="px-2.5 py-1 rounded-full text-xs font-bold shrink-0"
              :class="savedRedirectEnabled ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'">
              {{ savedRedirectEnabled ? 'Active' : 'Off' }}
            </span>
          </div>

          <div class="p-6 flex flex-col gap-5">
            <div class="rounded-2xl border p-4 flex items-start justify-between gap-4 transition"
              :class="redirectEnabled ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'">
              <div>
                <div class="flex items-center gap-1.5">
                  <span class="text-sm font-black text-slate-900">
                    Route new donations ({{ redirectEnabled ? 'on' : 'off' }})
                  </span>
                </div>
                <p class="text-xs text-slate-500 font-medium leading-relaxed mt-1.5">
                  While on, <strong>new</strong> donations to every campaign are hidden from public feeds and
                  added to the selected campaign's raised total and donor count.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                :aria-checked="redirectEnabled"
                @click="redirectEnabled = !redirectEnabled"
                class="relative w-12 h-6 rounded-full shrink-0 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                :class="redirectEnabled ? 'bg-blue-600' : 'bg-slate-300'">
                <span class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
                  :class="redirectEnabled ? 'translate-x-6' : 'translate-x-0'"></span>
              </button>
            </div>

            <div class="flex flex-col gap-2">
              <label for="redirect-campaign" class="text-xs font-black text-slate-900 uppercase tracking-wider">
                Campaign to receive the tally
              </label>
              <select
                id="redirect-campaign"
                v-model="redirectCampaignId"
                :disabled="!redirectEnabled"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer disabled:cursor-not-allowed">
                <option value="">Select a campaign...</option>
                <option v-for="c in campaigns" :key="c.id" :value="c.id">
                  {{ c.title }}
                </option>
              </select>
              <p class="text-[11px] text-slate-400 font-medium">
                Only donations created while this is active are affected. Changing the campaign applies to new donations only.
              </p>
            </div>

            <div class="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-600 font-medium leading-relaxed">
              <p class="font-black text-slate-800 mb-1.5">Important</p>
              <ul class="list-disc pl-4 space-y-1">
                <li>This changes the <strong>displayed tally only</strong>. The money still settles to the campaign the donor selected.</li>
                <li>Donations are hidden from the public, but visible to you, the original campaign owner, and the chosen campaign.</li>
                <li>Donations made directly to the chosen campaign count once — they are not added twice.</li>
                <li>Turning routing off does not move donations that were already created while it was on.</li>
                <li>This setting overrides the global hide-all switch below.</li>
              </ul>
            </div>

            <div class="flex items-center justify-end gap-3">
              <button type="button" @click="fetchSettings" :disabled="isSavingRouting"
                class="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 text-sm font-bold cursor-pointer disabled:opacity-50">
                Reset
              </button>
              <button type="button" @click="saveRouting"
                :disabled="isSavingRouting || (redirectEnabled === savedRedirectEnabled && redirectCampaignId === savedRedirectCampaignId)"
                class="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-sm font-bold shadow-md cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                {{ isSavingRouting ? 'Saving...' : 'Save routing' }}
              </button>
            </div>
          </div>
        </section>

        <!-- Legacy global hide -->
        <section class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-6 border-b border-slate-100 flex items-start justify-between gap-4">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                :class="hideAllDonations ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-[#024731]'">
                <iconify-icon :icon="hideAllDonations ? 'ph:eye-slash-bold' : 'ph:eye-bold'" class="text-xl"></iconify-icon>
              </div>
              <div>
                <h2 class="text-base font-black text-slate-900">Hide donations for all campaigns</h2>
                <p class="text-sm text-slate-500 mt-0.5">
                  Legacy switch. Routing above takes precedence while it is active.
                </p>
              </div>
            </div>
            <span class="px-2.5 py-1 rounded-full text-xs font-bold shrink-0"
              :class="savedHideAllDonations ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'">
              {{ savedHideAllDonations ? 'Hidden' : 'Visible' }}
            </span>
          </div>

          <div class="p-6 flex items-center justify-between gap-4">
            <p class="text-xs text-slate-500 font-medium leading-relaxed max-w-xl">
              When on, new donations to every campaign are hidden publicly and excluded from raised totals.
              Donations made while hidden stay hidden permanently.
            </p>
            <div class="flex items-center gap-3 shrink-0">
              <button type="button" role="switch" :aria-checked="hideAllDonations"
                @click="hideAllDonations = !hideAllDonations"
                class="relative w-12 h-6 rounded-full transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#024731]/30"
                :class="hideAllDonations ? 'bg-amber-500' : 'bg-slate-300'">
                <span class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
                  :class="hideAllDonations ? 'translate-x-6' : 'translate-x-0'"></span>
              </button>
              <button type="button" @click="saveHide"
                :disabled="isSavingHide || hideAllDonations === savedHideAllDonations"
                class="px-4 py-2 bg-[#024731] hover:bg-[#013424] text-white rounded-xl text-sm font-bold shadow-md cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                {{ isSavingHide ? 'Saving...' : 'Save' }}
              </button>
            </div>
          </div>
        </section>

        <!-- Hidden donations admin view -->
        <section class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-6 border-b border-slate-100">
            <h2 class="text-base font-black text-slate-900">Hidden donations ({{ hiddenDonations.length }})</h2>
            <p class="text-sm text-slate-500 mt-0.5">
              Donations excluded from public feeds. Visible to admins and the relevant campaign owners.
            </p>
          </div>
          <div v-if="hiddenDonations.length === 0" class="p-10 text-center text-sm text-slate-400 font-semibold">
            No hidden donations yet.
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">
                <tr>
                  <th class="py-3 px-6">Date</th>
                  <th class="py-3 px-6">Amount</th>
                  <th class="py-3 px-6">Original campaign</th>
                  <th class="py-3 px-6">Tallied to</th>
                  <th class="py-3 px-6">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
                <tr v-for="d in hiddenDonations" :key="d.id">
                  <td class="py-3 px-6 text-xs">{{ formatDate(d.createdAt) }}</td>
                  <td class="py-3 px-6 font-black">{{ formatAmount(d.amount) }}</td>
                  <td class="py-3 px-6 text-xs">{{ d.campaignTitle || campaignTitle(d.campaignId) }}</td>
                  <td class="py-3 px-6 text-xs text-blue-700 font-bold">
                    {{ d.redirectCampaignTitle || campaignTitle(d.redirectCampaignId) || '—' }}
                  </td>
                  <td class="py-3 px-6 text-xs capitalize">{{ d.paymentStatus }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>
