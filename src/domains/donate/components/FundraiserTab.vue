<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  campaignService,
  type CampaignTeamMember,
  type CampaignImage,
} from '../../../services/campaign'
import { Notify } from '../../../utils/notify'

const props = defineProps<{
  campaignId: string
  title: string
  imageUrl: string
  status?: string
}>()

const emit = defineEmits<{
  (e: 'post-update'): void
  (e: 'transfers'): void
  (e: 'edit'): void
  (e: 'status-changed', newStatus: string): void
}>()

const router = useRouter()

const handlePreview = () => {
  router.push(`/campaign/${props.campaignId}`)
}

// -------------------------------------------------------------
// Team State & Handlers
// -------------------------------------------------------------
const teamMembers = ref<CampaignTeamMember[]>([])
const isLoadingTeam = ref(false)
const showTeamModal = ref(false)

const inviteEmail = ref('')
const inviteRole = ref('co-organizer')
const isInviting = ref(false)
const inviteError = ref('')

const memberToRemove = ref<CampaignTeamMember | null>(null)
const isRemoving = ref(false)

const fetchTeam = async () => {
  isLoadingTeam.value = true
  try {
    const list = await campaignService.listTeamMembers(props.campaignId)
    teamMembers.value = list
  } catch (err) {
    console.warn('Failed to load team members:', err)
  } finally {
    isLoadingTeam.value = false
  }
}

const handleAddMember = async () => {
  const email = inviteEmail.value.trim()
  if (!email) {
    inviteError.value = 'Please enter an email address'
    return
  }
  isInviting.value = true
  inviteError.value = ''
  try {
    await campaignService.addTeamMember({
      campaignId: props.campaignId,
      email,
      role: inviteRole.value,
    })
    Notify.success('Co-organizer added successfully!')
    inviteEmail.value = ''
    await fetchTeam()
  } catch (err: any) {
    inviteError.value = err.message || 'Failed to add co-organizer. Please verify they are registered.'
    Notify.failure(inviteError.value)
  } finally {
    isInviting.value = false
  }
}

const promptRemoveMember = (m: CampaignTeamMember) => {
  memberToRemove.value = m
}

const confirmRemoveMember = async () => {
  if (!memberToRemove.value) return
  const m = memberToRemove.value
  isRemoving.value = true
  try {
    await campaignService.removeTeamMember(props.campaignId, m.userId)
    teamMembers.value = teamMembers.value.filter((item) => item.userId !== m.userId)
    Notify.success('Co-organizer removed.')
    memberToRemove.value = null
  } catch (err: any) {
    Notify.failure(err.message || 'Failed to remove team member')
  } finally {
    isRemoving.value = false
  }
}

// -------------------------------------------------------------
// Media Gallery State & Handlers
// -------------------------------------------------------------
const galleryImages = ref<CampaignImage[]>([])
const isLoadingGallery = ref(false)
const showGalleryModal = ref(false)
const mediaFileInputRef = ref<HTMLInputElement | null>(null)
const isUploadingMedia = ref(false)

const imageToDelete = ref<CampaignImage | null>(null)
const isDeletingImage = ref(false)

const fetchGallery = async () => {
  isLoadingGallery.value = true
  try {
    const list = await campaignService.listCampaignImages(props.campaignId)
    galleryImages.value = list
  } catch (err) {
    console.warn('Failed to load campaign images:', err)
  } finally {
    isLoadingGallery.value = false
  }
}

const triggerMediaUpload = () => {
  mediaFileInputRef.value?.click()
}

const handleMediaFileSelected = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  isUploadingMedia.value = true
  try {
    const uploadRes = await campaignService.uploadImage(file)
    if (uploadRes && uploadRes.url) {
      await campaignService.createCampaignImage({
        campaignId: props.campaignId,
        url: uploadRes.url,
        mediaType: file.type.startsWith('video') ? 'video' : 'image',
        sortOrder: galleryImages.value.length,
      })
      Notify.success('Photo added to campaign gallery!')
      await fetchGallery()
    }
  } catch (err: any) {
    Notify.failure(err.message || 'Failed to upload photo')
  } finally {
    isUploadingMedia.value = false
    if (target) target.value = ''
  }
}

const promptDeleteImage = (img: CampaignImage) => {
  imageToDelete.value = img
}

const confirmDeleteImage = async () => {
  if (!imageToDelete.value) return
  isDeletingImage.value = true
  try {
    await campaignService.deleteCampaignImage(props.campaignId, imageToDelete.value.id)
    galleryImages.value = galleryImages.value.filter((img) => img.id !== imageToDelete.value!.id)
    Notify.success('Photo removed from gallery.')
    imageToDelete.value = null
  } catch (err: any) {
    Notify.failure(err.message || 'Failed to delete photo')
  } finally {
    isDeletingImage.value = false
  }
}

// -------------------------------------------------------------
// Fundraiser Settings & Lifecycle State & Handlers
// -------------------------------------------------------------
const showSettingsModal = ref(false)
const selectedStatus = ref<'active' | 'paused' | 'completed'>(
  (props.status as any) || 'active'
)
const isSavingSettings = ref(false)

const showDeleteConfirmModal = ref(false)
const isDeletingCampaign = ref(false)

const handleSaveSettings = async () => {
  isSavingSettings.value = true
  try {
    await campaignService.updateCampaign(props.campaignId, {
      status: selectedStatus.value,
    })
    Notify.success(`Campaign status updated to "${selectedStatus.value}".`)
    emit('status-changed', selectedStatus.value)
    showSettingsModal.value = false
  } catch (err: any) {
    Notify.failure(err.message || 'Failed to update campaign status')
  } finally {
    isSavingSettings.value = false
  }
}

const handleDeleteCampaign = async () => {
  isDeletingCampaign.value = true
  try {
    await campaignService.deleteCampaign(props.campaignId)
    Notify.success('Fundraiser has been deleted.')
    showDeleteConfirmModal.value = false
    showSettingsModal.value = false
    router.push('/my-fundraisers')
  } catch (err: any) {
    Notify.failure(err.message || 'Failed to delete fundraiser')
  } finally {
    isDeletingCampaign.value = false
  }
}

onMounted(() => {
  fetchTeam()
  fetchGallery()
})
</script>

<template>
  <div class="flex flex-col gap-6 text-slate-800 animate-fade-in text-left">

    <!-- Header Row -->
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-black text-slate-900">Fundraiser</h2>
      <button
        @click="showTeamModal = true"
        class="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-full shadow-xs flex items-center gap-1.5 cursor-pointer">
        <iconify-icon icon="ph:user-plus-bold" class="text-sm"></iconify-icon>
        <span>Invite co-organizers</span>
      </button>
    </div>

    <!-- Fundraiser Card -->
    <div class="bg-white border border-slate-150 rounded-3xl p-5 shadow-xs flex items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <!-- Circular avatar/logo -->
        <div class="w-14 h-14 rounded-full overflow-hidden bg-slate-100 border border-slate-100 shadow-sm shrink-0">
          <img :src="imageUrl" class="w-full h-full object-cover" />
        </div>
        <div>
          <div class="flex items-center gap-2 mb-0.5">
            <h4 class="font-extrabold text-slate-900 text-sm leading-snug">{{ title }}</h4>
            <span
              class="text-[10px] font-extrabold px-2 py-0.5 rounded-full capitalize"
              :class="selectedStatus === 'active' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : selectedStatus === 'paused' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-700'">
              {{ selectedStatus }}
            </span>
          </div>
          <button @click="handlePreview"
            class="text-[11px] text-slate-500 hover:text-slate-800 font-semibold underline flex items-center gap-1 cursor-pointer">
            <span>Preview fundraiser</span>
            <iconify-icon icon="ph:arrow-right-bold" class="text-[10px]"></iconify-icon>
          </button>
        </div>
      </div>
    </div>

    <!-- Two primary buttons -->
    <div class="flex flex-col sm:flex-row gap-3">
      <button @click="emit('post-update')"
        class="bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs py-3 rounded-2xl transition-all shadow-xs flex-1 flex items-center justify-center gap-2 cursor-pointer">
        <iconify-icon icon="ph:note-pencil-bold" class="text-sm"></iconify-icon>
        <span>Post update</span>
      </button>

      <button @click="emit('transfers')"
        class="bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs py-3 rounded-2xl transition-all shadow-xs flex-1 flex items-center justify-center gap-2 cursor-pointer">
        <iconify-icon icon="ph:bank-bold" class="text-sm"></iconify-icon>
        <span>Transfers</span>
      </button>
    </div>

    <!-- Vertical menu list -->
    <div class="flex flex-col gap-2.5">
      <!-- Edit fundraiser -->
      <div @click="emit('edit')"
        class="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group">
        <div class="flex items-center gap-3">
          <div
            class="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-100">
            <iconify-icon icon="ph:pencil-simple-bold" class="text-sm"></iconify-icon>
          </div>
          <span class="text-xs font-bold text-slate-700">Edit fundraiser details</span>
        </div>
        <iconify-icon icon="ph:caret-right-bold"
          class="text-slate-400 text-sm group-hover:translate-x-0.5 transition-transform"></iconify-icon>
      </div>

      <!-- Campaign Media Gallery -->
      <div @click="showGalleryModal = true"
        class="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group">
        <div class="flex items-center gap-3">
          <div
            class="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-700 border border-indigo-100">
            <iconify-icon icon="ph:images-bold" class="text-sm"></iconify-icon>
          </div>
          <div>
            <span class="text-xs font-bold text-slate-700 block">Campaign media gallery</span>
            <span class="text-[10px] text-slate-400 font-semibold">
              {{ galleryImages.length }} photo{{ galleryImages.length === 1 ? '' : 's' }} attached to story
            </span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span v-if="galleryImages.length > 0"
            class="text-[10px] font-extrabold px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
            {{ galleryImages.length }}
          </span>
          <iconify-icon icon="ph:caret-right-bold"
            class="text-slate-400 text-sm group-hover:translate-x-0.5 transition-transform"></iconify-icon>
        </div>
      </div>

      <!-- Manage Team & Co-organizers -->
      <div @click="showTeamModal = true"
        class="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group">
        <div class="flex items-center gap-3">
          <div
            class="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-[#024731] border border-emerald-100">
            <iconify-icon icon="ph:users-three-bold" class="text-sm"></iconify-icon>
          </div>
          <div>
            <span class="text-xs font-bold text-slate-700 block">Manage team & co-organizers</span>
            <span class="text-[10px] text-slate-400 font-semibold">
              {{ teamMembers.length }} co-organizer{{ teamMembers.length === 1 ? '' : 's' }} collaborating
            </span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span v-if="teamMembers.length > 0"
            class="text-[10px] font-extrabold px-2.5 py-0.5 bg-[#edfce0] text-[#024731] rounded-full border border-[#bbf770]/70">
            {{ teamMembers.length }}
          </span>
          <iconify-icon icon="ph:caret-right-bold"
            class="text-slate-400 text-sm group-hover:translate-x-0.5 transition-transform"></iconify-icon>
        </div>
      </div>

      <!-- Change fundraiser settings -->
      <div @click="showSettingsModal = true"
        class="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group">
        <div class="flex items-center gap-3">
          <div
            class="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-100">
            <iconify-icon icon="ph:gear-six-bold" class="text-sm"></iconify-icon>
          </div>
          <div>
            <span class="text-xs font-bold text-slate-700 block">Change fundraiser settings</span>
            <span class="text-[10px] text-slate-400 font-semibold">Status, pause donations, delete</span>
          </div>
        </div>
        <iconify-icon icon="ph:caret-right-bold"
          class="text-slate-400 text-sm group-hover:translate-x-0.5 transition-transform"></iconify-icon>
      </div>
    </div>

    <!-- Hidden file input for gallery upload -->
    <input
      type="file"
      ref="mediaFileInputRef"
      accept="image/*"
      class="hidden"
      @change="handleMediaFileSelected"
    />

    <!-- ============================================================= -->
    <!-- Media Gallery Modal -->
    <!-- ============================================================= -->
    <div v-if="showGalleryModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div
        class="bg-white rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl border border-slate-100 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center text-lg">
              <iconify-icon icon="ph:images-bold"></iconify-icon>
            </div>
            <div>
              <h3 class="text-base font-black text-slate-900 leading-tight">Story Media Gallery</h3>
              <p class="text-[11px] text-slate-500 font-medium">Extra photos displayed on your fundraiser story page</p>
            </div>
          </div>
          <button
            @click="showGalleryModal = false"
            class="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer">
            <iconify-icon icon="ph:x-bold" class="text-base"></iconify-icon>
          </button>
        </div>

        <!-- Upload Bar -->
        <div class="flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
          <div>
            <span class="text-xs font-black text-slate-900 block">Add New Photos</span>
            <span class="text-[11px] text-slate-500 font-medium">Upload high quality photos showing your cause</span>
          </div>
          <button
            @click="triggerMediaUpload"
            :disabled="isUploadingMedia"
            class="px-4 py-2 bg-[#024731] hover:bg-[#013424] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer">
            <span v-if="isUploadingMedia" class="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <iconify-icon v-else icon="ph:upload-simple-bold" class="text-sm"></iconify-icon>
            <span>Upload Photo</span>
          </button>
        </div>

        <!-- Photos Grid -->
        <div v-if="isLoadingGallery" class="p-8 text-center">
          <span class="h-5 w-5 border-2 border-[#024731] border-t-transparent rounded-full animate-spin inline-block mb-1"></span>
          <p class="text-xs text-slate-400 font-medium">Loading photos...</p>
        </div>

        <div v-else-if="galleryImages.length > 0" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div
            v-for="img in galleryImages"
            :key="img.id"
            class="group relative rounded-2xl overflow-hidden aspect-4/3 bg-slate-100 border border-slate-150 shadow-xs">
            <img :src="img.url" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div class="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                @click="promptDeleteImage(img)"
                class="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-red-600 flex items-center justify-center transition shadow-sm cursor-pointer"
                title="Delete photo">
                <iconify-icon icon="lucide:trash-2" class="text-sm"></iconify-icon>
              </button>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-10 border border-dashed border-slate-200 rounded-2xl bg-slate-50/40">
          <iconify-icon icon="ph:images-square-bold" class="text-slate-300 text-3xl mb-1"></iconify-icon>
          <p class="text-xs text-slate-700 font-bold mb-0.5">No gallery photos yet</p>
          <p class="text-[11px] text-slate-400 font-medium max-w-xs mx-auto">
            Add photos of your beneficiaries, progress, or events to inspire more donors.
          </p>
        </div>

      </div>
    </div>

    <!-- Delete Image Confirmation Modal -->
    <div v-if="imageToDelete"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div
        class="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-slate-100 flex flex-col items-center text-center">
        <div class="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-2xl mb-4">
          <iconify-icon icon="lucide:trash-2"></iconify-icon>
        </div>
        <h3 class="text-lg font-black text-slate-900 mb-1.5">Remove Photo?</h3>
        <p class="text-xs text-slate-500 font-medium leading-relaxed mb-6">
          Are you sure you want to remove this photo from your campaign story gallery?
        </p>
        <div class="grid grid-cols-2 gap-3 w-full">
          <button
            type="button"
            @click="imageToDelete = null"
            :disabled="isDeletingImage"
            class="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer">
            Cancel
          </button>
          <button
            type="button"
            @click="confirmDeleteImage"
            :disabled="isDeletingImage"
            class="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer">
            <span v-if="isDeletingImage"
              class="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>Remove</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ============================================================= -->
    <!-- Fundraiser Settings Modal -->
    <!-- ============================================================= -->
    <div v-if="showSettingsModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div
        class="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-lg">
              <iconify-icon icon="ph:gear-six-bold"></iconify-icon>
            </div>
            <div>
              <h3 class="text-base font-black text-slate-900 leading-tight">Fundraiser Settings</h3>
              <p class="text-[11px] text-slate-500 font-medium">Control campaign visibility and lifecycle</p>
            </div>
          </div>
          <button
            @click="showSettingsModal = false"
            class="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer">
            <iconify-icon icon="ph:x-bold" class="text-base"></iconify-icon>
          </button>
        </div>

        <!-- Status Management -->
        <div class="flex flex-col gap-3">
          <label class="text-xs font-black text-slate-900 uppercase tracking-wider">Campaign Status</label>
          <div class="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              @click="selectedStatus = 'active'"
              class="p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 cursor-pointer"
              :class="selectedStatus === 'active' ? 'bg-[#edfce0] border-[#024731] text-[#024731] font-black' : 'border-slate-200 text-slate-600 hover:bg-slate-50 font-bold'">
              <iconify-icon icon="ph:check-circle-bold" class="text-lg"></iconify-icon>
              <span class="text-xs">Active</span>
              <span class="text-[9px] text-slate-400 font-normal">Accepts donations</span>
            </button>

            <button
              type="button"
              @click="selectedStatus = 'paused'"
              class="p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 cursor-pointer"
              :class="selectedStatus === 'paused' ? 'bg-amber-50 border-amber-600 text-amber-800 font-black' : 'border-slate-200 text-slate-600 hover:bg-slate-50 font-bold'">
              <iconify-icon icon="ph:pause-circle-bold" class="text-lg"></iconify-icon>
              <span class="text-xs">Paused</span>
              <span class="text-[9px] text-slate-400 font-normal">Temporarily paused</span>
            </button>

            <button
              type="button"
              @click="selectedStatus = 'completed'"
              class="p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 cursor-pointer"
              :class="selectedStatus === 'completed' ? 'bg-blue-50 border-blue-600 text-blue-800 font-black' : 'border-slate-200 text-slate-600 hover:bg-slate-50 font-bold'">
              <iconify-icon icon="ph:flag-checkered-bold" class="text-lg"></iconify-icon>
              <span class="text-xs">Completed</span>
              <span class="text-[9px] text-slate-400 font-normal">Goal reached</span>
            </button>
          </div>

          <button
            @click="handleSaveSettings"
            :disabled="isSavingSettings"
            class="mt-2 py-3 px-5 bg-[#024731] hover:bg-[#013424] disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer">
            <span v-if="isSavingSettings" class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>Save Status Changes</span>
          </button>
        </div>

        <div class="border-t border-slate-100 my-1"></div>

        <!-- Danger Zone: Delete Campaign -->
        <div class="p-4 rounded-2xl border border-red-200 bg-red-50/50 flex flex-col gap-2.5">
          <div class="flex items-center gap-2 text-red-700">
            <iconify-icon icon="ph:warning-circle-bold" class="text-base"></iconify-icon>
            <span class="text-xs font-black uppercase tracking-wider">Danger Zone</span>
          </div>
          <p class="text-[11px] text-slate-600 font-medium leading-relaxed">
            Deleting this fundraiser will permanently remove it from public view and pause all incoming contributions.
          </p>
          <button
            @click="showDeleteConfirmModal = true"
            class="self-start px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer">
            <iconify-icon icon="lucide:trash-2" class="text-sm"></iconify-icon>
            <span>Delete Fundraiser</span>
          </button>
        </div>

      </div>
    </div>

    <!-- Delete Fundraiser Confirmation Modal -->
    <div v-if="showDeleteConfirmModal"
      class="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
      <div
        class="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-slate-100 flex flex-col items-center text-center">
        <div class="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-2xl mb-4">
          <iconify-icon icon="lucide:trash-2"></iconify-icon>
        </div>
        <h3 class="text-lg font-black text-slate-900 mb-1.5">Delete This Fundraiser?</h3>
        <p class="text-xs text-slate-500 font-medium leading-relaxed mb-6">
          This action cannot be undone. <strong class="text-slate-800">{{ title }}</strong> will be removed.
        </p>
        <div class="grid grid-cols-2 gap-3 w-full">
          <button
            type="button"
            @click="showDeleteConfirmModal = false"
            :disabled="isDeletingCampaign"
            class="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer">
            Cancel
          </button>
          <button
            type="button"
            @click="handleDeleteCampaign"
            :disabled="isDeletingCampaign"
            class="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer">
            <span v-if="isDeletingCampaign"
              class="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ============================================================= -->
    <!-- Team Members & Co-Organizers Modal -->
    <!-- ============================================================= -->
    <div v-if="showTeamModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div
        class="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-full bg-[#edfce0] text-[#024731] flex items-center justify-center text-lg">
              <iconify-icon icon="ph:users-three-bold"></iconify-icon>
            </div>
            <div>
              <h3 class="text-base font-black text-slate-900 leading-tight">Team & Co-Organizers</h3>
              <p class="text-[11px] text-slate-500 font-medium">Manage members collaborating on this fundraiser</p>
            </div>
          </div>
          <button
            @click="showTeamModal = false"
            class="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer">
            <iconify-icon icon="ph:x-bold" class="text-base"></iconify-icon>
          </button>
        </div>

        <!-- Invite New Member Form -->
        <div class="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-3">
          <h4 class="text-xs font-black text-slate-900 uppercase tracking-wider">Invite a Co-Organizer</h4>
          <p class="text-[11px] text-slate-500 font-medium leading-relaxed">
            Co-organizers can post campaign updates, view dashboard insights, and help spread your message.
          </p>

          <div v-if="inviteError" class="p-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-semibold">
            {{ inviteError }}
          </div>

          <div class="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              v-model="inviteEmail"
              placeholder="collaborator@example.com"
              :disabled="isInviting"
              class="flex-1 px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#024731]"
            />
            <select
              v-model="inviteRole"
              :disabled="isInviting"
              class="px-3 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#024731]">
              <option value="co-organizer">Co-organizer</option>
              <option value="member">Team Member</option>
            </select>
            <button
              @click="handleAddMember"
              :disabled="isInviting || !inviteEmail.trim()"
              class="px-4 py-2.5 bg-[#024731] hover:bg-[#013424] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer">
              <span v-if="isInviting" class="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Add</span>
            </button>
          </div>
        </div>

        <!-- Active Members List -->
        <div class="flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-black text-slate-900 uppercase tracking-wider">Current Team Members</h4>
            <span class="text-[10px] text-slate-400 font-bold">{{ teamMembers.length }} member{{ teamMembers.length === 1 ? '' : 's' }}</span>
          </div>

          <div v-if="isLoadingTeam" class="p-6 text-center">
            <span class="h-5 w-5 border-2 border-[#024731] border-t-transparent rounded-full animate-spin inline-block mb-1"></span>
            <p class="text-xs text-slate-400 font-medium">Loading team members...</p>
          </div>

          <div v-else-if="teamMembers.length > 0" class="flex flex-col gap-2">
            <div
              v-for="m in teamMembers"
              :key="m.id || m.userId"
              class="p-3.5 rounded-2xl border border-slate-150 bg-white flex items-center justify-between gap-3 shadow-xs">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-emerald-100 text-[#024731] flex items-center justify-center font-black text-xs shrink-0">
                  {{ ((m.userName || m.userEmail || 'C').charAt(0)).toUpperCase() }}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-extrabold text-xs text-slate-900">{{ m.userName || m.userEmail || 'Collaborator' }}</span>
                    <span class="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-800 font-bold rounded-full capitalize">
                      {{ m.role || 'Co-organizer' }}
                    </span>
                  </div>
                  <span v-if="m.userEmail && m.userName" class="text-[11px] text-slate-400 font-semibold block">
                    {{ m.userEmail }}
                  </span>
                </div>
              </div>

              <button
                @click="promptRemoveMember(m)"
                title="Remove co-organizer"
                class="text-slate-300 hover:text-red-600 transition-colors p-1.5 rounded-xl hover:bg-red-50 cursor-pointer">
                <iconify-icon icon="lucide:trash-2" class="text-sm"></iconify-icon>
              </button>
            </div>
          </div>

          <div v-else class="text-center py-8 border border-dashed border-slate-200 rounded-2xl bg-slate-50/40">
            <iconify-icon icon="ph:users-three-bold" class="text-slate-300 text-3xl mb-1"></iconify-icon>
            <p class="text-xs text-slate-700 font-bold mb-0.5">No co-organizers added yet</p>
            <p class="text-[11px] text-slate-400 font-medium max-w-xs mx-auto">
              Use the form above to add trusted team members by their registered email address.
            </p>
          </div>
        </div>

      </div>
    </div>

    <!-- Remove Member Confirmation Modal -->
    <div v-if="memberToRemove"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div
        class="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-slate-100 flex flex-col items-center text-center">
        <div class="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-2xl mb-4">
          <iconify-icon icon="lucide:trash-2"></iconify-icon>
        </div>
        <h3 class="text-lg font-black text-slate-900 mb-1.5">Remove Co-Organizer?</h3>
        <p class="text-xs text-slate-500 font-medium leading-relaxed mb-6">
          Are you sure you want to remove <strong class="text-slate-800">{{ memberToRemove.userName || memberToRemove.userEmail }}</strong> from this fundraiser's team?
        </p>
        <div class="grid grid-cols-2 gap-3 w-full">
          <button
            type="button"
            @click="memberToRemove = null"
            :disabled="isRemoving"
            class="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer">
            Cancel
          </button>
          <button
            type="button"
            @click="confirmRemoveMember"
            :disabled="isRemoving"
            class="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer">
            <span v-if="isRemoving"
              class="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>Remove</span>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
