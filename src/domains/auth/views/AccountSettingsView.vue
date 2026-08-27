<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../../../stores/auth'
import NavHeader from '../../landing/components/NavHeader.vue'
import MainFooter from '../../landing/components/MainFooter.vue'

const authStore = useAuthStore()

const navHeaderRef = ref<any>(null)
const closeDropdowns = () => {
  navHeaderRef.value?.closeDropdowns()
}

const activeSettingsTab = ref<'account' | 'notifications'>('account')

// Editing Name logic
const isEditingName = ref(false)
const inputName = ref(authStore.user.name)

const saveName = () => {
  if (inputName.value.trim()) {
    authStore.login(authStore.user.email, inputName.value)
    isEditingName.value = false
  }
}

// Editing Birthday logic
const isEditingBirthday = ref(false)
const birthdayVal = ref('')

const saveBirthday = () => {
  isEditingBirthday.value = false
}

// Editing Phone logic
const isEditingPhone = ref(false)
const phoneVal = ref('')

const savePhone = () => {
  isEditingPhone.value = false
}

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
              <input type="text" v-model="inputName" class="px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 flex-1 font-semibold" />
              <button @click="saveName" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg cursor-pointer">Save</button>
              <button @click="isEditingName = false" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-lg cursor-pointer">Cancel</button>
            </div>
            <span v-else class="text-sm font-bold text-slate-800 leading-snug">{{ authStore.user.name }}</span>
          </div>
          <button v-if="!isEditingName" @click="isEditingName = true" class="px-4 py-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 font-bold text-xs rounded-xl transition-all text-slate-700 cursor-pointer">
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
              <input type="text" v-model="phoneVal" placeholder="+1 (555) 000-0000" class="px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 flex-1 font-semibold" />
              <button @click="savePhone" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg cursor-pointer">Save</button>
              <button @click="isEditingPhone = false" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-lg cursor-pointer">Cancel</button>
            </div>
            <span v-else class="text-sm font-bold text-slate-800 leading-snug">{{ phoneVal || 'No phone number' }}</span>
          </div>
          <button v-if="!isEditingPhone" @click="isEditingPhone = true" class="px-4 py-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 font-bold text-xs rounded-xl transition-all text-slate-700 cursor-pointer">
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
              <input type="date" v-model="birthdayVal" class="px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 flex-1 font-semibold" />
              <button @click="saveBirthday" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg cursor-pointer">Save</button>
              <button @click="isEditingBirthday = false" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-lg cursor-pointer">Cancel</button>
            </div>
            <span v-else class="text-sm font-bold text-slate-800 leading-snug">{{ birthdayVal || 'Add your birthday' }}</span>
          </div>
          <button v-if="!isEditingBirthday" @click="isEditingBirthday = true" class="px-4 py-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 font-bold text-xs rounded-xl transition-all text-slate-700 cursor-pointer">
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

    </main>

    <MainFooter />
  </div>
</template>
