<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLandingStore } from '../../landing/stores'
import { useAuthStore } from '../../../stores/auth'
import { storeToRefs } from 'pinia'
import {
  campaignService,
  type CampaignDetailResponse,
  type CampaignComment,
  type CampaignDonation,
  type CampaignTeamMember,
  type CampaignImage,
  type BackendCampaign,
} from '../../../services/campaign'
import { openFlutterwavePayment } from '../../../services/payment'
import NavHeader from '../../landing/components/NavHeader.vue'
import MainFooter from '../../landing/components/MainFooter.vue'
import { Notify } from '../../../utils/notify'

const route = useRoute()
const router = useRouter()
const landingStore = useLandingStore()
const authStore = useAuthStore()
const { fundraisers } = storeToRefs(landingStore)

const campaignId = ref(route.params.id as string)

// Backend states
const liveData = ref<CampaignDetailResponse | null>(null)
const comments = ref<CampaignComment[]>([])
const donations = ref<CampaignDonation[]>([])
const teamMembers = ref<CampaignTeamMember[]>([])
const galleryImages = ref<CampaignImage[]>([])
const activeGalleryImage = ref<string | null>(null)
const isLoading = ref(true)
const loadError = ref('')

const campaignStatus = computed(() => {
  return liveData.value?.campaign?.status || 'active'
})

// Interactive comment input
const newComment = ref('')
const isSubmittingComment = ref(false)
const commentError = ref('')

// Like state
const isLiking = ref(false)

// Navigation elements
const navHeaderRef = ref<any>(null)
const closeDropdowns = () => {
  navHeaderRef.value?.closeDropdowns()
}

// Fallback to local store if backend campaign isn't found
const localFundraiser = computed(() => {
  return fundraisers.value.find((f) => f.id === campaignId.value)
})

function extractSqlString(val: any, fallback: string = ''): string {
  if (typeof val === 'string' && val) return val
  if (val && typeof val === 'object' && 'Valid' in val && val.Valid && val.String) {
    return val.String
  }
  return fallback
}

// Active campaign properties
const campaign = computed(() => {
  if (liveData.value?.campaign) {
    const c = liveData.value.campaign
    const coverUrl = extractSqlString(c.coverImageUrl, 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&q=80&w=1200')
    const locationStr = extractSqlString(c.location, 'Uganda')
    const subaccountId = extractSqlString(c.flutterwaveSubaccountId)

    const catName = liveData.value.categories && liveData.value.categories[0]
      ? liveData.value.categories[0].name
      : 'Community'

    return {
      id: c.id,
      title: c.title,
      story: c.story,
      category: catName,
      imageUrl: coverUrl,
      targetAmount: Number(c.goalAmount) || 1000000,
      raisedAmount: Number(c.raisedAmount) || 0,
      donorCount: Number(c.donorCount) || donations.value.length,
      currency: c.currency || 'UGX',
      organizer: c.ownerName || 'Verified Organizer',
      location: locationStr,
      likeCount: liveData.value.likeCount || 0,
      commentCount: liveData.value.commentCount || 0,
      shareCount: liveData.value.shareCount || 0,
      hasLiked: liveData.value.hasLiked || false,
      flutterwaveSubaccountId: subaccountId || undefined,
    }
  }

  if (localFundraiser.value) {
    const f = localFundraiser.value
    return {
      id: f.id,
      title: f.title,
      story: f.description,
      category: f.category,
      imageUrl: f.imageUrl,
      targetAmount: f.targetAmount,
      raisedAmount: f.raisedAmount,
      donorCount: f.donorCount,
      currency: 'UGX',
      organizer: f.organizer,
      location: `${f.city}, ${f.country}`,
      likeCount: 0,
      commentCount: comments.value.length,
      shareCount: 0,
      hasLiked: false,
      flutterwaveSubaccountId: undefined,
    }
  }

  return null
})

// Progress percentage
const progressPercent = computed(() => {
  if (!campaign.value || campaign.value.targetAmount <= 0) return 0
  const pct = (campaign.value.raisedAmount / campaign.value.targetAmount) * 100
  return Math.min(100, Math.round(pct))
})

// Load campaign from backend
const fetchCampaignData = async () => {
  isLoading.value = true
  loadError.value = ''

  try {
    const [detailRes, commentsRes, donationsRes, teamRes, imagesRes] = await Promise.allSettled([
      campaignService.getCampaignDetail(campaignId.value),
      campaignService.listComments(campaignId.value),
      campaignService.listCampaignDonations(campaignId.value),
      campaignService.listTeamMembers(campaignId.value),
      campaignService.listCampaignImages(campaignId.value),
    ])

    if (detailRes.status === 'fulfilled') {
      liveData.value = detailRes.value
      if (detailRes.value.teamMembers && detailRes.value.teamMembers.length) {
        teamMembers.value = detailRes.value.teamMembers
      }
    }

    if (imagesRes.status === 'fulfilled' && imagesRes.value.length) {
      galleryImages.value = imagesRes.value
    } else if (detailRes.status === 'fulfilled' && detailRes.value.images && detailRes.value.images.length) {
      galleryImages.value = detailRes.value.images
    }

    if (teamRes.status === 'fulfilled' && teamRes.value.length) {
      teamMembers.value = teamRes.value
    }

    if (commentsRes.status === 'fulfilled') {
      comments.value = commentsRes.value
    }

    if (donationsRes.status === 'fulfilled') {
      donations.value = donationsRes.value
    }
  } catch (err: any) {
    console.warn('Could not load campaign from backend:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchCampaignData()
})

// Delete comment modal state
const commentToDelete = ref<CampaignComment | null>(null)
const isDeletingComment = ref(false)

const isMyComment = (c: CampaignComment) => {
  return Boolean(authStore.isLoggedIn && authStore.user?.id && authStore.user.id === c.userId)
}

const promptDeleteComment = (c: CampaignComment) => {
  commentToDelete.value = c
}

const confirmDeleteComment = async () => {
  if (!commentToDelete.value) return
  const id = commentToDelete.value.id
  isDeletingComment.value = true
  try {
    await campaignService.deleteComment(id)
    comments.value = comments.value.filter((c) => c.id !== id)
    if (liveData.value && liveData.value.commentCount > 0) {
      liveData.value.commentCount -= 1
    }
    Notify.success('Comment deleted.')
    commentToDelete.value = null
  } catch (err: any) {
    Notify.failure(err.message || 'Failed to delete comment')
  } finally {
    isDeletingComment.value = false
  }
}

// Like toggling
const handleToggleLike = async () => {
  if (!authStore.isLoggedIn) {
    Notify.info('Please sign in to like this fundraiser!')
    return
  }

  if (isLiking.value) return
  isLiking.value = true

  try {
    const res = await campaignService.toggleLike(campaignId.value)
    if (liveData.value) {
      liveData.value.hasLiked = res.liked
      liveData.value.likeCount = res.likeCount
    }
    Notify.success(res.liked ? 'Added to your liked fundraisers!' : 'Removed like.')
  } catch (err: any) {
    Notify.failure(err.message || 'Failed to update like')
  } finally {
    isLiking.value = false
  }
}

// Post comment
const handlePostComment = async () => {
  if (!authStore.isLoggedIn) {
    Notify.info('Please sign in to post words of support.')
    return
  }

  if (!newComment.value.trim()) return
  isSubmittingComment.value = true
  commentError.value = ''

  try {
    const res = await campaignService.addComment(campaignId.value, newComment.value.trim())
    const added: CampaignComment = (res as any)?.data || res
    if (!added.userName && !added.name) {
      added.userName = authStore.user?.name || 'Supporter'
    }
    comments.value.unshift(added)
    newComment.value = ''
    if (liveData.value) liveData.value.commentCount += 1
    Notify.success('Thank you! Your words of support have been posted.')
  } catch (err: any) {
    commentError.value = err.message || 'Failed to post message. Please try again.'
    Notify.failure(commentError.value)
  } finally {
    isSubmittingComment.value = false
  }
}

// Toast message & Sharing
const showToast = ref(false)
const toastMessage = ref('')

const handleShare = async (platform: string) => {
  try {
    await campaignService.recordShare(campaignId.value, platform)
    if (liveData.value) liveData.value.shareCount += 1
  } catch (_) { }

  const url = encodeURIComponent(window.location.href)
  const title = encodeURIComponent(campaign.value?.title || 'Support this fundraiser on HelpFund')

  if (platform === 'copy') {
    navigator.clipboard.writeText(window.location.href)
    Notify.info('Fundraiser link copied to clipboard!')
  } else if (platform === 'whatsapp') {
    Notify.success('Opening WhatsApp...')
    window.open(`https://api.whatsapp.com/send?text=${title}%20${url}`, '_blank')
  } else if (platform === 'twitter') {
    Notify.success('Opening X...')
    window.open(`https://twitter.com/intent/tweet?text=${title}&url=${url}`, '_blank')
  } else if (platform === 'facebook') {
    Notify.success('Opening Facebook...')
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
  }
}

// Donation Modal States
const showDonateModal = ref(false)
const donationAmount = ref<number>(50000)
const donorName = ref('')
const donorEmail = ref('')
const donorPhone = ref('')
const donorComment = ref('')
const isAnonymous = ref(false)
const isSubmittingDonation = ref(false)
const donationSuccess = ref(false)
const donationError = ref('')

const presetAmounts = [10000, 25000, 50000, 100000, 250000]

const openDonate = () => {
  donationAmount.value = 50000
  donorName.value = authStore.user?.name || ''
  donorEmail.value = authStore.user?.email || ''
  donorPhone.value = authStore.user?.phone || ''
  donorComment.value = ''
  isAnonymous.value = false
  donationSuccess.value = false
  donationError.value = ''
  showDonateModal.value = true
}

const handleStartDonation = async () => {
  if (donationAmount.value <= 0 || !campaign.value) return
  if (!donorEmail.value && !authStore.user?.email) {
    donationError.value = 'Please provide an email address for your payment receipt.'
    return
  }

  isSubmittingDonation.value = true
  donationError.value = ''

  try {
    // 1. Create pending donation record in backend
    const res = await campaignService.createDonation({
      campaignId: campaignId.value,
      amount: donationAmount.value,
      currency: campaign.value.currency || 'UGX',
      isAnonymous: isAnonymous.value,
      donorName: isAnonymous.value ? 'Anonymous' : (donorName.value.trim() || 'Supporter'),
      message: donorComment.value.trim() || undefined,
    })

    // 2. Open Flutterwave Inline Checkout
    try {
      await openFlutterwavePayment({
        tx_ref: res.txRef,
        amount: donationAmount.value,
        currency: campaign.value.currency || 'UGX',
        payment_options: 'card, mobilemoney',
        customer: {
          email: donorEmail.value || authStore.user?.email || 'donor@helpfund.org',
          name: isAnonymous.value ? 'Anonymous' : (donorName.value.trim() || 'Supporter'),
          phonenumber: donorPhone.value || undefined,
        },
        subaccounts: campaign.value.flutterwaveSubaccountId
          ? [{ id: campaign.value.flutterwaveSubaccountId }]
          : undefined,
        customizations: {
          title: campaign.value.title,
          description: `Donation to ${campaign.value.title}`,
        },
        callback: async (fwData: any) => {
          console.log('Flutterwave payment callback:', fwData)
          try {
            await campaignService.verifyDonation({
              txRef: res.txRef,
              transactionId: String(fwData.transaction_id || fwData.id || ''),
            })
          } catch (vErr) {
            console.warn('Donation verification response:', vErr)
          }

          donationSuccess.value = true
          Notify.success(
            `Thank you! Your donation of ${campaign.value?.currency} ${Number(donationAmount.value).toLocaleString()} has been confirmed.`
          )
          await fetchCampaignData()
          setTimeout(() => {
            showDonateModal.value = false
          }, 2500)
        },
        onclose: () => {
          isSubmittingDonation.value = false
        },
      })
    } catch (fwErr: any) {
      console.warn('Flutterwave checkout error:', fwErr)
      donationError.value = fwErr.message || 'Could not open payment window. Please try again.'
      Notify.failure(donationError.value)
    }
  } catch (err: any) {
    donationError.value = err.message || 'Failed to initiate donation. Please try again.'
    Notify.failure(donationError.value)
  } finally {
    isSubmittingDonation.value = false
  }
}
</script>

<template>
  <div v-if="campaign" class="min-h-screen bg-white text-slate-800 font-sans text-left flex flex-col"
    @click="closeDropdowns">
    <NavHeader ref="navHeaderRef" />

    <!-- Breadcrumb / Header Space -->
    <div class="border-b border-slate-100 py-3 bg-slate-50/50">
      <div class="max-w-6xl mx-auto px-4 flex items-center justify-between text-xs font-semibold text-slate-500">
        <div class="flex items-center gap-1.5">
          <RouterLink to="/" class="hover:text-[#024731] transition-colors">Home</RouterLink>
          <span>/</span>
          <RouterLink to="/donate/categories" class="hover:text-[#024731] transition-colors">Categories</RouterLink>
          <span>/</span>
          <span class="text-slate-700">{{ campaign.category }}</span>
        </div>
        <div class="flex items-center gap-2">
          <!-- Like Button -->
          <button @click="handleToggleLike" :disabled="isLiking"
            class="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border"
            :class="campaign.hasLiked ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'">
            <iconify-icon :icon="campaign.hasLiked ? 'fa6-solid:heart' : 'fa6-regular:heart'"></iconify-icon>
            <span>{{ campaign.likeCount }}</span>
          </button>

          <div
            class="text-[11px] text-[#024731] bg-[#edfce0] px-2.5 py-0.5 rounded-full border border-[#bbf770] font-black uppercase">
            Active Fundraiser
          </div>
        </div>
      </div>
    </div>

    <!-- Main Container -->
    <main class="max-w-6xl w-full mx-auto px-4 py-8 lg:py-12 flex-grow">
      <!-- Campaign Title -->
      <h1 class="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mb-8">
        {{ campaign.title }}
      </h1>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative items-start">

        <!-- Left Column: Media, Story, Organizer details (8 cols) -->
        <div class="lg:col-span-8 flex flex-col gap-8">

          <!-- Media Container -->
          <div
            class="aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shadow-sm relative group">
            <img v-if="campaign.imageUrl" :src="campaign.imageUrl" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full bg-[#edfce0] flex items-center justify-center">
              <iconify-icon icon="lucide:sunrise" class="text-[#02a95c] text-6xl"></iconify-icon>
            </div>
            <span
              class="absolute bottom-4 left-4 bg-slate-900/60 backdrop-blur-sm px-3 py-1 rounded-full text-white text-[10px] uppercase font-bold tracking-wider">
              {{ campaign.category }}
            </span>
          </div>

          <!-- Organizer brief header -->
          <div class="flex flex-col gap-3 py-2 border-b border-slate-100">
            <div class="flex items-center gap-4">
              <div
                class="w-10 h-10 rounded-full bg-[#edfce0] border border-[#bbf770] text-[#024731] flex items-center justify-center font-bold text-sm shrink-0">
                {{ campaign.organizer.split(' ').map((n: string) => n[0]).join('') || 'O' }}
              </div>
              <div class="text-xs text-slate-600 font-medium">
                <span class="font-bold text-slate-900 block text-sm">{{ campaign.organizer }}</span>
                Organizing this verified fundraiser &bull; <span class="text-slate-500 font-semibold">{{ campaign.location }}</span>
              </div>
            </div>

            <!-- Team & Co-organizers if present -->
            <div v-if="teamMembers.length > 0" class="flex items-center gap-2 pt-2 border-t border-slate-50 text-xs">
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Team:</span>
              <div class="flex flex-wrap gap-1.5">
                <span v-for="tm in teamMembers" :key="tm.id || tm.userId"
                  class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-semibold">
                  <iconify-icon icon="ph:user-bold" class="text-emerald-700 text-xs"></iconify-icon>
                  <span>{{ tm.userName || tm.userEmail }}</span>
                  <span class="text-[9px] text-slate-400 font-bold capitalize">({{ tm.role || 'Co-organizer' }})</span>
                </span>
              </div>
            </div>
          </div>

          <!-- Donation Protected Tag -->
          <div class="bg-[#edfce0]/60 border border-[#d8fc9e]/80 rounded-xl p-3.5 flex items-center gap-3">
            <div class="text-[#024731] text-lg flex shrink-0">
              <iconify-icon icon="ph:shield-check-fill"></iconify-icon>
            </div>
            <span class="text-xs text-slate-700 font-medium leading-relaxed">
              <strong>Donation protected:</strong> Your generosity is safe. We use the HelpFund Protection Guarantee
              with secure Mobile Money & Card gateway processing.
            </span>
          </div>

          <!-- Campaign Narrative / Story -->
          <article
            class="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm lg:text-base whitespace-pre-line py-2 font-medium">
            {{ campaign.story }}
          </article>

          <!-- Campaign Media Gallery -->
          <div v-if="galleryImages.length > 0" class="py-4 border-t border-slate-100 flex flex-col gap-3">
            <div class="flex items-center gap-2 text-slate-900 font-black text-sm">
              <iconify-icon icon="ph:images-bold" class="text-base text-[#024731]"></iconify-icon>
              <span>Campaign Photos ({{ galleryImages.length }})</span>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <div
                v-for="(img, idx) in galleryImages"
                :key="img.id || idx"
                @click="activeGalleryImage = img.url"
                class="aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 border border-slate-150 shadow-xs cursor-pointer group relative">
                <img :src="img.url" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div class="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-lg">
                  <iconify-icon icon="ph:magnifying-glass-plus-bold"></iconify-icon>
                </div>
              </div>
            </div>
          </div>

          <!-- Call to action card -->
          <div
            class="bg-[#edfce0]/60 border border-[#bbf770]/60 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex-1">
              <h4 class="text-base font-bold text-[#024731] mb-1">Make an impact today</h4>
              <p class="text-xs text-slate-600 leading-relaxed font-semibold">
                Every contribution directly supports {{ campaign.organizer }}'s verified fundraising goal.
              </p>
            </div>
            <button
              @click="openDonate"
              :disabled="campaignStatus === 'paused' || campaignStatus === 'completed'"
              class="bg-[#024731] hover:bg-[#013424] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs px-6 py-3 rounded-full transition-all shrink-0 cursor-pointer shadow-md">
              {{ campaignStatus === 'paused' ? 'Donations Paused' : campaignStatus === 'completed' ? 'Goal Reached' : 'Donate Now' }}
            </button>
          </div>

          <!-- Sharing Section -->
          <div class="py-4 border-t border-b border-slate-100 my-2">
            <h3 class="text-base font-bold text-slate-900 mb-1">Sharing helps more than you think</h3>
            <p class="text-slate-500 text-xs mb-4">
              Help this fundraiser reach more compassionate supporters across your network.
            </p>
            <div class="flex items-center gap-3.5">
              <button @click="handleShare('copy')" title="Copy Link"
                class="w-10 h-10 rounded-full border border-slate-200 hover:border-[#024731] hover:bg-slate-50 flex items-center justify-center transition-all text-slate-600 text-lg cursor-pointer">
                <iconify-icon icon="ph:link-bold"></iconify-icon>
              </button>
              <button @click="handleShare('facebook')" title="Share to Facebook"
                class="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all text-lg shadow-sm cursor-pointer">
                <iconify-icon icon="ph:facebook-logo-fill"></iconify-icon>
              </button>
              <button @click="handleShare('whatsapp')" title="Share on WhatsApp"
                class="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-all text-lg shadow-sm cursor-pointer">
                <iconify-icon icon="ph:whatsapp-logo-fill"></iconify-icon>
              </button>
              <button @click="handleShare('twitter')" title="Share to X"
                class="w-10 h-10 rounded-full bg-slate-900 hover:bg-black text-white flex items-center justify-center transition-all text-lg shadow-sm cursor-pointer">
                <iconify-icon icon="ph:x-logo"></iconify-icon>
              </button>
            </div>
          </div>

          <!-- Words of Support / Comments Section -->
          <div class="flex flex-col gap-5">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 class="text-base font-bold text-slate-950">Words of Support</h3>
                <span class="text-xs text-slate-400 font-medium">{{ comments.length }} message{{ comments.length === 1 ?
                  '' : 's' }}</span>
              </div>
            </div>

            <!-- Post a Comment box -->
            <div class="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
              <div v-if="commentError" class="text-rose-600 text-xs font-semibold mb-2">{{ commentError }}</div>
              <textarea v-model="newComment" rows="2" placeholder="Leave an encouraging message..."
                class="w-full bg-white rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#024731] resize-none"
                :disabled="isSubmittingComment"></textarea>
              <div class="flex justify-end mt-2">
                <button @click="handlePostComment" :disabled="isSubmittingComment || !newComment.trim()"
                  class="bg-[#024731] hover:bg-[#013424] text-white text-xs font-bold px-5 py-2 rounded-full disabled:opacity-40 transition-all cursor-pointer shadow-sm">
                  {{ isSubmittingComment ? 'Posting...' : 'Post Message' }}
                </button>
              </div>
            </div>

            <!-- Comments List -->
            <div v-if="comments.length > 0" class="flex flex-col gap-3">
              <div v-for="c in comments" :key="c.id"
                class="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs flex items-start gap-4 group">
                <div
                  class="w-9 h-9 rounded-full bg-[#edfce0] text-[#024731] flex items-center justify-center font-bold text-xs shrink-0">
                  {{ (c.userName || c.name || c.authorName || 'S').charAt(0).toUpperCase() }}
                </div>
                <div class="flex-1 text-xs">
                  <div class="flex items-center justify-between mb-1">
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-slate-800">{{ c.userName || c.name || c.authorName || 'Supporter'
                        }}</span>
                      <span v-if="isMyComment(c)"
                        class="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-full">You</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-slate-400">{{ c.createdAt ? new Date(c.createdAt).toLocaleDateString() :
                        'Recently' }}</span>
                      <button v-if="isMyComment(c)" @click="promptDeleteComment(c)" title="Delete message"
                        class="text-slate-300 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50 cursor-pointer">
                        <iconify-icon icon="lucide:trash-2" class="text-xs"></iconify-icon>
                      </button>
                    </div>
                  </div>
                  <p class="text-slate-650 leading-relaxed font-medium whitespace-pre-line">{{ c.content }}</p>
                </div>
              </div>
            </div>

            <!-- Empty Comments State -->
            <div v-else class="text-center py-8 border border-dashed border-slate-200 rounded-2xl bg-slate-50/20">
              <p class="text-xs text-slate-500 font-bold mb-1">Be the first to leave a message of support!</p>
              <p class="text-[10px] text-slate-400 font-semibold">Kind words mean the world to our fundraisers.</p>
            </div>
          </div>

          <!-- Live Donations Section -->
          <div v-if="donations.length > 0" class="flex flex-col gap-4 pt-4 border-t border-slate-100">
            <h3 class="text-base font-bold text-slate-950">Recent Supporters</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div v-for="d in donations" :key="d.id"
                class="bg-slate-50/70 border border-slate-200/60 rounded-xl p-3 flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div
                    class="w-8 h-8 rounded-full bg-emerald-100 text-[#024731] flex items-center justify-center font-bold text-xs">
                    <iconify-icon icon="fa6-solid:heart"></iconify-icon>
                  </div>
                  <div>
                    <span class="text-xs font-bold text-slate-900 block">{{ d.isAnonymous ? 'Anonymous' : (d.donorName
                      || 'Supporter') }}</span>
                    <span class="text-[10px] text-slate-400">{{ d.createdAt ? new Date(d.createdAt).toLocaleDateString()
                      : 'Recently' }}</span>
                  </div>
                </div>
                <span class="text-xs font-extrabold text-[#024731]">
                  {{ d.currency }} {{ Number(d.amount).toLocaleString() }}
                </span>
              </div>
            </div>
          </div>

        </div>

        <!-- Right Column: Sticky Sidebar Card (4 cols) -->
        <div
          class="lg:col-span-4 lg:sticky lg:top-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-md hover:shadow-lg transition-shadow">

          <!-- Donation Progress info -->
          <div class="mb-5">
            <h3 class="text-xl font-bold text-slate-900 mb-1 flex items-baseline gap-1">
              <span v-if="campaign.raisedAmount === 0">Be the first to donate</span>
              <span v-else>{{ campaign.currency }} {{ Number(campaign.raisedAmount).toLocaleString() }}</span>
              <span class="text-xs text-slate-400 font-semibold">of {{ campaign.currency }} {{
                Number(campaign.targetAmount).toLocaleString() }} goal</span>
            </h3>

            <!-- Progress Bar -->
            <div class="w-full bg-slate-100 rounded-full h-2.5 mb-2 overflow-hidden">
              <div class="bg-[#02a95c] h-full rounded-full transition-all duration-500"
                :style="{ width: progressPercent + '%' }"></div>
            </div>

            <div class="flex justify-between items-center text-xs font-semibold text-slate-400 mt-1">
              <span>{{ progressPercent }}% completed</span>
              <span>{{ campaign.donorCount }} donation{{ campaign.donorCount === 1 ? '' : 's' }}</span>
            </div>
          </div>

          <!-- Status alert if paused or completed -->
          <div v-if="campaignStatus === 'paused'" class="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs font-semibold leading-relaxed">
            <iconify-icon icon="ph:pause-circle-bold" class="text-amber-700 mr-1 text-sm inline-block align-middle"></iconify-icon>
            Donations are temporarily paused by the organizer.
          </div>
          <div v-else-if="campaignStatus === 'completed'" class="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-2xl text-xs font-semibold leading-relaxed">
            <iconify-icon icon="ph:check-circle-bold" class="text-blue-700 mr-1 text-sm inline-block align-middle"></iconify-icon>
            This fundraiser has reached its goal and is completed!
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col gap-3">
            <button
              @click="openDonate"
              :disabled="campaignStatus === 'paused' || campaignStatus === 'completed'"
              class="w-full bg-[#024731] hover:bg-[#013424] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm py-3.5 rounded-2xl shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer">
              <iconify-icon :icon="campaignStatus === 'paused' ? 'ph:pause-circle-fill' : campaignStatus === 'completed' ? 'ph:flag-checkered-fill' : 'ph:heart-fill'" class="text-lg"></iconify-icon>
              <span>{{ campaignStatus === 'paused' ? 'Donations paused' : campaignStatus === 'completed' ? 'Goal reached' : 'Donate now' }}</span>
            </button>
            <button @click="handleShare('copy')"
              class="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer">
              <iconify-icon icon="ph:share-network-bold" class="text-lg"></iconify-icon>
              <span>Share fundraiser</span>
            </button>
            <button @click="handleToggleLike" :disabled="isLiking"
              class="w-full py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 border cursor-pointer"
              :class="campaign.hasLiked ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'">
              <iconify-icon :icon="campaign.hasLiked ? 'fa6-solid:heart' : 'fa6-regular:heart'"
                class="text-base text-rose-500"></iconify-icon>
              <span>{{ campaign.hasLiked ? 'Liked' : 'Like fundraiser' }} ({{ campaign.likeCount }})</span>
            </button>
          </div>

          <!-- Guarantee note -->
          <div class="mt-6 border-t border-slate-100 pt-5 flex gap-3 text-left">
            <iconify-icon icon="ph:shield-check-bold" class="text-[#024731] text-xl shrink-0 mt-0.5"></iconify-icon>
            <div class="text-[11px] leading-relaxed text-slate-500">
              <p class="font-bold text-slate-800 mb-0.5">HelpFund Protection Guarantee</p>
              <p>We guarantee your donation will be handled securely through verified payment rails. <a href="#"
                  class="text-[#024731] underline font-bold">Learn more</a>.</p>
            </div>
          </div>

        </div>

      </div>
    </main>

    <!-- Success toast -->
    <div v-if="showToast"
      class="fixed bottom-6 right-6 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50 animate-bounce">
      <iconify-icon icon="ph:check-circle-bold" class="text-[#02a95c] text-base"></iconify-icon>
      <span>{{ toastMessage }}</span>
    </div>

    <!-- Donation Modal Dialog with Flutterwave Integration -->
    <div v-if="showDonateModal"
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        class="bg-white rounded-3xl w-full max-w-md p-6 border border-slate-100 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-250">

        <button @click="showDonateModal = false"
          class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xl cursor-pointer">
          <iconify-icon icon="ph:x-bold"></iconify-icon>
        </button>

        <!-- Success view -->
        <div v-if="donationSuccess" class="py-8 flex flex-col items-center justify-center text-center">
          <div
            class="w-16 h-16 rounded-full bg-[#edfce0] border border-[#bbf770] flex items-center justify-center text-3xl mb-4 text-[#02a95c]">
            <iconify-icon icon="ph:sparkle-fill" class="animate-ping absolute w-6 h-6 opacity-30"></iconify-icon>
            <iconify-icon icon="ph:check-circle-fill"></iconify-icon>
          </div>
          <h3 class="text-xl font-bold text-slate-950 mb-1">Thank you for your support!</h3>
          <p class="text-slate-500 text-xs font-semibold">
            Your donation of {{ campaign.currency }} {{ Number(donationAmount).toLocaleString() }} has been received.
          </p>
        </div>

        <!-- Donation Form -->
        <div v-else>
          <h3 class="text-lg font-bold text-slate-900 mb-1 flex items-center gap-1.5 text-left">
            <iconify-icon icon="ph:heart-fill" class="text-[#02a95c]"></iconify-icon>
            <span>Support this fundraiser</span>
          </h3>
          <p class="text-slate-400 text-xs mb-4 text-left font-semibold">Direct payment via Mobile Money or Card.</p>

          <div v-if="donationError"
            class="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-left">
            {{ donationError }}
          </div>

          <!-- Quick Select in UGX -->
          <div class="grid grid-cols-3 gap-2 mb-3">
            <button v-for="amt in presetAmounts" :key="amt" type="button" @click="donationAmount = amt"
              class="py-2 px-1 rounded-xl border font-bold text-[11px] transition-all cursor-pointer"
              :class="donationAmount === amt ? 'bg-[#edfce0] border-[#024731] text-[#024731] shadow-xs' : 'bg-slate-50 border-slate-200 hover:border-[#024731] text-slate-700'">
              {{ campaign.currency }} {{ (amt / 1000).toLocaleString() }}k
            </button>
          </div>

          <!-- Custom Amount input -->
          <div class="mb-3 text-left">
            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Custom
              Amount</label>
            <div
              class="relative rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-[#024731] focus-within:border-transparent transition-all">
              <span class="absolute left-3.5 top-3.5 font-bold text-xs text-slate-500">{{ campaign.currency }}</span>
              <input type="number" v-model="donationAmount"
                class="w-full pl-14 pr-4 py-3 focus:outline-none text-sm font-bold text-slate-800" min="1000"
                step="1000" />
            </div>
          </div>

          <!-- Name & Email fields -->
          <div class="grid grid-cols-2 gap-2 mb-3 text-left">
            <div>
              <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Your Name</label>
              <input type="text" v-model="donorName" :disabled="isAnonymous" placeholder="John Doe"
                class="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#024731] text-xs font-semibold disabled:bg-slate-100" />
            </div>
            <div>
              <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Email
                (Receipt)</label>
              <input type="email" v-model="donorEmail" required placeholder="donor@example.com"
                class="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#024731] text-xs font-semibold" />
            </div>
          </div>

          <!-- Anonymous check -->
          <label class="flex items-center gap-2 mb-3 cursor-pointer text-left">
            <input type="checkbox" v-model="isAnonymous"
              class="rounded border-slate-300 text-[#024731] focus:ring-[#024731]" />
            <span class="text-xs text-slate-600 font-semibold">Make my donation anonymous</span>
          </label>

          <!-- Comment field -->
          <div class="mb-4 text-left">
            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Message of
              Support</label>
            <textarea v-model="donorComment" placeholder="Send words of encouragement..."
              class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#024731] text-xs font-semibold h-16 resize-none"></textarea>
          </div>

          <!-- Action -->
          <button @click="handleStartDonation" :disabled="donationAmount <= 0 || isSubmittingDonation"
            class="w-full py-3.5 bg-[#024731] hover:bg-[#013424] disabled:bg-slate-200 text-white font-bold text-sm rounded-xl shadow-md disabled:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer">
            <span v-if="isSubmittingDonation"
              class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>Proceed to Donate ({{ campaign.currency }} {{ Number(donationAmount).toLocaleString() }})</span>
          </button>
        </div>

      </div>
    </div>

    <!-- Delete Comment Confirmation Modal -->
    <div v-if="commentToDelete"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div
        class="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-slate-100 flex flex-col items-center text-center">
        <div class="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-2xl mb-4">
          <iconify-icon icon="lucide:trash-2"></iconify-icon>
        </div>
        <h3 class="text-lg font-black text-slate-900 mb-1.5">Delete Message?</h3>
        <p class="text-xs text-slate-500 font-medium leading-relaxed mb-6">
          Are you sure you want to delete your words of support? This cannot be undone.
        </p>
        <div class="grid grid-cols-2 gap-3 w-full">
          <button type="button" @click="commentToDelete = null" :disabled="isDeletingComment"
            class="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer">
            Cancel
          </button>
          <button type="button" @click="confirmDeleteComment" :disabled="isDeletingComment"
            class="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer">
            <span v-if="isDeletingComment"
              class="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Gallery Lightbox Modal -->
    <div v-if="activeGalleryImage"
      class="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
      @click="activeGalleryImage = null">
      <div class="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-black border border-white/10 shadow-2xl flex items-center justify-center" @click.stop>
        <button
          @click="activeGalleryImage = null"
          class="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center cursor-pointer transition">
          <iconify-icon icon="ph:x-bold" class="text-base"></iconify-icon>
        </button>
        <img :src="activeGalleryImage" class="w-full h-full max-h-[85vh] object-contain" />
      </div>
    </div>

    <MainFooter />
  </div>

    <div v-else-if="isLoading" class="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      <span class="h-8 w-8 border-3 border-[#024731] border-t-transparent rounded-full animate-spin mb-3"></span>
      <p class="text-sm font-bold text-slate-600">Loading campaign details...</p>
    </div>

    <div v-else class="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
      <iconify-icon icon="ph:warning-bold" class="text-amber-500 text-5xl mb-4"></iconify-icon>
      <h3 class="text-xl font-bold text-slate-900 mb-2">Fundraiser Not Found</h3>
      <p class="text-slate-500 text-xs mb-6 max-w-sm">The campaign you are looking for does not exist or may have been
        archived.</p>
      <RouterLink to="/"
        class="px-6 py-2.5 bg-[#024731] text-white font-bold text-xs rounded-full shadow hover:bg-[#013424] transition-all">
        Return Home
      </RouterLink>
    </div>
</template>

<style scoped>
@keyframes in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-in {
  animation: in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
