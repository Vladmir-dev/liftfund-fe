<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '../../../stores/auth'
import NavHeader from '../../landing/components/NavHeader.vue'
import MainFooter from '../../landing/components/MainFooter.vue'

const authStore = useAuthStore()

const navHeaderRef = ref<any>(null)
const closeDropdowns = () => {
  navHeaderRef.value?.closeDropdowns()
}

// Interactive states
const isPrivate = ref(true)
const activeTab = ref<'activity' | 'about'>('activity')

// Discover people lists
const people = ref([
  { name: 'Jimmy Darts', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', followed: false },
  { name: 'SB Mowing', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150', followed: false },
  { name: 'Pattie Gonia', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150', followed: false },
  { name: 'Little Miss Flint', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150', followed: false },
  { name: 'Kalina Silverman / Big Talk', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', followed: false }
])

const toggleFollow = (idx: number) => {
  const person = people.value[idx]
  if (person) {
    person.followed = !person.followed
  }
}

const toggleVisibility = () => {
  isPrivate.value = !isPrivate.value
}

// ================= ABOUT TAB & MODALS LOGIC =================

// Info modal states
const showInfoModal = ref(false)
const userInfo = ref({
  location: '',
  education: '',
  work: '',
  birthday: ''
})

const tempLocation = ref('')
const tempEducation = ref('')
const tempWork = ref('')
const tempBirthday = ref('')

const isEditingLocation = ref(false)
const isEditingEducation = ref(false)
const isEditingWork = ref(false)
const isEditingBirthday = ref(false)

const openInfoModal = () => {
  tempLocation.value = userInfo.value.location
  tempEducation.value = userInfo.value.education
  tempWork.value = userInfo.value.work
  tempBirthday.value = userInfo.value.birthday
  showInfoModal.value = true
}

const saveLocation = () => {
  userInfo.value.location = tempLocation.value
  isEditingLocation.value = false
}
const saveEducation = () => {
  userInfo.value.education = tempEducation.value
  isEditingEducation.value = false
}
const saveWork = () => {
  userInfo.value.work = tempWork.value
  isEditingWork.value = false
}
const saveBirthday = () => {
  userInfo.value.birthday = tempBirthday.value
  isEditingBirthday.value = false
}

// Social handles states
const showSocialModal = ref(false)
const socialHandles = ref({
  instagram: '',
  tiktok: '',
  x: '',
  facebook: '',
  linktree: '',
  youtube: '',
  linkedin: '',
  twitch: '',
  pillar: ''
})

const tempSocial = ref({
  instagram: '',
  tiktok: '',
  x: '',
  facebook: '',
  linktree: '',
  youtube: '',
  linkedin: '',
  twitch: '',
  pillar: ''
})

const isEditingSocial = ref({
  instagram: false,
  tiktok: false,
  x: false,
  facebook: false,
  linktree: false,
  youtube: false,
  linkedin: false,
  twitch: false,
  pillar: false
})

const openSocialModal = () => {
  tempSocial.value = { ...socialHandles.value }
  showSocialModal.value = true
}

const saveSocial = (platform: keyof typeof socialHandles.value) => {
  socialHandles.value[platform] = tempSocial.value[platform]
  isEditingSocial.value[platform] = false
}

// Checks if any info has been added
const hasAddedInfo = computed(() => {
  return userInfo.value.location || userInfo.value.education || userInfo.value.work || userInfo.value.birthday
})

// Checks if any social handle has been added
const hasAddedSocial = computed(() => {
  return Object.values(socialHandles.value).some(val => val.trim().length > 0)
})
</script>

<template>
  <div class="min-h-screen bg-slate-50/50 text-slate-800 font-sans text-left" @click="closeDropdowns">
    <NavHeader ref="navHeaderRef" />

    <main class="max-w-7xl mx-auto px-4 py-12">
      <!-- Profile Header Box -->
      <div
        class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-12 flex flex-col md:flex-row">
        <!-- Left Side: Profile Photo curved frame -->
        <div
          class="bg-gradient-to-b from-emerald-200/50 to-emerald-800/80 p-8 flex flex-col items-center justify-center relative md:w-2/5 shrink-0 min-h-[300px]">
          <!-- <div class="w-36 h-36 relative overflow-hidden bg-slate-200 shadow-md border-4 border-white curved-mask-1"> -->
          <div class="w-36 h-36 relative overflow-hidden bg-slate-200 shadow-md border-4 border-white rounded-full">
            <img :src="authStore.user.avatar" class="w-full h-full object-cover" alt="User Avatar" />
          </div>
          <!-- Edit buttons overlay -->
          <div class="flex items-center gap-3 mt-4">
            <button
              class="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center shadow-sm border border-slate-200 cursor-pointer">
              <iconify-icon icon="lucide:pencil" class="text-sm"></iconify-icon>
            </button>
            <button
              class="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center shadow-sm border border-slate-200 cursor-pointer">
              <iconify-icon icon="lucide:settings" class="text-sm"></iconify-icon>
            </button>
          </div>
        </div>

        <!-- Right Side: Profile Details -->
        <div class="p-8 md:p-12 flex-1 flex flex-col justify-between">
          <div>
            <h1 class="text-3xl font-black text-slate-900 tracking-tight mb-2 uppercase">
              {{ authStore.user.name }}
            </h1>

            <div class="flex items-center gap-6 text-sm font-bold text-slate-500 mb-6">
              <span>0 <span class="font-semibold text-slate-400">Followers</span></span>
              <span>0 <span class="font-semibold text-slate-400">Following</span></span>
            </div>

            <!-- Privacy indicator -->
            <div
              class="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 w-fit mb-6">
              <iconify-icon :icon="isPrivate ? 'lucide:eye-off' : 'lucide:eye'"
                class="text-slate-400 text-sm"></iconify-icon>
              <span>Your profile is {{ isPrivate ? 'private' : 'public' }}.</span>
              <button @click="toggleVisibility" class="text-[#024731] hover:underline font-bold ml-1 cursor-pointer">
                Change visibility
              </button>
            </div>
          </div>

          <button
            class="w-full sm:w-fit bg-[#024731] hover:bg-[#013424] text-white font-bold px-8 py-3.5 rounded-full shadow-md text-sm transition-all text-center cursor-pointer">
            Share profile
          </button>
        </div>
      </div>

      <!-- Main Layout: Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <!-- Left Main Content Column (Col-span 2) -->
        <div class="lg:col-span-2 flex flex-col gap-6">

          <!-- Let's set up your profile widget -->
          <div
            class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-center gap-5 hover:shadow-md transition-all">
            <div
              class="w-14 h-14 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 flex flex-col items-center justify-center font-black shrink-0">
              <span class="text-sm">1/5</span>
              <!-- <span class="text-sm -mt-1 uppercase">/5</span> -->
            </div>
            <div class="text-left">
              <h3 class="font-extrabold text-slate-900 text-sm sm:text-base mb-0.5">Let's set up your profile</h3>
              <p class="text-slate-400 text-xs sm:text-sm font-medium">Add a few basic details to connect with donors.
              </p>
            </div>
            <span class="text-slate-400 font-bold text-lg ml-auto">→</span>
          </div>

          <!-- What I care about -->
          <div class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 class="font-extrabold text-slate-900 text-base mb-2">What I care about</h3>
            <p class="text-slate-500 text-xs sm:text-sm leading-relaxed mb-4">
              Share what you care about and connect with people who support similar causes.
            </p>
            <button
              class="flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:border-slate-400 rounded-full text-xs font-bold text-slate-700 transition-colors cursor-pointer">
              <span>+ Add Intro</span>
            </button>
          </div>

          <!-- My featured causes -->
          <div class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 class="font-extrabold text-slate-900 text-base mb-2">My featured causes</h3>
            <p class="text-slate-500 text-xs sm:text-sm leading-relaxed mb-6">
              Start adding fundraisers and nonprofits to highlight on your public profile.
            </p>

            <div
              class="flex flex-col items-center justify-center p-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-center mb-4">
              <div
                class="w-12 h-12 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center mb-3">
                <iconify-icon icon="lucide:heart-handshake" class="text-emerald-700 text-xl"></iconify-icon>
              </div>
              <p class="text-slate-400 text-xs font-medium">Highlight your favorite fundraising campaigns</p>
            </div>

            <button
              class="flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:border-slate-400 rounded-full text-xs font-bold text-slate-700 transition-colors cursor-pointer">
              <span>+ Add links</span>
            </button>
          </div>

          <!-- Activity / About Tabs -->
          <div class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div class="flex items-center gap-4 border-b border-slate-100 pb-3 mb-6">
              <button @click="activeTab = 'activity'" class="text-sm font-bold pb-2 relative cursor-pointer"
                :class="activeTab === 'activity' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 hover:text-slate-600'">
                Activity
              </button>
              <button @click="activeTab = 'about'" class="text-sm font-bold pb-2 relative cursor-pointer"
                :class="activeTab === 'about' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 hover:text-slate-600'">
                About
              </button>
            </div>

            <!-- Tab content -->
            <div v-if="activeTab === 'activity'"
              class="py-12 text-center text-slate-400 text-xs sm:text-sm font-medium">
              No recent activity to display.
            </div>

            <!-- About Tab Replicated (Screenshot 1) -->
            <div v-else class="py-4 text-left">
              <h2 class="text-xl font-black text-slate-900 mb-4">About me</h2>

              <!-- Joined date -->
              <div class="flex items-center gap-2.5 text-slate-700 text-xs sm:text-sm mb-6">
                <iconify-icon icon="lucide:calendar" class="text-slate-400 text-lg"></iconify-icon>
                <span>Joined August 2026</span>
              </div>

              <!-- Dashed Card for Info details -->
              <div class="border border-dashed border-slate-200 rounded-2xl p-6 text-center mb-8 bg-slate-50/20">
                <template v-if="!hasAddedInfo">
                  <p class="text-slate-500 text-xs sm:text-sm mb-4 leading-relaxed">
                    The more you share, the deeper and more relevant your connections become.
                  </p>
                </template>
                <template v-else>
                  <!-- Display active user details -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-lg mx-auto mb-4 text-xs sm:text-sm">
                    <div v-if="userInfo.location" class="flex items-center gap-2 text-slate-700">
                      <iconify-icon icon="lucide:map-pin" class="text-emerald-700 text-base"></iconify-icon>
                      <span class="font-bold">Location:</span> <span>{{ userInfo.location }}</span>
                    </div>
                    <div v-if="userInfo.education" class="flex items-center gap-2 text-slate-700">
                      <iconify-icon icon="lucide:graduation-cap" class="text-emerald-700 text-base"></iconify-icon>
                      <span class="font-bold">Education:</span> <span>{{ userInfo.education }}</span>
                    </div>
                    <div v-if="userInfo.work" class="flex items-center gap-2 text-slate-700">
                      <iconify-icon icon="lucide:briefcase" class="text-emerald-700 text-base"></iconify-icon>
                      <span class="font-bold">Work:</span> <span>{{ userInfo.work }}</span>
                    </div>
                    <div v-if="userInfo.birthday" class="flex items-center gap-2 text-slate-700">
                      <iconify-icon icon="lucide:gift" class="text-emerald-700 text-base"></iconify-icon>
                      <span class="font-bold">Birthday:</span> <span>{{ userInfo.birthday }}</span>
                    </div>
                  </div>
                </template>
                <button @click="openInfoModal"
                  class="w-full py-3 border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer">
                  + Add info
                </button>
              </div>

              <!-- Your Social Handles -->
              <h2 class="text-xl font-black text-slate-900 mb-4 mt-8">Your social handles</h2>

              <div
                class="border border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center bg-slate-50/20">
                <!-- Circular colored brand icons -->
                <div class="flex flex-wrap justify-center gap-3.5 mb-6">
                  <!-- Instagram -->
                  <div :class="socialHandles.instagram ? 'opacity-100 scale-110 shadow-md' : 'opacity-65'"
                    class="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 flex items-center justify-center transition-all relative group">
                    <iconify-icon icon="simple-icons:instagram" class="text-white text-base"></iconify-icon>
                    <span v-if="socialHandles.instagram"
                      class="absolute -top-8 bg-slate-800 text-white text-[9px] px-2 py-0.5 rounded shadow pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{{
                        socialHandles.instagram }}</span>
                  </div>
                  <!-- TikTok -->
                  <div :class="socialHandles.tiktok ? 'opacity-100 scale-110 shadow-md' : 'opacity-65'"
                    class="w-9 h-9 rounded-full bg-black flex items-center justify-center transition-all relative group">
                    <iconify-icon icon="simple-icons:tiktok" class="text-white text-base"></iconify-icon>
                    <span v-if="socialHandles.tiktok"
                      class="absolute -top-8 bg-slate-800 text-white text-[9px] px-2 py-0.5 rounded shadow pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{{
                        socialHandles.tiktok }}</span>
                  </div>
                  <!-- Facebook -->
                  <div :class="socialHandles.facebook ? 'opacity-100 scale-110 shadow-md' : 'opacity-65'"
                    class="w-9 h-9 rounded-full bg-[#1877F2] flex items-center justify-center transition-all relative group">
                    <iconify-icon icon="simple-icons:facebook" class="text-white text-base"></iconify-icon>
                    <span v-if="socialHandles.facebook"
                      class="absolute -top-8 bg-slate-800 text-white text-[9px] px-2 py-0.5 rounded shadow pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{{
                        socialHandles.facebook }}</span>
                  </div>
                  <!-- X -->
                  <div :class="socialHandles.x ? 'opacity-100 scale-110 shadow-md' : 'opacity-65'"
                    class="w-9 h-9 rounded-full bg-black flex items-center justify-center transition-all relative group">
                    <iconify-icon icon="simple-icons:x" class="text-white text-sm"></iconify-icon>
                    <span v-if="socialHandles.x"
                      class="absolute -top-8 bg-slate-800 text-white text-[9px] px-2 py-0.5 rounded shadow pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{{
                        socialHandles.x }}</span>
                  </div>
                  <!-- YouTube -->
                  <div :class="socialHandles.youtube ? 'opacity-100 scale-110 shadow-md' : 'opacity-65'"
                    class="w-9 h-9 rounded-full bg-[#FF0000] flex items-center justify-center transition-all relative group">
                    <iconify-icon icon="simple-icons:youtube" class="text-white text-base"></iconify-icon>
                    <span v-if="socialHandles.youtube"
                      class="absolute -top-8 bg-slate-800 text-white text-[9px] px-2 py-0.5 rounded shadow pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{{
                        socialHandles.youtube }}</span>
                  </div>
                  <!-- LinkedIn -->
                  <div :class="socialHandles.linkedin ? 'opacity-100 scale-110 shadow-md' : 'opacity-65'"
                    class="w-9 h-9 rounded-full bg-[#0A66C2] flex items-center justify-center transition-all relative group">
                    <iconify-icon icon="simple-icons:linkedin" class="text-white text-base"></iconify-icon>
                    <span v-if="socialHandles.linkedin"
                      class="absolute -top-8 bg-slate-800 text-white text-[9px] px-2 py-0.5 rounded shadow pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{{
                        socialHandles.linkedin }}</span>
                  </div>
                  <!-- Linktree -->
                  <div :class="socialHandles.linktree ? 'opacity-100 scale-110 shadow-md' : 'opacity-65'"
                    class="w-9 h-9 rounded-full bg-[#25C960] flex items-center justify-center transition-all relative group">
                    <iconify-icon icon="simple-icons:linktree" class="text-white text-base"></iconify-icon>
                    <span v-if="socialHandles.linktree"
                      class="absolute -top-8 bg-slate-800 text-white text-[9px] px-2 py-0.5 rounded shadow pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{{
                        socialHandles.linktree }}</span>
                  </div>
                  <!-- Twitch -->
                  <div :class="socialHandles.twitch ? 'opacity-100 scale-110 shadow-md' : 'opacity-65'"
                    class="w-9 h-9 rounded-full bg-[#9146FF] flex items-center justify-center transition-all relative group">
                    <iconify-icon icon="simple-icons:twitch" class="text-white text-base"></iconify-icon>
                    <span v-if="socialHandles.twitch"
                      class="absolute -top-8 bg-slate-800 text-white text-[9px] px-2 py-0.5 rounded shadow pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{{
                        socialHandles.twitch }}</span>
                  </div>
                  <!-- Pillar -->
                  <div :class="socialHandles.pillar ? 'opacity-100 scale-110 shadow-md' : 'opacity-65'"
                    class="w-9 h-9 rounded-full bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 flex items-center justify-center transition-all relative group">
                    <iconify-icon icon="lucide:link-2" class="text-slate-800 text-base"></iconify-icon>
                    <span v-if="socialHandles.pillar"
                      class="absolute -top-8 bg-slate-800 text-white text-[9px] px-2 py-0.5 rounded shadow pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{{
                        socialHandles.pillar }}</span>
                  </div>
                </div>

                <button @click="openSocialModal"
                  class="w-full py-3 border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer">
                  + Add social handles
                </button>
              </div>

            </div>
          </div>

        </div>

        <!-- Right Column Sidebar: Discover more people -->
        <div class="flex flex-col gap-6">
          <div class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm text-left">
            <h3 class="font-extrabold text-slate-900 text-base mb-6">Discover more people</h3>

            <div class="flex flex-col gap-4 mb-6">
              <div v-for="(person, idx) in people" :key="person.name" class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <img :src="person.avatar"
                    class="w-10 h-10 rounded-full object-cover border border-slate-100 shadow-sm shrink-0"
                    :alt="person.name" />
                  <span class="text-xs font-bold text-slate-800 leading-snug line-clamp-1">{{ person.name }}</span>
                </div>
                <button @click="toggleFollow(idx)"
                  class="px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer"
                  :class="person.followed ? 'bg-slate-100 border border-slate-200 text-slate-600' : 'bg-[#0f2e24] hover:bg-[#1a3f33] text-white'">
                  {{ person.followed ? 'Following' : 'Follow' }}
                </button>
              </div>
            </div>

            <button
              class="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all border border-slate-200/50 text-center cursor-pointer">
              Find someone you know
            </button>
          </div>
        </div>

      </div>
    </main>

    <MainFooter />

    <!-- ================= MODALS OVERLAYS ================= -->

    <!-- Edit Information Modal (Screenshot 2) -->
    <div v-if="showInfoModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs"
      @click.self="showInfoModal = false">
      <div
        class="bg-white rounded-3xl w-full max-w-lg p-6 border border-slate-100 shadow-2xl animate-scale text-left relative flex flex-col max-h-[90vh]">
        <!-- Close button -->
        <button @click="showInfoModal = false" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor"
            stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Header -->
        <div class="pr-6 mb-5">
          <h3 class="text-xl font-black text-slate-900 leading-tight mb-2">Edit information</h3>
          <p class="text-slate-500 text-xs leading-relaxed">
            Share more to help us connect you with relevant causes and supporters, and build trust in our community. <a
              href="#" class="underline hover:text-slate-800">Learn more</a>
          </p>
        </div>

        <!-- Scrollable fields list -->
        <div class="flex-1 overflow-y-auto pr-2 flex flex-col gap-5 py-2">

          <!-- Location field -->
          <div class="flex items-center justify-between gap-4 py-2 border-b border-slate-50">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <iconify-icon icon="lucide:map-pin" class="text-slate-400 text-lg shrink-0"></iconify-icon>
              <div class="flex-1 min-w-0">
                <span class="text-xs font-bold text-slate-800">Location</span>
                <!-- Inline editor -->
                <input v-if="isEditingLocation" type="text" v-model="tempLocation"
                  class="w-full mt-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none" />
                <p v-else-if="userInfo.location" class="text-slate-500 text-[11px] truncate mt-0.5 font-semibold">{{
                  userInfo.location }}</p>
              </div>
            </div>

            <button v-if="isEditingLocation" @click="saveLocation"
              class="text-xs font-bold text-[#024731] hover:underline cursor-pointer">Save</button>
            <button v-else @click="isEditingLocation = true"
              class="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer">
              {{ userInfo.location ? 'Edit' : '+ Add' }}
            </button>
          </div>

          <!-- Education field -->
          <div class="flex items-center justify-between gap-4 py-2 border-b border-slate-50">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <iconify-icon icon="lucide:graduation-cap" class="text-slate-400 text-lg shrink-0"></iconify-icon>
              <div class="flex-1 min-w-0">
                <span class="text-xs font-bold text-slate-800">Education</span>
                <input v-if="isEditingEducation" type="text" v-model="tempEducation"
                  class="w-full mt-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#024731]" />
                <p v-else-if="userInfo.education" class="text-slate-500 text-[11px] truncate mt-0.5 font-semibold">{{
                  userInfo.education }}</p>
              </div>
            </div>

            <button v-if="isEditingEducation" @click="saveEducation"
              class="text-xs font-bold text-[#024731] hover:underline cursor-pointer">Save</button>
            <button v-else @click="isEditingEducation = true"
              class="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer">
              {{ userInfo.education ? 'Edit' : '+ Add' }}
            </button>
          </div>

          <!-- Work field -->
          <div class="flex items-center justify-between gap-4 py-2 border-b border-slate-50">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <iconify-icon icon="lucide:briefcase" class="text-slate-400 text-lg shrink-0"></iconify-icon>
              <div class="flex-1 min-w-0">
                <span class="text-xs font-bold text-slate-800">Work</span>
                <input v-if="isEditingWork" type="text" v-model="tempWork"
                  class="w-full mt-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#024731]" />
                <p v-else-if="userInfo.work" class="text-slate-500 text-[11px] truncate mt-0.5 font-semibold">{{
                  userInfo.work }}</p>
              </div>
            </div>

            <button v-if="isEditingWork" @click="saveWork"
              class="text-xs font-bold text-[#024731] hover:underline cursor-pointer">Save</button>
            <button v-else @click="isEditingWork = true"
              class="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer">
              {{ userInfo.work ? 'Edit' : '+ Add' }}
            </button>
          </div>

          <!-- Birthday field -->
          <div class="flex items-center justify-between gap-4 py-2">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <iconify-icon icon="lucide:gift" class="text-slate-400 text-lg shrink-0"></iconify-icon>
              <div class="flex-1 min-w-0">
                <span class="text-xs font-bold text-slate-800">Birthday</span>
                <input v-if="isEditingBirthday" type="date" v-model="tempBirthday"
                  class="w-full mt-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#024731]" />
                <p v-else-if="userInfo.birthday" class="text-slate-500 text-[11px] truncate mt-0.5 font-semibold">{{
                  userInfo.birthday }}</p>
              </div>
            </div>

            <button v-if="isEditingBirthday" @click="saveBirthday"
              class="text-xs font-bold text-[#024731] hover:underline cursor-pointer">Save</button>
            <button v-else @click="isEditingBirthday = true"
              class="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer">
              {{ userInfo.birthday ? 'Edit' : '+ Add' }}
            </button>
          </div>

        </div>

        <!-- Done Footer button (Screenshot 2 bottom right) -->
        <div class="border-t border-slate-50 pt-4 flex justify-end">
          <button @click="showInfoModal = false"
            class="bg-[#024731] hover:bg-[#013424] text-white text-xs font-bold py-2.5 px-6 rounded-full cursor-pointer transition-all">
            Done
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Social Handles Modal (Screenshot 3) -->
    <div v-if="showSocialModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs"
      @click.self="showSocialModal = false">
      <div
        class="bg-white rounded-3xl w-full max-w-lg p-6 border border-slate-100 shadow-2xl animate-scale text-left relative flex flex-col max-h-[90vh]">
        <!-- Close button -->
        <button @click="showSocialModal = false" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor"
            stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Header -->
        <div class="pr-6 mb-5">
          <h3 class="text-xl font-black text-slate-900 leading-tight mb-2">Edit social handles</h3>
          <p class="text-slate-500 text-xs leading-relaxed">
            Enter usernames for the social media accounts you want to display on your profile.
          </p>
        </div>

        <!-- Scrollable platforms list -->
        <div class="flex-1 overflow-y-auto pr-2 flex flex-col gap-4 py-2">

          <!-- Instagram -->
          <div class="flex items-center justify-between gap-4 py-1.5 border-b border-slate-50">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div
                class="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 flex items-center justify-center shrink-0">
                <iconify-icon icon="simple-icons:instagram" class="text-white text-sm"></iconify-icon>
              </div>
              <div class="flex-1 min-w-0">
                <span class="text-xs font-bold text-slate-800">Instagram</span>
                <input v-if="isEditingSocial.instagram" type="text" v-model="tempSocial.instagram"
                  placeholder="@username"
                  class="w-full mt-1 px-3 py-1 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none" />
                <p v-else-if="socialHandles.instagram" class="text-slate-500 text-[11px] truncate mt-0.5 font-semibold">
                  {{
                    socialHandles.instagram }}</p>
              </div>
            </div>
            <button v-if="isEditingSocial.instagram" @click="saveSocial('instagram')"
              class="text-xs font-bold text-[#024731] hover:underline cursor-pointer">Save</button>
            <button v-else @click="isEditingSocial.instagram = true"
              class="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer">
              {{ socialHandles.instagram ? 'Edit' : '+ Add' }}
            </button>
          </div>

          <!-- TikTok -->
          <div class="flex items-center justify-between gap-4 py-1.5 border-b border-slate-50">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div class="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0">
                <iconify-icon icon="simple-icons:tiktok" class="text-white text-xs"></iconify-icon>
              </div>
              <div class="flex-1 min-w-0">
                <span class="text-xs font-bold text-slate-800">TikTok</span>
                <input v-if="isEditingSocial.tiktok" type="text" v-model="tempSocial.tiktok" placeholder="@username"
                  class="w-full mt-1 px-3 py-1 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#024731]" />
                <p v-else-if="socialHandles.tiktok" class="text-slate-500 text-[11px] truncate mt-0.5 font-semibold">{{
                  socialHandles.tiktok }}</p>
              </div>
            </div>
            <button v-if="isEditingSocial.tiktok" @click="saveSocial('tiktok')"
              class="text-xs font-bold text-[#024731] hover:underline cursor-pointer">Save</button>
            <button v-else @click="isEditingSocial.tiktok = true"
              class="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer">
              {{ socialHandles.tiktok ? 'Edit' : '+ Add' }}
            </button>
          </div>

          <!-- X -->
          <div class="flex items-center justify-between gap-4 py-1.5 border-b border-slate-50">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div class="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0">
                <iconify-icon icon="simple-icons:x" class="text-white text-xs"></iconify-icon>
              </div>
              <div class="flex-1 min-w-0">
                <span class="text-xs font-bold text-slate-800">X (Twitter)</span>
                <input v-if="isEditingSocial.x" type="text" v-model="tempSocial.x" placeholder="@username"
                  class="w-full mt-1 px-3 py-1 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#024731]" />
                <p v-else-if="socialHandles.x" class="text-slate-500 text-[11px] truncate mt-0.5 font-semibold">{{
                  socialHandles.x }}</p>
              </div>
            </div>
            <button v-if="isEditingSocial.x" @click="saveSocial('x')"
              class="text-xs font-bold text-[#024731] hover:underline cursor-pointer">Save</button>
            <button v-else @click="isEditingSocial.x = true"
              class="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer">
              {{ socialHandles.x ? 'Edit' : '+ Add' }}
            </button>
          </div>

          <!-- Facebook -->
          <div class="flex items-center justify-between gap-4 py-1.5 border-b border-slate-50">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div class="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center shrink-0">
                <iconify-icon icon="simple-icons:facebook" class="text-white text-sm"></iconify-icon>
              </div>
              <div class="flex-1 min-w-0">
                <span class="text-xs font-bold text-slate-800">Facebook</span>
                <input v-if="isEditingSocial.facebook" type="text" v-model="tempSocial.facebook"
                  placeholder="profile URL"
                  class="w-full mt-1 px-3 py-1 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#024731]" />
                <p v-else-if="socialHandles.facebook" class="text-slate-500 text-[11px] truncate mt-0.5 font-semibold">
                  {{
                    socialHandles.facebook }}</p>
              </div>
            </div>
            <button v-if="isEditingSocial.facebook" @click="saveSocial('facebook')"
              class="text-xs font-bold text-[#024731] hover:underline cursor-pointer">Save</button>
            <button v-else @click="isEditingSocial.facebook = true"
              class="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer">
              {{ socialHandles.facebook ? 'Edit' : '+ Add' }}
            </button>
          </div>

          <!-- Linktree -->
          <div class="flex items-center justify-between gap-4 py-1.5 border-b border-slate-50">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div class="w-8 h-8 rounded-full bg-[#25C960] flex items-center justify-center shrink-0">
                <iconify-icon icon="simple-icons:linktree" class="text-white text-sm"></iconify-icon>
              </div>
              <div class="flex-1 min-w-0">
                <span class="text-xs font-bold text-slate-800">Linktree</span>
                <input v-if="isEditingSocial.linktree" type="text" v-model="tempSocial.linktree"
                  placeholder="linktree URL"
                  class="w-full mt-1 px-3 py-1 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#024731]" />
                <p v-else-if="socialHandles.linktree" class="text-slate-500 text-[11px] truncate mt-0.5 font-semibold">{{
                  socialHandles.linktree }}</p>
              </div>
            </div>
            <button v-if="isEditingSocial.linktree" @click="saveSocial('linktree')"
              class="text-xs font-bold text-[#024731] hover:underline cursor-pointer">Save</button>
            <button v-else @click="isEditingSocial.linktree = true"
              class="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer">
              {{ socialHandles.linktree ? 'Edit' : '+ Add' }}
            </button>
          </div>

          <!-- YouTube -->
          <div class="flex items-center justify-between gap-4 py-1.5 border-b border-slate-50">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div class="w-8 h-8 rounded-full bg-[#FF0000] flex items-center justify-center shrink-0">
                <iconify-icon icon="simple-icons:youtube" class="text-white text-sm"></iconify-icon>
              </div>
              <div class="flex-1 min-w-0">
                <span class="text-xs font-bold text-slate-800">YouTube</span>
                <input v-if="isEditingSocial.youtube" type="text" v-model="tempSocial.youtube"
                  placeholder="channel name"
                  class="w-full mt-1 px-3 py-1 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#024731]" />
                <p v-else-if="socialHandles.youtube" class="text-slate-500 text-[11px] truncate mt-0.5 font-semibold">{{
                  socialHandles.youtube }}</p>
              </div>
            </div>
            <button v-if="isEditingSocial.youtube" @click="saveSocial('youtube')"
              class="text-xs font-bold text-[#024731] hover:underline cursor-pointer">Save</button>
            <button v-else @click="isEditingSocial.youtube = true"
              class="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer">
              {{ socialHandles.youtube ? 'Edit' : '+ Add' }}
            </button>
          </div>

          <!-- LinkedIn -->
          <div class="flex items-center justify-between gap-4 py-1.5 border-b border-slate-50">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div class="w-8 h-8 rounded-full bg-[#0A66C2] flex items-center justify-center shrink-0">
                <iconify-icon icon="simple-icons:linkedin" class="text-white text-sm"></iconify-icon>
              </div>
              <div class="flex-1 min-w-0">
                <span class="text-xs font-bold text-slate-800">LinkedIn</span>
                <input v-if="isEditingSocial.linkedin" type="text" v-model="tempSocial.linkedin"
                  placeholder="profile URL"
                  class="w-full mt-1 px-3 py-1 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#024731]" />
                <p v-else-if="socialHandles.linkedin" class="text-slate-500 text-[11px] truncate mt-0.5 font-semibold">
                  {{
                    socialHandles.linkedin }}</p>
              </div>
            </div>
            <button v-if="isEditingSocial.linkedin" @click="saveSocial('linkedin')"
              class="text-xs font-bold text-[#024731] hover:underline cursor-pointer">Save</button>
            <button v-else @click="isEditingSocial.linkedin = true"
              class="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer">
              {{ socialHandles.linkedin ? 'Edit' : '+ Add' }}
            </button>
          </div>

          <!-- Twitch -->
          <div class="flex items-center justify-between gap-4 py-1.5 border-b border-slate-50">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div class="w-8 h-8 rounded-full bg-[#9146FF] flex items-center justify-center shrink-0">
                <iconify-icon icon="simple-icons:twitch" class="text-white text-xs"></iconify-icon>
              </div>
              <div class="flex-1 min-w-0">
                <span class="text-xs font-bold text-slate-800">Twitch</span>
                <input v-if="isEditingSocial.twitch" type="text" v-model="tempSocial.twitch" placeholder="username"
                  class="w-full mt-1 px-3 py-1 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#024731]" />
                <p v-else-if="socialHandles.twitch" class="text-slate-500 text-[11px] truncate mt-0.5 font-semibold">{{
                  socialHandles.twitch }}</p>
              </div>
            </div>
            <button v-if="isEditingSocial.twitch" @click="saveSocial('twitch')"
              class="text-xs font-bold text-[#024731] hover:underline cursor-pointer">Save</button>
            <button v-else @click="isEditingSocial.twitch = true"
              class="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer">
              {{ socialHandles.twitch ? 'Edit' : '+ Add' }}
            </button>
          </div>

          <!-- Pillar -->
          <div class="flex items-center justify-between gap-4 py-1.5">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div
                class="w-8 h-8 rounded-full bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 flex items-center justify-center shrink-0">
                <iconify-icon icon="lucide:link-2" class="text-slate-800 text-sm"></iconify-icon>
              </div>
              <div class="flex-1 min-w-0">
                <span class="text-xs font-bold text-slate-800">Pillar</span>
                <input v-if="isEditingSocial.pillar" type="text" v-model="tempSocial.pillar" placeholder="pillar page"
                  class="w-full mt-1 px-3 py-1 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#024731]" />
                <p v-else-if="socialHandles.pillar" class="text-slate-500 text-[11px] truncate mt-0.5 font-semibold">{{
                  socialHandles.pillar }}</p>
              </div>
            </div>
            <button v-if="isEditingSocial.pillar" @click="saveSocial('pillar')"
              class="text-xs font-bold text-[#024731] hover:underline cursor-pointer">Save</button>
            <button v-else @click="isEditingSocial.pillar = true"
              class="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer">
              {{ socialHandles.pillar ? 'Edit' : '+ Add' }}
            </button>
          </div>

        </div>

        <!-- Done Footer button -->
        <div class="border-t border-slate-50 pt-4 flex justify-end">
          <button @click="showSocialModal = false"
            class="bg-[#0f2e24] hover:bg-[#1a3f33] text-white text-xs font-bold py-2.5 px-6 rounded-full cursor-pointer">
            Done
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.curved-mask-1 {
  clip-path: ellipse(80% 100% at 50% 0%);
}
</style>
