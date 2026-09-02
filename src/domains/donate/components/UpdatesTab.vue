<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { campaignService, type CampaignUpdateRecord } from '../../../services/campaign'
import { Notify } from '../../../utils/notify'

const props = defineProps<{
  campaignId: string
}>()

const emit = defineEmits<{
  (e: 'postUpdate', text: string): void
}>()

const updatesList = ref<CampaignUpdateRecord[]>([])
const isLoading = ref(true)
const showAddUpdateInput = ref(false)
const updateTitle = ref('')
const updateText = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')

// Delete confirmation modal state
const updateToDelete = ref<CampaignUpdateRecord | null>(null)
const isDeleting = ref(false)

const fetchUpdates = async () => {
  isLoading.value = true
  try {
    const list = await campaignService.listCampaignUpdates(props.campaignId)
    updatesList.value = list
  } catch (err) {
    console.warn('Could not load campaign updates:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchUpdates()
})

const getUpdateTitle = (upd: CampaignUpdateRecord | any): string => {
  if (!upd) return 'Update'
  if (typeof upd.title === 'string' && upd.title.trim()) return upd.title
  if (upd.title && typeof upd.title === 'object') {
    if (upd.title.Valid && upd.title.String) return upd.title.String
    if (typeof upd.title.String === 'string' && upd.title.String.trim()) return upd.title.String
  }
  return 'Update'
}

const formatUpdateDate = (dateStr?: string) => {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

const promptDeleteUpdate = (upd: CampaignUpdateRecord) => {
  updateToDelete.value = upd
}

const confirmDeleteUpdate = async () => {
  if (!updateToDelete.value) return
  const id = updateToDelete.value.id
  isDeleting.value = true
  try {
    await campaignService.deleteCampaignUpdate(id)
    updatesList.value = updatesList.value.filter((u) => u.id !== id)
    Notify.success('Campaign update deleted successfully.')
    updateToDelete.value = null
  } catch (err: any) {
    Notify.failure(err.message || 'Failed to delete update')
  } finally {
    isDeleting.value = false
  }
}

const handlePostUpdate = async () => {
  if (!updateText.value.trim()) return
  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const created = await campaignService.createCampaignUpdate({
      campaignId: props.campaignId,
      title: updateTitle.value.trim() || 'Campaign Progress Update',
      content: updateText.value.trim(),
    })

    const newRecord = (created as any)?.data || created
    updatesList.value.unshift(newRecord)
    emit('postUpdate', updateText.value.trim())
    Notify.success('Campaign update published successfully!')
    updateTitle.value = ''
    updateText.value = ''
    showAddUpdateInput.value = false
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to post update. Please try again.'
    Notify.failure(errorMessage.value)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6 animate-fade-in text-left">
    <div class="border-b border-slate-150 pb-3 mb-2 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-black text-slate-900">Campaign Updates</h2>
        <p class="text-xs text-slate-500 font-semibold mt-0.5">Keep donors engaged and informed with milestones and
          news.</p>
      </div>
      <button v-if="!showAddUpdateInput" @click="showAddUpdateInput = true"
        class="bg-[#024731] hover:bg-[#013424] text-white font-extrabold text-xs px-5 py-2.5 rounded-full transition-all shadow-sm cursor-pointer">
        + Add Update
      </button>
    </div>

    <!-- Add update card -->
    <div class="rounded-3xl bg-slate-100/60 border border-slate-200/50 p-6 flex flex-col gap-4">
      <div v-if="!showAddUpdateInput">
        <span class="text-[#024731] font-black block text-sm mb-1">Send fundraiser updates to your supporters.</span>
        <p class="text-xs text-slate-500 font-semibold leading-relaxed mb-3">
          Successful fundraisers send updates to share milestones, say thanks, and keep donation momentum high.
        </p>
        <button @click="showAddUpdateInput = true"
          class="inline-flex items-center gap-1.5 bg-[#024731] hover:bg-[#013424] text-white font-extrabold text-xs px-5 py-2.5 rounded-full transition-all shadow-sm cursor-pointer">
          <span class="text-sm font-bold">+</span>
          <span>Write an update</span>
        </button>
      </div>

      <!-- Add update form -->
      <div v-else class="flex flex-col gap-3 animate-fade-in">
        <div v-if="errorMessage"
          class="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
          {{ errorMessage }}
        </div>

        <input type="text" v-model="updateTitle" placeholder="Update title (e.g. We reached our first milestone!)"
          class="w-full p-3 bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#024731] rounded-xl text-xs font-bold" />

        <textarea v-model="updateText" rows="4"
          placeholder="Share your progress, express gratitude, or announce the next steps..."
          class="w-full p-3 bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#024731] rounded-xl text-xs font-medium resize-none"></textarea>

        <div class="flex justify-end gap-2.5">
          <button type="button" @click="showAddUpdateInput = false"
            class="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl cursor-pointer">
            Cancel
          </button>
          <button type="button" @click="handlePostUpdate" :disabled="!updateText.trim() || isSubmitting"
            class="px-5 py-2 bg-[#024731] hover:bg-[#013424] disabled:opacity-50 text-white font-bold text-xs rounded-xl cursor-pointer shadow-sm flex items-center gap-1.5">
            <span v-if="isSubmitting"
              class="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>Post Update</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Updates posted list -->
    <div class="flex flex-col gap-4 mt-2">
      <h4 class="text-xs font-black text-slate-900 uppercase tracking-wider">Posted Updates ({{ updatesList.length }})
      </h4>

      <div v-if="isLoading" class="p-8 text-center bg-white rounded-2xl border border-slate-100">
        <span
          class="h-6 w-6 border-2 border-[#024731] border-t-transparent rounded-full animate-spin inline-block mb-2"></span>
        <p class="text-xs font-bold text-slate-500">Loading updates...</p>
      </div>

      <div v-else-if="updatesList.length > 0" class="flex flex-col gap-4">
        <div v-for="upd in updatesList" :key="upd.id"
          class="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs group">
          <div class="flex items-center justify-between mb-2">
            <h5 class="font-extrabold text-slate-900 text-sm">{{ getUpdateTitle(upd) }}</h5>
            <div class="flex items-center gap-3">
              <span class="text-[10px] text-slate-400 font-semibold">{{ formatUpdateDate(upd.createdAt) }}</span>
              <button
                @click="promptDeleteUpdate(upd)"
                title="Delete update"
                class="text-slate-300 hover:text-red-600 transition-colors cursor-pointer text-xs p-1 rounded-lg hover:bg-red-50">
                <iconify-icon icon="lucide:trash-2"></iconify-icon>
              </button>
            </div>
          </div>
          <p class="text-xs text-slate-650 font-medium leading-relaxed whitespace-pre-line">{{ upd.content }}</p>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="bg-white border border-dashed border-slate-200 rounded-2xl p-8 text-center">
        <iconify-icon icon="ph:newspaper-bold" class="text-slate-300 text-3xl mb-2"></iconify-icon>
        <p class="text-xs font-bold text-slate-700 mb-1">No updates posted yet</p>
        <p class="text-[11px] text-slate-400 max-w-xs mx-auto">Click "Add Update" above to share your first announcement
          with supporters.</p>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="updateToDelete"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div
        class="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-slate-100 flex flex-col items-center text-center">
        <div class="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-2xl mb-4">
          <iconify-icon icon="lucide:trash-2"></iconify-icon>
        </div>
        <h3 class="text-lg font-black text-slate-900 mb-1.5">Delete Update?</h3>
        <p class="text-xs text-slate-500 font-medium leading-relaxed mb-6">
          Are you sure you want to delete <span class="font-bold text-slate-800">"{{ getUpdateTitle(updateToDelete) }}"</span>? This announcement will be permanently removed.
        </p>
        <div class="grid grid-cols-2 gap-3 w-full">
          <button
            type="button"
            @click="updateToDelete = null"
            :disabled="isDeleting"
            class="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer">
            Cancel
          </button>
          <button
            type="button"
            @click="confirmDeleteUpdate"
            :disabled="isDeleting"
            class="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer">
            <span v-if="isDeleting"
              class="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
