<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../../stores/auth'
import { campaignService, type SavedPaymentMethod } from '../../../services/campaign'
import { Notify } from '../../../utils/notify'
import NavHeader from '../../landing/components/NavHeader.vue'
import MainFooter from '../../landing/components/MainFooter.vue'

const authStore = useAuthStore()

const navHeaderRef = ref<any>(null)
const closeDropdowns = () => {
  navHeaderRef.value?.closeDropdowns()
}

const activeSettingsTab = ref<'account' | 'notifications' | 'payment-methods'>('account')

// Payment Methods logic
const savedPaymentMethods = ref<SavedPaymentMethod[]>([])
const isLoadingPaymentMethods = ref(false)
const showAddPaymentModal = ref(false)
const methodToDelete = ref<SavedPaymentMethod | null>(null)
const isDeletingMethod = ref(false)

const newProvider = ref<'card' | 'mobilemoney'>('card')
const newBrand = ref('Visa')
const newLast4 = ref('')
const newEmail = ref('')
const newIsDefault = ref(false)
const isAddingMethod = ref(false)
const addMethodError = ref('')

const fetchPaymentMethods = async () => {
  isLoadingPaymentMethods.value = true
  try {
    const methods = await campaignService.listPaymentMethods()
    savedPaymentMethods.value = methods
  } catch (err) {
    console.warn('Failed to load payment methods:', err)
  } finally {
    isLoadingPaymentMethods.value = false
  }
}

const handleSetDefault = async (pm: SavedPaymentMethod) => {
  try {
    await campaignService.setDefaultPaymentMethod(pm.id)
    savedPaymentMethods.value = savedPaymentMethods.value.map((m) => ({
      ...m,
      isDefault: m.id === pm.id,
    }))
    Notify.success('Default payment method updated.')
  } catch (err: any) {
    Notify.failure(err.message || 'Failed to set default payment method')
  }
}

const promptDeleteMethod = (pm: SavedPaymentMethod) => {
  methodToDelete.value = pm
}

const confirmDeleteMethod = async () => {
  if (!methodToDelete.value) return
  isDeletingMethod.value = true
  try {
    await campaignService.deletePaymentMethod(methodToDelete.value.id)
    savedPaymentMethods.value = savedPaymentMethods.value.filter(
      (m) => m.id !== methodToDelete.value!.id
    )
    Notify.success('Payment method removed.')
    methodToDelete.value = null
  } catch (err: any) {
    Notify.failure(err.message || 'Failed to delete payment method')
  } finally {
    isDeletingMethod.value = false
  }
}

const handleAddPaymentMethod = async () => {
  if (!newLast4.value.trim()) {
    addMethodError.value = 'Please provide the last 4 digits.'
    return
  }
  isAddingMethod.value = true
  addMethodError.value = ''
  try {
    await campaignService.addPaymentMethod({
      provider: newProvider.value,
      cardBrand: newBrand.value,
      last4: newLast4.value.trim(),
      email: newEmail.value.trim() || authStore.user?.email || '',
      isDefault: newIsDefault.value,
    })
    Notify.success('Payment method saved!')
    showAddPaymentModal.value = false
    newLast4.value = ''
    await fetchPaymentMethods()
  } catch (err: any) {
    addMethodError.value = err.message || 'Failed to save payment method'
    Notify.failure(addMethodError.value)
  } finally {
    isAddingMethod.value = false
  }
}

// Editing Name logic
const isEditingName = ref(false)
const inputName = ref(authStore.user?.name || '')
const isSavingName = ref(false)

const saveName = async () => {
  if (inputName.value.trim() && authStore.user) {
    isSavingName.value = true
    try {
      await authStore.saveProfile({ displayName: inputName.value.trim() })
      isEditingName.value = false
    } catch (err) {
      console.warn('Failed to save name:', err)
    } finally {
      isSavingName.value = false
    }
  }
}

// Editing Birthday logic
const isEditingBirthday = ref(false)
const birthdayVal = ref(authStore.user?.dateOfBirth || '')
const isSavingBirthday = ref(false)

const saveBirthday = async () => {
  isSavingBirthday.value = true
  try {
    if (birthdayVal.value) {
      await authStore.saveProfile({ dateOfBirth: birthdayVal.value })
    }
    isEditingBirthday.value = false
  } catch (err) {
    console.warn('Failed to save birthday:', err)
  } finally {
    isSavingBirthday.value = false
  }
}

// Editing Phone logic
const isEditingPhone = ref(false)
const phoneVal = ref(authStore.user?.phone || '')

const savePhone = () => {
  isEditingPhone.value = false
}

onMounted(async () => {
  await authStore.fetchProfile()
  if (authStore.user) {
    inputName.value = authStore.user.name || ''
    birthdayVal.value = authStore.user.dateOfBirth || ''
    phoneVal.value = authStore.user.phone || ''
  }
  fetchPaymentMethods()
})

// Simulated notification switches (Screenshot 3 notifications tab)
const messageNotif = ref(false)
const tipsNotif = ref(true)
const urgentNotif = ref(true)
const moreWaysNotif = ref(true)
const updatesNotif = ref(true)
const researchNotif = ref(true)

const unsubscribeAll = () => {
  messageNotif.value = false
  tipsNotif.value = false
  urgentNotif.value = false
  moreWaysNotif.value = false
  updatesNotif.value = false
  researchNotif.value = false
}
</script>

<template>
  <div class="min-h-screen bg-slate-50/50 text-slate-800 font-sans text-left animate-fade-in" @click="closeDropdowns">
    <NavHeader ref="navHeaderRef" />

    <main class="max-w-3xl mx-auto px-4 py-12">
      <!-- Title -->
      <h1 class="text-3xl font-black text-slate-900 mb-6">Settings</h1>

      <!-- Tabs header -->
      <div class="flex items-center gap-2 border-b border-slate-100 pb-3 mb-8 text-xs sm:text-sm font-bold">
        <button @click="activeSettingsTab = 'account'" class="px-5 py-2.5 rounded-full transition-all cursor-pointer"
          :class="activeSettingsTab === 'account' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800'">
          Account
        </button>
        <button @click="activeSettingsTab = 'notifications'" class="px-5 py-2.5 rounded-full transition-all cursor-pointer"
          :class="activeSettingsTab === 'notifications' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800'">
          Notifications
        </button>
        <button @click="activeSettingsTab = 'payment-methods'" class="px-5 py-2.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5"
          :class="activeSettingsTab === 'payment-methods' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800'">
          <iconify-icon icon="ph:credit-card-bold"></iconify-icon>
          <span>Payment Methods</span>
        </button>
      </div>

      <!-- Account Settings Content (Screenshot 3) -->
      <div v-if="activeSettingsTab === 'account'" class="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm flex flex-col gap-8">
        
        <!-- Profile photo picker -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-50">
          <div>
            <h3 class="font-extrabold text-slate-900 text-sm mb-1.5">Profile photo</h3>
            <div class="w-20 h-20 rounded-full overflow-hidden bg-slate-100 border border-slate-200 mt-2">
              <img v-if="authStore.user.avatar" :src="authStore.user.avatar" class="w-full h-full object-cover" alt="User avatar" />
              <div v-else class="w-full h-full flex items-center justify-center font-bold text-slate-400 bg-slate-200">
                JD
              </div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <button class="px-4 py-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 font-bold text-xs rounded-xl transition-all text-slate-700 cursor-pointer">
              Change
            </button>
            <button @click="authStore.user.avatar = ''" class="px-4 py-2 border border-red-100 hover:bg-red-50 text-red-600 font-bold text-xs rounded-xl transition-all cursor-pointer">
              Remove
            </button>
          </div>
        </div>

        <!-- Name Field -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-50">
          <div class="flex-1">
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Name</span>
            <div v-if="isEditingName" class="flex gap-2 max-w-sm mt-1.5">
              <input type="text" v-model="inputName" class="px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#024731] flex-1 font-semibold" />
              <button @click="saveName" class="px-3 py-1.5 bg-[#024731] hover:bg-[#013424] text-white font-bold text-xs rounded-lg cursor-pointer transition-all">Save</button>
              <button @click="isEditingName = false" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-lg cursor-pointer">Cancel</button>
            </div>
            <span v-else class="text-sm font-bold text-slate-800 leading-snug">{{ authStore.user.name }}</span>
          </div>
          <button v-if="!isEditingName" @click="isEditingName = true" class="px-4 py-2 border border-slate-200 hover:border-[#024731] hover:bg-slate-50 font-bold text-xs rounded-xl transition-all text-slate-700 cursor-pointer">
            Edit
          </button>
        </div>

        <!-- Phone Field -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-50">
          <div class="flex-1">
            <div class="flex items-center gap-1">
              <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Verification phone number</span>
              <iconify-icon icon="lucide:info" class="text-slate-400 text-xs"></iconify-icon>
            </div>
            <div v-if="isEditingPhone" class="flex gap-2 max-w-sm mt-1.5">
              <input type="text" v-model="phoneVal" placeholder="+1 (555) 000-0000" class="px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#024731] flex-1 font-semibold" />
              <button @click="savePhone" class="px-3 py-1.5 bg-[#024731] hover:bg-[#013424] text-white font-bold text-xs rounded-lg cursor-pointer transition-all">Save</button>
              <button @click="isEditingPhone = false" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-lg cursor-pointer">Cancel</button>
            </div>
            <span v-else class="text-sm font-bold text-slate-800 leading-snug">{{ phoneVal || 'No phone number' }}</span>
          </div>
          <button v-if="!isEditingPhone" @click="isEditingPhone = true" class="px-4 py-2 border border-slate-200 hover:border-[#024731] hover:bg-slate-50 font-bold text-xs rounded-xl transition-all text-slate-700 cursor-pointer">
            {{ phoneVal ? 'Edit' : 'Add' }}
          </button>
        </div>

        <!-- App Permissions -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-50">
          <div class="flex-1">
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Connected app permissions</span>
            <span class="text-sm font-semibold text-slate-400">No connected apps yet</span>
          </div>
          <button class="p-2 text-slate-300 hover:text-slate-500 cursor-pointer">
            <iconify-icon icon="lucide:info" class="text-lg"></iconify-icon>
          </button>
        </div>

        <!-- Email Field -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-50">
          <div class="flex-1">
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Email address</span>
            <span class="text-sm font-bold text-slate-800 leading-snug">{{ authStore.user.email }}</span>
          </div>
          <button class="p-2 text-slate-300 hover:text-slate-500 cursor-pointer">
            <iconify-icon icon="lucide:info" class="text-lg"></iconify-icon>
          </button>
        </div>

        <!-- Birthday -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-50">
          <div class="flex-1">
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Birthday</span>
            <div v-if="isEditingBirthday" class="flex gap-2 max-w-sm mt-1.5">
              <input type="date" v-model="birthdayVal" class="px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#024731] flex-1 font-semibold" />
              <button @click="saveBirthday" class="px-3 py-1.5 bg-[#024731] hover:bg-[#013424] text-white font-bold text-xs rounded-lg cursor-pointer transition-all">Save</button>
              <button @click="isEditingBirthday = false" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-lg cursor-pointer">Cancel</button>
            </div>
            <span v-else class="text-sm font-bold text-slate-800 leading-snug">{{ birthdayVal || 'Add your birthday' }}</span>
          </div>
          <button v-if="!isEditingBirthday" @click="isEditingBirthday = true" class="px-4 py-2 border border-slate-200 hover:border-[#024731] hover:bg-slate-50 font-bold text-xs rounded-xl transition-all text-slate-700 cursor-pointer">
            Edit
          </button>
        </div>

        <!-- Password -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-50">
          <div class="flex-1">
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Password</span>
            <span class="text-sm font-bold text-slate-800 leading-snug tracking-widest">••••••••••••</span>
          </div>
          <button class="p-2 text-slate-300 hover:text-slate-500 cursor-pointer">
            <iconify-icon icon="lucide:info" class="text-lg"></iconify-icon>
          </button>
        </div>

        <!-- Language -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
          <div class="flex-1">
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Preferred communications language</span>
            <span class="text-sm font-bold text-slate-800 leading-snug">English (US)</span>
          </div>
          <button class="px-4 py-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 font-bold text-xs rounded-xl transition-all text-slate-700 cursor-pointer">
            Edit
          </button>
        </div>

        <!-- Deactivate Account -->
        <button class="mt-4 w-full py-3.5 border border-red-200 hover:bg-red-50 text-red-600 font-bold text-sm rounded-xl transition-all text-center cursor-pointer">
          Deactivate account
        </button>
      </div>

      <!-- Notifications tab -->
      <div v-else class="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm flex flex-col gap-6 text-left">
        <!-- Title and Subtitle -->
        <div>
          <h2 class="text-xl font-black text-slate-900 mb-2">Never miss an update</h2>
          <p class="text-slate-500 text-xs sm:text-sm leading-relaxed">
            Your generosity is making a real difference for real people. Manage your notification preferences for each fundraiser on their individual campaign pages in the
            <RouterLink to="/your-impact" class="underline hover:text-slate-800 font-semibold">impact</RouterLink> section.
          </p>
        </div>

        <hr class="border-slate-100 my-2" />

        <!-- Message Notifications Section -->
        <div>
          <h3 class="text-base font-extrabold text-slate-900 mb-4">Message Notifications</h3>
          
          <div class="flex items-center justify-between gap-4">
            <div class="flex-1">
              <h4 class="text-xs sm:text-sm font-bold text-slate-800">User Messaging Notification by Email</h4>
              <p class="text-slate-400 text-[11px] leading-relaxed mt-0.5">Get an email when you are sent a message on HelpFund.</p>
            </div>
            <!-- Custom Toggle Switch -->
            <button @click="messageNotif = !messageNotif" :class="messageNotif ? 'bg-emerald-600' : 'bg-slate-300'" class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none">
              <span :class="messageNotif ? 'translate-x-5' : 'translate-x-0'" class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
            </button>
          </div>
        </div>

        <!-- Choose how you'd like to hear from us -->
        <div>
          <h3 class="text-base font-extrabold text-slate-900 mb-4">Choose how you'd like to hear from us</h3>
          
          <!-- Your fundraisers -->
          <div class="mb-6">
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-3">Your fundraisers</span>
            <div class="flex items-center justify-between gap-4">
              <div class="flex-1">
                <h4 class="text-xs sm:text-sm font-bold text-slate-800">Tips and updates</h4>
                <p class="text-slate-400 text-[11px] leading-relaxed mt-0.5">Coaching to help you share your cause and reach your goal.</p>
              </div>
              <button @click="tipsNotif = !tipsNotif" :class="tipsNotif ? 'bg-emerald-600' : 'bg-slate-300'" class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none">
                <span :class="tipsNotif ? 'translate-x-5' : 'translate-x-0'" class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
              </button>
            </div>
          </div>

          <!-- Your donations -->
          <div class="mb-6">
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-3">Your donations</span>
            
            <div class="flex flex-col gap-5">
              <div class="flex items-center justify-between gap-4">
                <div class="flex-1">
                  <h4 class="text-xs sm:text-sm font-bold text-slate-800">Urgent causes</h4>
                  <p class="text-slate-400 text-[11px] leading-relaxed mt-0.5">Support critical causes based on what you care about.</p>
                </div>
                <button @click="urgentNotif = !urgentNotif" :class="urgentNotif ? 'bg-emerald-600' : 'bg-slate-300'" class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none">
                  <span :class="urgentNotif ? 'translate-x-5' : 'translate-x-0'" class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                </button>
              </div>

              <div class="flex items-center justify-between gap-4 border-t border-slate-50 pt-4">
                <div class="flex-1">
                  <h4 class="text-xs sm:text-sm font-bold text-slate-800">More ways to donate</h4>
                  <p class="text-slate-400 text-[11px] leading-relaxed mt-0.5">Discover causes you might want to support.</p>
                </div>
                <button @click="moreWaysNotif = !moreWaysNotif" :class="moreWaysNotif ? 'bg-emerald-600' : 'bg-slate-300'" class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none">
                  <span :class="moreWaysNotif ? 'translate-x-5' : 'translate-x-0'" class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                </button>
              </div>
            </div>
          </div>

          <!-- General -->
          <div>
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-3">General</span>
            
            <div class="flex flex-col gap-5">
              <div class="flex items-center justify-between gap-4">
                <div class="flex-1">
                  <h4 class="text-xs sm:text-sm font-bold text-slate-800">Updates and announcements</h4>
                  <p class="text-slate-400 text-[11px] leading-relaxed mt-0.5">General updates from HelpFund.</p>
                </div>
                <button @click="updatesNotif = !updatesNotif" :class="updatesNotif ? 'bg-emerald-600' : 'bg-slate-300'" class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none">
                  <span :class="updatesNotif ? 'translate-x-5' : 'translate-x-0'" class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                </button>
              </div>

              <div class="flex items-center justify-between gap-4 border-t border-slate-50 pt-4">
                <div class="flex-1">
                  <h4 class="text-xs sm:text-sm font-bold text-slate-800">Research participation opportunities</h4>
                  <p class="text-slate-400 text-[11px] leading-relaxed mt-0.5">Make HelpFund better by sharing your opinion.</p>
                </div>
                <button @click="researchNotif = !researchNotif" :class="researchNotif ? 'bg-emerald-600' : 'bg-slate-300'" class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none">
                  <span :class="researchNotif ? 'translate-x-5' : 'translate-x-0'" class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <button @click="unsubscribeAll" class="mt-8 px-5 py-2.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-full transition-all mx-auto cursor-pointer">
          Unsubscribe from all marketing emails
        </button>
      </div>

      <!-- Payment Methods Content -->
      <div v-else-if="activeSettingsTab === 'payment-methods'" class="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm flex flex-col gap-6 animate-fade-in">
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 class="font-extrabold text-slate-900 text-base">Saved Payment Methods</h3>
            <p class="text-xs text-slate-400 font-medium mt-0.5">Manage cards and mobile money accounts for quick donating</p>
          </div>
          <button
            @click="showAddPaymentModal = true"
            class="px-4 py-2 bg-[#024731] hover:bg-[#013424] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer">
            <iconify-icon icon="ph:plus-bold" class="text-sm"></iconify-icon>
            <span>Add Method</span>
          </button>
        </div>

        <div v-if="isLoadingPaymentMethods" class="p-8 text-center">
          <span class="h-6 w-6 border-2 border-[#024731] border-t-transparent rounded-full animate-spin inline-block mb-1"></span>
          <p class="text-xs text-slate-400 font-medium">Loading saved methods...</p>
        </div>

        <div v-else-if="savedPaymentMethods.length > 0" class="flex flex-col gap-3">
          <div
            v-for="pm in savedPaymentMethods"
            :key="pm.id"
            class="p-4 rounded-2xl border bg-white flex items-center justify-between gap-4 transition shadow-xs"
            :class="pm.isDefault ? 'border-[#024731] bg-[#edfce0]/20' : 'border-slate-150'">
            
            <div class="flex items-center gap-3.5">
              <div class="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-xl shrink-0">
                <iconify-icon
                  :icon="pm.provider === 'card' ? 'ph:credit-card-bold' : 'ph:device-mobile-bold'"
                  :class="pm.provider === 'card' ? 'text-indigo-600' : 'text-emerald-700'"
                ></iconify-icon>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-xs text-slate-900 capitalize">{{ pm.cardBrand || pm.provider }}</span>
                  <span v-if="pm.last4" class="font-mono text-xs text-slate-500 font-bold">&bull;&bull;&bull;&bull; {{ pm.last4 }}</span>
                  <span v-if="pm.isDefault" class="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#024731] text-white">
                    Default
                  </span>
                </div>
                <span v-if="pm.email" class="text-[11px] text-slate-400 font-medium block mt-0.5">{{ pm.email }}</span>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button
                v-if="!pm.isDefault"
                @click="handleSetDefault(pm)"
                class="px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:text-[#024731] hover:bg-[#edfce0] rounded-xl transition cursor-pointer">
                Make Default
              </button>
              <button
                @click="promptDeleteMethod(pm)"
                title="Remove method"
                class="text-slate-300 hover:text-red-600 transition-colors p-2 rounded-xl hover:bg-red-50 cursor-pointer">
                <iconify-icon icon="lucide:trash-2" class="text-sm"></iconify-icon>
              </button>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-10 border border-dashed border-slate-200 rounded-2xl bg-slate-50/40">
          <iconify-icon icon="ph:credit-card-bold" class="text-slate-300 text-3xl mb-1"></iconify-icon>
          <p class="text-xs text-slate-700 font-bold mb-0.5">No saved payment methods</p>
          <p class="text-[11px] text-slate-400 font-medium max-w-xs mx-auto">
            Save your preferred Card or Mobile Money number for 1-click donations to any fundraiser.
          </p>
        </div>
      </div>

    </main>

    <!-- Add Payment Method Modal -->
    <div v-if="showAddPaymentModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in text-left">
      <div
        class="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 flex flex-col gap-4">
        
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-full bg-emerald-50 text-[#024731] flex items-center justify-center text-lg">
              <iconify-icon icon="ph:credit-card-bold"></iconify-icon>
            </div>
            <div>
              <h3 class="text-base font-black text-slate-900 leading-tight">Add Payment Method</h3>
              <p class="text-[11px] text-slate-500 font-medium">Save a Card or Mobile Money account</p>
            </div>
          </div>
          <button
            @click="showAddPaymentModal = false"
            class="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer">
            <iconify-icon icon="ph:x-bold" class="text-base"></iconify-icon>
          </button>
        </div>

        <div v-if="addMethodError" class="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          {{ addMethodError }}
        </div>

        <form @submit.prevent="handleAddPaymentMethod" class="flex flex-col gap-3.5">
          <!-- Method Type -->
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              @click="newProvider = 'card'; newBrand = 'Visa'"
              class="py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              :class="newProvider === 'card' ? 'bg-[#edfce0] border-[#024731] text-[#024731]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'">
              <iconify-icon icon="ph:credit-card-bold" class="text-sm"></iconify-icon>
              <span>Debit / Credit Card</span>
            </button>
            <button
              type="button"
              @click="newProvider = 'mobilemoney'; newBrand = 'MTN MoMo'"
              class="py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              :class="newProvider === 'mobilemoney' ? 'bg-[#edfce0] border-[#024731] text-[#024731]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'">
              <iconify-icon icon="ph:device-mobile-bold" class="text-sm"></iconify-icon>
              <span>Mobile Money</span>
            </button>
          </div>

          <!-- Brand / Provider Select -->
          <div class="flex flex-col">
            <label class="block text-xs font-bold text-slate-700 mb-1">Provider Brand</label>
            <select
              v-if="newProvider === 'card'"
              v-model="newBrand"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#024731]">
              <option value="Visa">Visa</option>
              <option value="Mastercard">Mastercard</option>
            </select>
            <select
              v-else
              v-model="newBrand"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#024731]">
              <option value="MTN MoMo">MTN Mobile Money</option>
              <option value="Airtel Money">Airtel Money</option>
            </select>
          </div>

          <!-- Last 4 Digits -->
          <div class="flex flex-col">
            <label class="block text-xs font-bold text-slate-700 mb-1">
              {{ newProvider === 'card' ? 'Last 4 Digits of Card' : 'Last 4 Digits of Phone Number' }}
            </label>
            <input
              type="text"
              v-model="newLast4"
              maxlength="4"
              required
              placeholder="e.g. 4242"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#024731]"
            />
          </div>

          <!-- Email or account holder -->
          <div class="flex flex-col">
            <label class="block text-xs font-bold text-slate-700 mb-1">Billing Email (optional)</label>
            <input
              type="email"
              v-model="newEmail"
              placeholder="billing@example.com"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#024731]"
            />
          </div>

          <!-- Default checkbox -->
          <label class="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer pt-1">
            <input type="checkbox" v-model="newIsDefault" class="rounded text-[#024731] focus:ring-[#024731]" />
            <span>Set as default payment method</span>
          </label>

          <div class="grid grid-cols-2 gap-2 mt-2">
            <button
              type="button"
              @click="showAddPaymentModal = false"
              :disabled="isAddingMethod"
              class="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer">
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isAddingMethod || !newLast4.trim()"
              class="py-2.5 px-4 rounded-xl bg-[#024731] hover:bg-[#013424] disabled:opacity-50 text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer">
              <span v-if="isAddingMethod"
                class="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Save Method</span>
            </button>
          </div>
        </form>

      </div>
    </div>

    <!-- Remove Payment Method Modal -->
    <div v-if="methodToDelete"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in text-center">
      <div
        class="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-slate-100 flex flex-col items-center">
        <div class="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-2xl mb-4">
          <iconify-icon icon="lucide:trash-2"></iconify-icon>
        </div>
        <h3 class="text-lg font-black text-slate-900 mb-1.5">Remove Payment Method?</h3>
        <p class="text-xs text-slate-500 font-medium leading-relaxed mb-6">
          Are you sure you want to remove <strong class="text-slate-800">{{ methodToDelete.cardBrand || methodToDelete.provider }} (**** {{ methodToDelete.last4 }})</strong>?
        </p>
        <div class="grid grid-cols-2 gap-3 w-full">
          <button
            type="button"
            @click="methodToDelete = null"
            :disabled="isDeletingMethod"
            class="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer">
            Cancel
          </button>
          <button
            type="button"
            @click="confirmDeleteMethod"
            :disabled="isDeletingMethod"
            class="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer">
            <span v-if="isDeletingMethod"
              class="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>Remove</span>
          </button>
        </div>
      </div>
    </div>

    </main>

    <MainFooter />
  </div>
</template>
