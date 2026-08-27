<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLandingStore } from '../../landing/stores'
import { storeToRefs } from 'pinia'
import NavHeader from '../../landing/components/NavHeader.vue'
import MainFooter from '../../landing/components/MainFooter.vue'

const route = useRoute()
const router = useRouter()
const landingStore = useLandingStore()
const { fundraisers } = storeToRefs(landingStore)

const campaignId = ref(route.params.id as string)
const fundraiser = computed(() => {
  return fundraisers.value.find((f) => f.id === campaignId.value)
})

// Navigation elements
const navHeaderRef = ref<any>(null)
const closeDropdowns = () => {
  navHeaderRef.value?.closeDropdowns()
}

// Donation modal states
const showDonateModal = ref(false)
const donationAmount = ref<number>(20)
const donorName = ref('')
const donorComment = ref('')
const isSubmittingDonation = ref(false)
const donationSuccess = ref(false)

// Toast message for share copy
const showToast = ref(false)
const toastMessage = ref('')

// Interactive comments list
interface Comment {
  name: string
  amount: number
  comment: string
  time: string
}
const comments = ref<Comment[]>([])

// Populate mock comments initially or when donations happen
onMounted(() => {
  if (fundraiser.value) {
    if (fundraiser.value.donorCount > 0) {
      comments.value = [
        { name: 'Anonymous', amount: 15, comment: 'Supporting this great cause! Keep going.', time: '2 hours ago' },
        { name: 'Sarah J.', amount: 50, comment: 'Sending love and strength.', time: '5 hours ago' }
      ]
    }
  }
})

const progressPercent = computed(() => {
  if (!fundraiser.value) return 0
  const pct = (fundraiser.value.raisedAmount / fundraiser.value.targetAmount) * 100
  return Math.min(100, Math.round(pct))
})

const handleCopyLink = () => {
  const link = `${window.location.origin}/campaign/${campaignId.value}`
  navigator.clipboard.writeText(link)
  toastMessage.value = 'Link copied to clipboard!'
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2500)
}

const openDonate = () => {
  donationAmount.value = 20
  donorName.value = ''
  donorComment.value = ''
  donationSuccess.value = false
  showDonateModal.value = true
}

const submitDonation = async () => {
  if (donationAmount.value <= 0 || !fundraiser.value) return
  isSubmittingDonation.value = true
  
  // Simulate network
  const success = await landingStore.donateToFundraiser(fundraiser.value.id, donationAmount.value)
  isSubmittingDonation.value = false
  
  if (success) {
    // Add comment
    comments.value.unshift({
      name: donorName.value.trim() || 'Anonymous',
      amount: donationAmount.value,
      comment: donorComment.value.trim() || 'No comment left.',
      time: 'Just now'
    })
    
    donationSuccess.value = true
    setTimeout(() => {
      showDonateModal.value = false
    }, 1500)
  }
}
</script>

<template>
  <div v-if="fundraiser" class="min-h-screen bg-white text-slate-800 font-sans text-left flex flex-col" @click="closeDropdowns">
    <NavHeader ref="navHeaderRef" />

    <!-- Breadcrumb / Header Space -->
    <div class="border-b border-slate-100 py-3 bg-slate-50/50">
      <div class="max-w-6xl mx-auto px-4 flex items-center justify-between text-xs font-semibold text-slate-500">
        <div class="flex items-center gap-1.5">
          <RouterLink to="/" class="hover:text-blue-700 transition-colors">Home</RouterLink>
          <span>/</span>
          <RouterLink to="/donate/categories" class="hover:text-blue-700 transition-colors">Categories</RouterLink>
          <span>/</span>
          <span class="text-slate-700">{{ fundraiser.category }}</span>
        </div>
        <div class="text-[11px] text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100 font-bold uppercase">
          Active Fundraiser
        </div>
      </div>
    </div>

    <!-- Main Container -->
    <main class="max-w-6xl w-full mx-auto px-4 py-8 lg:py-12 flex-grow">
      
      <!-- Campaign Title -->
      <h1 class="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mb-8">
        {{ fundraiser.title }}
      </h1>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative items-start">
        
        <!-- Left Column: Media, Story, Organizer details (8 cols) -->
        <div class="lg:col-span-8 flex flex-col gap-8">
          
          <!-- Media Container -->
          <div class="aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shadow-sm relative group">
            <img v-if="fundraiser.imageUrl" :src="fundraiser.imageUrl" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full bg-gradient-to-tr from-blue-100 to-indigo-50 flex items-center justify-center">
              <iconify-icon icon="lucide:sunrise" class="text-blue-500 text-6xl"></iconify-icon>
            </div>
            <span class="absolute bottom-4 left-4 bg-slate-900/60 backdrop-blur-sm px-3 py-1 rounded-full text-white text-[10px] uppercase font-bold tracking-wider">
              {{ fundraiser.category }}
            </span>
          </div>

          <!-- Organizer brief header -->
          <div class="flex items-center gap-4 py-2 border-b border-slate-100">
            <div class="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
              {{ fundraiser.organizer.split(' ').map(n => n[0]).join('') }}
            </div>
            <div class="text-xs text-slate-600 font-medium">
              <span class="font-bold text-slate-900 block text-sm">{{ fundraiser.organizer }}</span>
              is organizing this fundraiser for <span class="font-bold">{{ fundraiser.organizer }}</span>.
            </div>
          </div>

          <!-- Donation Protected Tag -->
          <div class="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex items-center gap-3">
            <div class="text-blue-600 text-lg flex shrink-0">
              <iconify-icon icon="ph:shield-check-fill"></iconify-icon>
            </div>
            <span class="text-xs text-slate-600 font-medium leading-relaxed">
              <strong>Donation protected:</strong> Your generosity is safe. We use the HelpFund Protection Guarantee to ensure funds go to verified coordinators.
            </span>
          </div>

          <!-- Campaign Narrative / Story -->
          <article class="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm lg:text-base whitespace-pre-line py-2 font-medium">
            {{ fundraiser.description }}
          </article>

          <!-- Founding Donor Card -->
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/60 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex-1">
              <h4 class="text-base font-bold text-blue-950 mb-1">Give $20 and be a founding donor</h4>
              <p class="text-xs text-blue-800 leading-relaxed font-semibold">
                Your donation starts {{ fundraiser.organizer.toUpperCase() }}'s journey to success by inspiring others to help.
              </p>
            </div>
            <button @click="openDonate" class="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-full transition-all shrink-0">
              Donate
            </button>
          </div>

          <!-- Sharing Section -->
          <div class="py-4 border-t border-b border-slate-100 my-2">
            <h3 class="text-base font-bold text-slate-900 mb-1">Sharing helps more than you think</h3>
            <p class="text-slate-505 text-xs mb-4">
              On average, each share can inspire <strong>$18</strong> in donations, by helping this fundraiser reach more people.
            </p>
            <div class="flex items-center gap-3.5">
              <button @click="handleCopyLink" class="w-10 h-10 rounded-full border border-slate-200 hover:border-slate-400 hover:bg-slate-50 flex items-center justify-center transition-all text-slate-600 text-lg">
                <iconify-icon icon="ph:link-bold"></iconify-icon>
              </button>
              <a href="#" class="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all text-lg shadow-sm">
                <iconify-icon icon="ph:facebook-logo-fill"></iconify-icon>
              </a>
              <a href="#" class="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-all text-lg shadow-sm">
                <iconify-icon icon="ph:whatsapp-logo-fill"></iconify-icon>
              </a>
              <a href="#" class="w-10 h-10 rounded-full bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center transition-all text-lg shadow-sm">
                <iconify-icon icon="ph:messenger-logo-fill"></iconify-icon>
              </a>
              <a href="#" class="w-10 h-10 rounded-full bg-blue-800 hover:bg-blue-950 text-white flex items-center justify-center transition-all text-lg shadow-sm">
                <iconify-icon icon="ph:linkedin-logo-fill"></iconify-icon>
              </a>
            </div>
          </div>

          <!-- Organizer Section -->
          <div class="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-full bg-blue-55 text-blue-700 bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-base shrink-0">
                {{ fundraiser.organizer.split(' ').map(n => n[0]).join('') }}
              </div>
              <div>
                <h4 class="text-sm font-bold text-slate-900">Organizer</h4>
                <p class="text-xs text-slate-600 font-semibold">
                  {{ fundraiser.organizer }} &bull; {{ fundraiser.city }}, {{ fundraiser.country }}
                </p>
              </div>
            </div>
            <button class="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs px-5 py-2.5 rounded-full transition-all shrink-0 shadow-sm">
              Message
            </button>
          </div>

          <!-- Comments Section -->
          <div class="flex flex-col gap-4">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 class="text-base font-bold text-slate-950">Comments</h3>
              <span class="text-xs text-slate-400 font-medium">{{ comments.length }} messages</span>
            </div>

            <div v-if="comments.length > 0" class="flex flex-col gap-4">
              <div v-for="(comment, idx) in comments" :key="idx" class="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex items-start gap-4">
                <div class="w-9 h-9 rounded-full bg-slate-100 text-slate-505 flex items-center justify-center font-bold text-xs shrink-0">
                  {{ comment.name.split(' ').map(n => n[0]).join('') || 'A' }}
                </div>
                <div class="flex-1 text-xs">
                  <div class="flex items-center justify-between mb-1">
                    <span class="font-bold text-slate-800">{{ comment.name }}</span>
                    <span class="text-slate-400">{{ comment.time }}</span>
                  </div>
                  <p class="text-slate-600 leading-relaxed font-semibold mb-1.5">{{ comment.comment }}</p>
                  <span class="text-[10px] bg-blue-50 border border-blue-100/50 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                    Donated ${{ comment.amount }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Empty Comments state -->
            <div v-else class="text-center py-8 border border-dashed border-slate-200 rounded-2xl bg-slate-50/20">
              <p class="text-xs text-slate-500 font-bold mb-1">Please donate to comment.</p>
              <p class="text-[10px] text-slate-400 font-semibold">Share your care with words of encouragement.</p>
            </div>
          </div>

        </div>

        <!-- Right Column: Sticky Sidebar Card (4 cols) -->
        <div class="lg:col-span-4 lg:sticky lg:top-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-md hover:shadow-lg transition-shadow">
          
          <!-- Donation Progress info -->
          <div class="mb-5">
            <h3 class="text-xl font-bold text-slate-900 mb-1 flex items-baseline gap-1">
              <span v-if="fundraiser.raisedAmount === 0">Be the first to donate</span>
              <span v-else>${{ fundraiser.raisedAmount }} USD</span>
              <span class="text-xs text-slate-400 font-semibold">raised of ${{ fundraiser.targetAmount }} goal</span>
            </h3>

            <!-- Progress Bar -->
            <div class="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
              <div class="bg-blue-600 h-full rounded-full transition-all duration-500" :style="{ width: progressPercent + '%' }"></div>
            </div>

            <div class="flex justify-between items-center text-xs font-semibold text-slate-400 mt-1">
              <span>{{ progressPercent }}% completed</span>
              <span>{{ fundraiser.donorCount }} donations</span>
            </div>
          </div>

          <!-- Buttons -->
          <div class="flex flex-col gap-3">
            <button @click="openDonate" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3.5 rounded-2xl shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer">
              <iconify-icon icon="ph:heart-fill" class="text-lg"></iconify-icon>
              <span>Donate now</span>
            </button>
            <button @click="handleCopyLink" class="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer">
              <iconify-icon icon="ph:share-network-bold" class="text-lg"></iconify-icon>
              <span>Share</span>
            </button>
          </div>

          <!-- Guarantee note -->
          <div class="mt-6 border-t border-slate-100 pt-5 flex gap-3 text-left">
            <iconify-icon icon="ph:shield-check-bold" class="text-blue-600 text-xl shrink-0 mt-0.5"></iconify-icon>
            <div class="text-[11px] leading-relaxed text-slate-500">
              <p class="font-bold text-slate-800 mb-0.5">HelpFund Protection Guarantee</p>
              <p>We guarantee a full refund for up to a year in the rare case that fraud occurs. <a href="#" class="text-blue-600 underline font-bold hover:text-blue-755">See details</a>.</p>
            </div>
          </div>

        </div>

      </div>
    </main>

    <!-- Success toast -->
    <div v-if="showToast" class="fixed bottom-6 right-6 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50 animate-bounce">
      <iconify-icon icon="ph:check-circle-bold" class="text-blue-400 text-base"></iconify-icon>
      <span>{{ toastMessage }}</span>
    </div>

    <!-- Donation Modal Dialog -->
    <div v-if="showDonateModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl w-full max-w-md p-6 border border-slate-100 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-250">
        
        <button @click="showDonateModal = false" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xl cursor-pointer">
          <iconify-icon icon="ph:x-bold"></iconify-icon>
        </button>

        <div v-if="donationSuccess" class="py-8 flex flex-col items-center justify-center text-center">
          <div class="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-3xl mb-4 text-blue-500">
            <iconify-icon icon="ph:sparkle-fill" class="animate-ping absolute w-6 h-6 opacity-30"></iconify-icon>
            <iconify-icon icon="ph:check-circle-fill"></iconify-icon>
          </div>
          <h3 class="text-xl font-bold text-slate-950 mb-1">Thank you!</h3>
          <p class="text-slate-505 text-xs font-semibold">Your donation of ${{ donationAmount }} has been processed successfully.</p>
        </div>

        <div v-else>
          <h3 class="text-lg font-bold text-slate-900 mb-1 flex items-center gap-1.5 text-left">
            <iconify-icon icon="ph:heart-fill" class="text-blue-500"></iconify-icon>
            <span>Support this fundraiser</span>
          </h3>
          <p class="text-slate-400 text-xs mb-5 text-left font-semibold">100% of your donation goes directly to verified expenses.</p>

          <!-- Quick Select -->
          <div class="grid grid-cols-4 gap-2 mb-4">
            <button v-for="amt in [10, 20, 50, 100]" :key="amt" 
                    @click="donationAmount = amt" 
                    class="py-2.5 rounded-xl border font-bold text-xs transition-all cursor-pointer"
                    :class="donationAmount === amt ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' : 'bg-slate-50 border-slate-200 hover:border-slate-400 text-slate-700'">
              ${{ amt }}
            </button>
          </div>

          <!-- Custom Amount input -->
          <div class="mb-4 text-left">
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Or Enter custom amount</label>
            <div class="relative rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
              <span class="absolute left-3.5 top-3.5 font-bold text-sm text-slate-500">$</span>
              <input type="number" v-model="donationAmount" class="w-full pl-8 pr-12 py-3 focus:outline-none text-sm font-bold text-slate-800" min="1" />
              <span class="absolute right-3.5 top-3.5 text-xs text-slate-400 font-bold uppercase">USD</span>
            </div>
          </div>

          <!-- Name field -->
          <div class="mb-4 text-left">
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Your Name</label>
            <input type="text" v-model="donorName" placeholder="Anonymous" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold" />
          </div>

          <!-- Comment field -->
          <div class="mb-5 text-left">
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Add message of support</label>
            <textarea v-model="donorComment" placeholder="Send support (optional)..." class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold h-20 resize-none"></textarea>
          </div>

          <!-- Action -->
          <button @click="submitDonation" :disabled="donationAmount <= 0 || isSubmittingDonation" class="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white font-bold text-sm rounded-xl shadow-md disabled:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer">
            <span v-if="isSubmittingDonation" class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>Submit Donation (${{ donationAmount }} USD)</span>
          </button>
        </div>

      </div>
    </div>

    <MainFooter />
  </div>

  <div v-else class="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
    <iconify-icon icon="ph:warning-bold" class="text-red-500 text-5xl mb-4"></iconify-icon>
    <h3 class="text-xl font-bold text-slate-900 mb-2">Fundraiser Not Found</h3>
    <RouterLink to="/" class="px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-full shadow hover:bg-blue-700 transition-all">
      Return Home
    </RouterLink>
  </div>
</template>

<style scoped>
@keyframes in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-in {
  animation: in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
