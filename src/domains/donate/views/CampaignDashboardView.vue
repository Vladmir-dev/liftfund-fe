<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLandingStore } from '../../landing/stores'
import { storeToRefs } from 'pinia'
import { campaignService } from '../../../services/campaign'
import { Notify } from '../../../utils/notify'
import NavHeader from '../../landing/components/NavHeader.vue'
import MainFooter from '../../landing/components/MainFooter.vue'

// Import subcomponents
import TodayTab from '../components/TodayTab.vue'
import SupportersTab from '../components/SupportersTab.vue'
import SharehubTab from '../components/SharehubTab.vue'
import FundraiserTab from '../components/FundraiserTab.vue'
import TransfersTab from '../components/TransfersTab.vue'
import UpdatesTab from '../components/UpdatesTab.vue'

interface DashboardCampaign {
  id: string
  title: string
  story?: string
  location?: string
  targetAmount: number
  raisedAmount: number
  currency: string
  imageUrl: string
  organizer: string
  category: string
  likeCount: number
  shareCount: number
  donorCount: number
  isPublished?: boolean
}

const route = useRoute()
const router = useRouter()
const landingStore = useLandingStore()
const { fundraisers } = storeToRefs(landingStore)

const campaignId = ref(route.params.id as string)
const isLoading = ref(true)
const dashboardCampaign = ref<DashboardCampaign | null>(null)

// Left sidebar options: 'today' | 'supporters' | 'transfers' | 'updates' | 'sharehub' | 'fundraiser'
const activeTab = ref<'today' | 'supporters' | 'transfers' | 'updates' | 'sharehub' | 'fundraiser'>('today')

// Modal states
const showUpdateModal = ref(false)
const showTransfersModal = ref(false)

// Edit Fundraiser Modal states
const showEditModal = ref(false)
const editTitle = ref('')
const editStory = ref('')
const editLocation = ref('')
const editCoverUrl = ref('')
const isUploadingImage = ref(false)
const isSavingCampaign = ref(false)
const editFileInputRef = ref<HTMLInputElement | null>(null)

const openEditModal = () => {
  if (fundraiser.value) {
    editTitle.value = fundraiser.value.title || ''
    editStory.value = fundraiser.value.story || ''
    editLocation.value = fundraiser.value.location || ''
    editCoverUrl.value = fundraiser.value.imageUrl || ''
  }
  showEditModal.value = true
}

const triggerImageUpload = () => {
  editFileInputRef.value?.click()
}

const handleImageFile = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  isUploadingImage.value = true
  try {
    const res = await campaignService.uploadImage(file)
    if (res && res.url) {
      editCoverUrl.value = res.url
      Notify.success('Cover image uploaded successfully!')
    }
  } catch (err: any) {
    Notify.failure('Failed to upload image')
  } finally {
    isUploadingImage.value = false
  }
}

const handleSaveCampaign = async () => {
  if (!editTitle.value.trim()) return
  isSavingCampaign.value = true
  try {
    await campaignService.updateCampaign(campaignId.value, {
      title: editTitle.value.trim(),
      story: editStory.value.trim(),
      location: editLocation.value.trim(),
      coverImageUrl: editCoverUrl.value,
    })
    if (dashboardCampaign.value) {
      dashboardCampaign.value.title = editTitle.value.trim()
      dashboardCampaign.value.story = editStory.value.trim()
      dashboardCampaign.value.location = editLocation.value.trim()
      dashboardCampaign.value.imageUrl = editCoverUrl.value
    }
    showEditModal.value = false
    Notify.success('Fundraiser updated successfully!')
  } catch (err: any) {
    Notify.failure(err.message || 'Failed to update fundraiser')
  } finally {
    isSavingCampaign.value = false
  }
}

// Header view dropdowns
const navHeaderRef = ref<any>(null)
const closeDropdowns = () => {
  navHeaderRef.value?.closeDropdowns()
}

// Copy link action Toast
const showToast = ref(false)
const toastMessage = ref('')
const copyLink = () => {
  const link = `${window.location.origin}/campaign/${campaignId.value}`
  navigator.clipboard.writeText(link)
  Notify.info('Campaign link copied to clipboard!')
}

const loadDashboardData = async () => {
  isLoading.value = true
  try {
    const detail = await campaignService.getCampaignDetail(campaignId.value)
    if (detail && detail.campaign) {
      const c = detail.campaign
      let coverUrl = 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&q=80&w=600'
      if (typeof c.coverImageUrl === 'string' && c.coverImageUrl) {
        coverUrl = c.coverImageUrl
      } else if (typeof c.coverImageUrl === 'object' && c.coverImageUrl?.Valid && c.coverImageUrl.String) {
        coverUrl = c.coverImageUrl.String
      }

      let locStr = ''
      if (typeof c.location === 'string') locStr = c.location
      else if (typeof c.location === 'object' && c.location?.Valid && c.location.String) locStr = c.location.String

      dashboardCampaign.value = {
        id: c.id,
        title: c.title,
        story: c.story || '',
        location: locStr,
        targetAmount: Number(c.goalAmount || 0),
        raisedAmount: Number(c.raisedAmount || 0),
        currency: c.currency || 'UGX',
        imageUrl: coverUrl,
        organizer: c.ownerName || 'Campaign Organizer',
        category: detail.categories?.[0]?.name || 'General',
        likeCount: detail.likeCount || 0,
        shareCount: detail.shareCount || 0,
        donorCount: c.donorCount || 0,
        isPublished: c.status === 'active',
      }

      // Fetch donor count
      try {
        const donations = await campaignService.listCampaignDonations(c.id)
        if (donations && dashboardCampaign.value) {
          dashboardCampaign.value.donorCount = donations.length
        }
      } catch (err) {
        console.warn('Could not count donations:', err)
      }
    }
  } catch (err) {
    console.warn('Could not load backend campaign details:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadDashboardData()
})

const fundraiser = computed<DashboardCampaign | null>(() => {
  if (dashboardCampaign.value) return dashboardCampaign.value
  const found = fundraisers.value.find((f) => f.id === campaignId.value)
  if (found) {
    return {
      id: found.id,
      title: found.title,
      targetAmount: found.targetAmount,
      raisedAmount: found.raisedAmount,
      currency: 'UGX',
      imageUrl: found.imageUrl,
      organizer: found.organizer,
      category: found.category,
      likeCount: 0,
      shareCount: 0,
      donorCount: 0,
      isPublished: true,
    }
  }
  return null
})

const handlePostUpdate = (text: string) => {
  toastMessage.value = 'Update sent to donors!'
  showToast.value = true
  showUpdateModal.value = false
  setTimeout(() => {
    showToast.value = false
  }, 2500)
}
</script>

<template>
  <div v-if="isLoading" class="min-h-screen bg-slate-50 flex items-center justify-center">
    <div class="flex flex-col items-center gap-3">
      <div class="h-8 w-8 border-3 border-[#024731] border-t-transparent rounded-full animate-spin"></div>
      <p class="text-xs font-bold text-slate-500">Loading campaign dashboard...</p>
    </div>
  </div>

  <div v-else-if="fundraiser" class="min-h-screen bg-slate-50 text-slate-800 font-sans text-left flex flex-col"
    @click="closeDropdowns">
    <NavHeader ref="navHeaderRef" />

    <!-- Core Content Container: Sidebar + Dashboard body -->
    <div class="max-w-7xl w-full mx-auto px-4 py-8 lg:py-12 flex-grow flex flex-col md:flex-row gap-8 items-start">

      <!-- Left Sidebar Navigation -->
      <aside class="w-full md:w-64 shrink-0 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
        <ul class="flex flex-col gap-1.5 text-xs font-bold text-slate-500">
          <li>
            <button @click="activeTab = 'today'"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer text-left"
              :class="activeTab === 'today' ? 'bg-[#edfce0] text-[#024731] border-l-4 border-[#024731] font-extrabold' : 'hover:bg-slate-50 hover:text-slate-800'">
              <iconify-icon icon="ph:check-circle-bold" class="text-base" :class="activeTab === 'today' ? 'text-[#024731]' : 'text-slate-400'"></iconify-icon>
              <span>Today Overview</span>
            </button>
          </li>
          <li>
            <button @click="activeTab = 'supporters'"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer text-left"
              :class="activeTab === 'supporters' ? 'bg-[#edfce0] text-[#024731] border-l-4 border-[#024731] font-extrabold' : 'hover:bg-slate-50 hover:text-slate-800'">
              <iconify-icon icon="ph:users-bold" class="text-base" :class="activeTab === 'supporters' ? 'text-[#024731]' : 'text-slate-400'"></iconify-icon>
              <span>Supporters</span>
            </button>
          </li>
          <li>
            <button @click="activeTab = 'transfers'"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer text-left"
              :class="activeTab === 'transfers' ? 'bg-[#edfce0] text-[#024731] border-l-4 border-[#024731] font-extrabold' : 'hover:bg-slate-50 hover:text-slate-800'">
              <iconify-icon icon="ph:bank-bold" class="text-base" :class="activeTab === 'transfers' ? 'text-[#024731]' : 'text-slate-400'"></iconify-icon>
              <span>Transfers & Payouts</span>
            </button>
          </li>
          <li>
            <button @click="activeTab = 'updates'"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer text-left"
              :class="activeTab === 'updates' ? 'bg-[#edfce0] text-[#024731] border-l-4 border-[#024731] font-extrabold' : 'hover:bg-slate-50 hover:text-slate-800'">
              <iconify-icon icon="ph:newspaper-bold" class="text-base" :class="activeTab === 'updates' ? 'text-[#024731]' : 'text-slate-400'"></iconify-icon>
              <span>Updates</span>
            </button>
          </li>
          <li>
            <button @click="activeTab = 'sharehub'"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer text-left"
              :class="activeTab === 'sharehub' ? 'bg-[#edfce0] text-[#024731] border-l-4 border-[#024731] font-extrabold' : 'hover:bg-slate-50 hover:text-slate-800'">
              <iconify-icon icon="ph:megaphone-bold" class="text-base" :class="activeTab === 'sharehub' ? 'text-[#024731]' : 'text-slate-400'"></iconify-icon>
              <span>Sharehub</span>
            </button>
          </li>
          <li>
            <button @click="activeTab = 'fundraiser'"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer text-left"
              :class="activeTab === 'fundraiser' ? 'bg-[#edfce0] text-[#024731] border-l-4 border-[#024731] font-extrabold' : 'hover:bg-slate-50 hover:text-slate-800'">
              <iconify-icon icon="ph:heart-bold" class="text-base" :class="activeTab === 'fundraiser' ? 'text-[#024731]' : 'text-slate-400'"></iconify-icon>
              <span>Fundraiser Settings</span>
            </button>
          </li>
        </ul>
      </aside>

      <!-- Right Dashboard Panel -->
      <div class="flex-grow flex flex-col gap-6 w-full">

        <!-- Welcome banner -->
        <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center justify-between gap-4">
          <div class="text-xs text-slate-500 font-bold text-left">
            HI, {{ fundraiser.organizer.split(' ')[0] }} &bull; <span class="text-slate-400">Managing {{ fundraiser.title }}</span>
          </div>
          <div class="flex items-center gap-2.5">
            <button @click="openEditModal"
              class="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs px-4 py-2 rounded-full transition-all shadow-sm flex items-center gap-1.5 cursor-pointer">
              <iconify-icon icon="ph:pencil-simple-bold" class="text-sm"></iconify-icon>
              <span>Edit fundraiser</span>
            </button>
            <RouterLink :to="`/campaign/${fundraiser.id}`"
              class="bg-[#024731] hover:bg-[#013424] text-white font-bold text-xs px-5 py-2 rounded-full transition-all shadow-sm flex items-center gap-1.5">
              <span>View live page</span>
              <iconify-icon icon="ph:arrow-square-out-bold" class="text-xs"></iconify-icon>
            </RouterLink>
          </div>
        </div>

        <!-- Render subcomponent corresponding to active tab -->
        <TodayTab 
          v-if="activeTab === 'today'" 
          :title="fundraiser.title" 
          :targetAmount="fundraiser.targetAmount"
          :raisedAmount="fundraiser.raisedAmount" 
          :currency="fundraiser.currency"
          :imageUrl="fundraiser.imageUrl"
          :organizer="fundraiser.organizer"
          :donorCount="fundraiser.donorCount"
          :shareCount="fundraiser.shareCount"
          :likeCount="fundraiser.likeCount"
          @share="activeTab = 'sharehub'"
        />

        <SupportersTab 
          v-else-if="activeTab === 'supporters'" 
          :campaignId="fundraiser.id"
          :currency="fundraiser.currency"
          @copy-link="copyLink"
        />

        <TransfersTab 
          v-else-if="activeTab === 'transfers'" 
          :campaignId="fundraiser.id"
          :raisedAmount="fundraiser.raisedAmount" 
          :currency="fundraiser.currency"
        />

        <UpdatesTab 
          v-else-if="activeTab === 'updates'" 
          :campaignId="fundraiser.id"
          @postUpdate="handlePostUpdate"
        />

        <SharehubTab 
          v-else-if="activeTab === 'sharehub'" 
          :campaignId="fundraiser.id"
          :title="fundraiser.title"
          :organizer="fundraiser.organizer"
          :imageUrl="fundraiser.imageUrl"
          @copy-link="copyLink"
        />

        <FundraiserTab 
          v-else-if="activeTab === 'fundraiser'" 
          :campaignId="fundraiser.id"
          :title="fundraiser.title"
          :imageUrl="fundraiser.imageUrl"
          @post-update="activeTab = 'updates'"
          @transfers="activeTab = 'transfers'"
          @edit="openEditModal"
        />

      </div>

    </div>

    <!-- Modals Overlay -->
    <!-- Post Update Modal -->
    <div v-if="showUpdateModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4" @click.self="showUpdateModal = false">
      <div class="bg-white rounded-3xl w-full max-w-xl p-8 border border-slate-100 shadow-2xl relative overflow-y-auto max-h-[85vh] text-left animate-scale">
        <button @click="showUpdateModal = false" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xl focus:outline-none cursor-pointer">
          <iconify-icon icon="ph:x-bold"></iconify-icon>
        </button>
        <UpdatesTab :campaignId="fundraiser.id" @postUpdate="handlePostUpdate" />
      </div>
    </div>

    <!-- Transfers Modal -->
    <div v-if="showTransfersModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4" @click.self="showTransfersModal = false">
      <div class="bg-white rounded-3xl w-full max-w-2xl p-8 border border-slate-100 shadow-2xl relative overflow-y-auto max-h-[85vh] text-left animate-scale">
        <button @click="showTransfersModal = false" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xl focus:outline-none cursor-pointer">
          <iconify-icon icon="ph:x-bold"></iconify-icon>
        </button>
        <TransfersTab :campaignId="fundraiser.id" :raisedAmount="fundraiser.raisedAmount" :currency="fundraiser.currency" />
      </div>
    </div>

    <!-- Edit Fundraiser Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4" @click.self="showEditModal = false">
      <div class="bg-white rounded-3xl w-full max-w-xl p-8 border border-slate-100 shadow-2xl relative overflow-y-auto max-h-[90vh] text-left animate-scale">
        <button @click="showEditModal = false" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xl focus:outline-none cursor-pointer">
          <iconify-icon icon="ph:x-bold"></iconify-icon>
        </button>

        <h3 class="text-xl font-black text-slate-900 mb-1">Edit Fundraiser</h3>
        <p class="text-xs text-slate-500 font-semibold mb-6">Update your fundraiser details, story, or cover image.</p>

        <form @submit.prevent="handleSaveCampaign" class="flex flex-col gap-5">
          <!-- Cover Image Section -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-2">Cover Image</label>
            <div class="relative w-full h-44 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group">
              <img :src="editCoverUrl || fundraiser.imageUrl" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button type="button" @click="triggerImageUpload" :disabled="isUploadingImage"
                  class="bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs px-4 py-2 rounded-full shadow-md flex items-center gap-1.5 cursor-pointer">
                  <span v-if="isUploadingImage" class="h-3.5 w-3.5 border-2 border-slate-800 border-t-transparent rounded-full animate-spin"></span>
                  <iconify-icon v-else icon="ph:camera-bold" class="text-sm"></iconify-icon>
                  <span>Change Image</span>
                </button>
              </div>
            </div>
            <input type="file" ref="editFileInputRef" @change="handleImageFile" accept="image/*" class="hidden" />
            <div class="flex items-center justify-between mt-2">
              <span class="text-[11px] text-slate-400">JPG, PNG, or WebP (max 10MB)</span>
              <button type="button" @click="triggerImageUpload" :disabled="isUploadingImage"
                class="text-xs font-bold text-[#024731] hover:underline flex items-center gap-1 cursor-pointer">
                <iconify-icon icon="ph:upload-simple-bold"></iconify-icon>
                <span>Upload new photo</span>
              </button>
            </div>
          </div>

          <!-- Title input -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5">Fundraiser Title</label>
            <input v-model="editTitle" required type="text"
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#024731] focus:bg-white" />
          </div>

          <!-- Location input -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5">Location</label>
            <input v-model="editLocation" type="text" placeholder="e.g. Kampala, Uganda"
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#024731] focus:bg-white" />
          </div>

          <!-- Story textarea -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5">Fundraiser Story / Description</label>
            <textarea v-model="editStory" rows="5" placeholder="Share why you are raising funds..."
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#024731] focus:bg-white resize-none"></textarea>
          </div>

          <!-- Modal Action Buttons -->
          <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button type="button" @click="showEditModal = false"
              class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-full cursor-pointer">
              Cancel
            </button>
            <button type="submit" :disabled="isSavingCampaign || !editTitle.trim()"
              class="px-6 py-2.5 bg-[#024731] hover:bg-[#013424] text-white font-bold text-xs rounded-full shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50">
              <span v-if="isSavingCampaign" class="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <MainFooter />
  </div>

  <div v-else class="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
    <iconify-icon icon="ph:warning-bold" class="text-amber-500 text-5xl mb-4"></iconify-icon>
    <h3 class="text-xl font-bold text-slate-900 mb-2">Fundraiser Not Found</h3>
    <p class="text-xs text-slate-500 mb-6 font-semibold">We could not locate this campaign in your dashboard.</p>
    <RouterLink to="/"
      class="px-5 py-2.5 bg-[#024731] text-white font-bold text-xs rounded-full shadow hover:bg-[#013424] transition-all">
      Return Home
    </RouterLink>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fadeIn 0.25s ease-out forwards;
}
@keyframes scale {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-scale {
  animation: scale 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
