<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Dropdown Navigation States
const activeDropdown = ref<'donate' | 'fundraise' | 'about' | 'user' | null>(null)

const toggleDropdown = (menu: 'donate' | 'fundraise' | 'about' | 'user') => {
  if (activeDropdown.value === menu) {
    activeDropdown.value = null
  } else {
    activeDropdown.value = menu
  }
}

const closeDropdowns = () => {
  activeDropdown.value = null
}

defineExpose({ closeDropdowns })

const startFundraiser = () => {
  router.push('/start-fundraiser')
}

const goToLogin = () => {
  router.push('/login')
}

const handleLogout = () => {
  authStore.logout()
  closeDropdowns()
  router.push('/')
}
</script>

<template>
  <!-- Navigation Header -->
  <header class="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm" @click.stop>
    <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between relative">
      
      <!-- Left Nav Actions -->
      <div class="flex items-center gap-6">
        <!-- Donate Dropdown Wrapper -->
        <div class="relative" @mouseenter="activeDropdown = 'donate'" @mouseleave="activeDropdown = null">
          <button @click="toggleDropdown('donate')" class="flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-[#024731] transition-colors py-2 cursor-pointer">
            Donate
            <svg class="transition-transform duration-200" :class="{ 'rotate-180': activeDropdown === 'donate' }" xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
          </button>
          
          <!-- Donate Dropdown Menu (Matches Screenshot 1) -->
          <div v-if="activeDropdown === 'donate'" class="absolute left-0 mt-0 pt-2 w-72 sm:w-[480px] z-50">
            <div class="bg-white rounded-xl shadow-xl border border-slate-100 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-scale">
              <div class="col-span-full border-b border-slate-50 pb-2 mb-1 flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="text-[#02a95c]"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/></svg>
                Discover fundraisers to support
              </div>
              <RouterLink to="/donate/categories" @click="closeDropdowns" class="group flex flex-col p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                <span class="text-sm font-semibold group-hover:text-[#024731]">Categories</span>
                <span class="text-xs text-slate-500 mt-0.5">Browse fundraisers by category</span>
              </RouterLink>
              <RouterLink to="/donate/crisis-relief" @click="closeDropdowns" class="group flex flex-col p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                <span class="text-sm font-semibold group-hover:text-[#024731]">Crisis Relief</span>
                <span class="text-xs text-slate-500 mt-0.5">Donate to verified crisis funds</span>
              </RouterLink>
              <RouterLink to="/donate/social-impact" @click="closeDropdowns" class="group flex flex-col p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                <span class="text-sm font-semibold group-hover:text-[#024731]">Social Impact Funds</span>
                <span class="text-xs text-slate-500 mt-0.5">Direct support for urgent needs</span>
              </RouterLink>
              <RouterLink to="/donate/supporter-space" @click="closeDropdowns" class="group flex flex-col p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                <span class="text-sm font-semibold group-hover:text-[#024731]">Supporter Space</span>
                <span class="text-xs text-slate-500 mt-0.5">Inspiration, FAQs, and where to give</span>
              </RouterLink>
            </div>
          </div>
        </div>

        <!-- Fundraise Dropdown Wrapper -->
        <div class="relative hidden sm:block" @mouseenter="activeDropdown = 'fundraise'" @mouseleave="activeDropdown = null">
          <button @click="toggleDropdown('fundraise')" class="flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-[#024731] transition-colors py-2 cursor-pointer">
            Fundraise
            <svg class="transition-transform duration-200" :class="{ 'rotate-180': activeDropdown === 'fundraise' }" xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
          </button>
          <div v-if="activeDropdown === 'fundraise'" class="absolute left-0 mt-0 pt-2 w-56 z-50">
            <div class="bg-white rounded-xl shadow-xl border border-slate-100 p-3 flex flex-col gap-1 animate-scale">
              <button @click="startFundraiser" class="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 hover:text-[#024731] transition-colors cursor-pointer">Start a Fundraiser</button>
              <a href="/#how-it-works" @click="closeDropdowns" class="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 hover:text-[#024731] transition-colors cursor-pointer">How HelpFund Works</a>
            </div>
          </div>
        </div>
      </div>

      <RouterLink to="/" @click="closeDropdowns" class="flex items-center gap-1 absolute left-1/2 transform -translate-x-1/2">
        <iconify-icon icon="lucide:sunrise" class="text-[#02a95c] text-2xl"></iconify-icon>
        <span class="text-xl font-black text-[#024731] tracking-tight">helpfund</span>
      </RouterLink>

      <!-- Right Nav Actions -->
      <div class="flex items-center gap-4">
        <!-- About Dropdown Wrapper -->
        <div class="relative hidden lg:block" @mouseenter="activeDropdown = 'about'" @mouseleave="activeDropdown = null">
          <button @click="toggleDropdown('about')" class="flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-[#024731] transition-colors py-2 cursor-pointer">
            About
            <svg class="transition-transform duration-200" :class="{ 'rotate-180': activeDropdown === 'about' }" xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
          </button>
          
          <!-- About Dropdown (Matches Screenshot 2) -->
          <div v-if="activeDropdown === 'about'" class="absolute right-0 mt-0 pt-2 w-72 sm:w-[480px] z-50">
            <div class="bg-white rounded-xl shadow-xl border border-slate-100 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-scale">
              <div class="col-span-full border-b border-slate-50 pb-2 mb-1 flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="text-[#02a95c]"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/></svg>
                How it works, pricing, and more
              </div>
              <a href="/#how-it-works" @click="closeDropdowns" class="flex flex-col p-2 hover:bg-slate-50 rounded-lg group">
                <span class="text-sm font-semibold group-hover:text-[#024731]">How HelpFund works</span>
              </a>
              <RouterLink to="/donate/supporter-space" @click="closeDropdowns" class="flex flex-col p-2 hover:bg-slate-50 rounded-lg group">
                <span class="text-sm font-semibold group-hover:text-[#024731]">About HelpFund</span>
              </RouterLink>
              <RouterLink to="/donate/crisis-relief" @click="closeDropdowns" class="flex flex-col p-2 hover:bg-slate-50 rounded-lg group">
                <span class="text-sm font-semibold group-hover:text-[#024731]">HelpFund Giving Guarantee</span>
              </RouterLink>
              <RouterLink to="/donate/categories" @click="closeDropdowns" class="flex flex-col p-2 hover:bg-slate-50 rounded-lg group">
                <span class="text-sm font-semibold group-hover:text-[#024731]">Supported Countries</span>
              </RouterLink>
              <RouterLink to="/donate/social-impact" @click="closeDropdowns" class="flex flex-col p-2 hover:bg-slate-50 rounded-lg group">
                <span class="text-sm font-semibold group-hover:text-[#024731]">Pricing</span>
              </RouterLink>
              <RouterLink to="/donate/supporter-space" @click="closeDropdowns" class="flex flex-col p-2 hover:bg-slate-50 rounded-lg group">
                <span class="text-sm font-semibold group-hover:text-[#024731]">Help Center</span>
              </RouterLink>
            </div>
          </div>
        </div>

        <template v-if="!authStore.isLoggedIn">
          <button @click="goToLogin" class="text-sm font-semibold text-slate-700 hover:text-[#024731] transition-colors py-2 px-3 cursor-pointer">Sign in</button>
          <button @click="startFundraiser" class="bg-[#024731] hover:bg-[#013424] text-white text-sm font-bold py-2 px-4 rounded-full shadow-md shadow-emerald-950/10 hover:shadow-lg transition-all cursor-pointer">Start a HelpFund</button>
        </template>
        <template v-else>
          <!-- User Dropdown Menu -->
          <div class="relative" @mouseenter="activeDropdown = 'user'" @mouseleave="activeDropdown = null">
            <button @click="toggleDropdown('user')" class="flex items-center gap-2 py-1.5 px-3 rounded-full hover:bg-slate-50 transition-colors cursor-pointer">
              <div class="w-7 h-7 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0">
                <img v-if="authStore.user?.avatar" :src="authStore.user.avatar" class="w-full h-full object-cover" alt="Avatar" />
                <iconify-icon v-else icon="ph:user-circle-fill" class="text-xl text-slate-400"></iconify-icon>
              </div>
              <span class="text-sm font-bold text-slate-800 tracking-tight uppercase">{{ (authStore.user?.name || 'Account').split(' ')[0] }}</span>
              <svg class="transition-transform duration-200 text-slate-500" :class="{ 'rotate-180': activeDropdown === 'user' }" xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            <!-- Dropdown Menu Options (Matches Screenshot 3) -->
            <div v-if="activeDropdown === 'user'" class="absolute right-0 mt-0 pt-2 w-56 z-50">
              <div class="bg-white rounded-xl shadow-xl border border-slate-100 p-2.5 flex flex-col gap-1 animate-scale">
                <RouterLink v-if="authStore.isAdmin" to="/admin/users" @click="closeDropdowns" class="w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold text-purple-700 bg-purple-50/60 hover:bg-purple-100/60 transition-colors flex items-center justify-between">
                  <span>Admin Portal</span>
                  <span class="text-[10px] uppercase tracking-wider bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded font-extrabold">Admin</span>
                </RouterLink>
                <RouterLink to="/profile" @click="closeDropdowns" class="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                  Profile
                </RouterLink>
                <RouterLink to="/my-fundraisers" @click="closeDropdowns" class="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                  Your fundraisers
                </RouterLink>
                <RouterLink to="/your-impact" @click="closeDropdowns" class="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                  Your impact
                </RouterLink>
                <RouterLink to="/messages" @click="closeDropdowns" class="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                  Messages
                </RouterLink>
                <RouterLink to="/account-settings" @click="closeDropdowns" class="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                  Account settings
                </RouterLink>
                <hr class="border-slate-50 my-1" />
                <button @click="handleLogout" class="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </header>
</template>
