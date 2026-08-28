<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCampaignStore } from '../../../stores/campaign'
import { useLandingStore } from '../../landing/stores'
import { storeToRefs } from 'pinia'

// Import split components
import StepInitial from '../components/signup/StepInitial.vue'
import StepTarget from '../components/signup/StepTarget.vue'
import StepAmount from '../components/signup/StepAmount.vue'
import StepMedia from '../components/signup/StepMedia.vue'
import StepStory from '../components/signup/StepStory.vue'
import StepTitle from '../components/signup/StepTitle.vue'
import StepReview from '../components/signup/StepReview.vue'

const router = useRouter()
const campaignStore = useCampaignStore()
const landingStore = useLandingStore()

// Extract state reactive refs
const {
  currentStep,
  country,
  zipCode,
  selectedCategory,
  beneficiary,
  targetAmount,
  useAutomatedGoal,
  startingGoal,
  mediaUrl,
  youtubeLink,
  story,
  title
} = storeToRefs(campaignStore)

const categories = [
  'Animals', 'Business', 'Community', 'Competitions', 'Creative',
  'Education', 'Emergencies', 'Environment', 'Events', 'Faith',
  'Family', 'Funerals & Memorials', 'Medical', 'Monthly Bills',
  'Newlyweds', 'Other', 'Sports', 'Travel', 'Ukraine Relief',
  'Volunteer', 'Wishes'
]

// Map ZIP to city
const resolvedCity = computed(() => {
  const zip = zipCode.value.trim()
  if (zip === '90210') return 'Beverly Hills'
  if (zip.startsWith('100')) return 'New York'
  if (zip.startsWith('606')) return 'Chicago'
  if (zip.startsWith('941')) return 'San Francisco'
  if (zip.startsWith('900')) return 'Los Angeles'
  return 'Beverly Hills' // default matching the screenshot
})

const selectCategory = (cat: string) => {
  selectedCategory.value = cat
}

// Validation rules
const zipCodeValid = computed(() => {
  return zipCode.value.trim().length >= 5
})

const initialStepValid = computed(() => {
  return zipCodeValid.value && selectedCategory.value !== null
})

const amountValid = computed(() => {
  return targetAmount.value > 1
})

const wordCount = computed(() => {
  if (!story.value) return 0
  const cleanText = story.value.trim().replace(/\s+/g, ' ')
  return cleanText === '' ? 0 : cleanText.split(' ').length
})

const storyValid = computed(() => {
  return wordCount.value >= 20
})

const titleValid = computed(() => {
  return title.value.trim().length > 0 && title.value.trim().length <= 60
})

// Wizard logic
const handleContinue = () => {
  if (currentStep.value === 0 && initialStepValid.value) {
    currentStep.value = 1
  } else if (currentStep.value === 1) {
    currentStep.value = 2
  } else if (currentStep.value === 2 && amountValid.value) {
    currentStep.value = 3
  } else if (currentStep.value === 3) {
    currentStep.value = 4
  } else if (currentStep.value === 4 && storyValid.value) {
    currentStep.value = 5
  } else if (currentStep.value === 5 && titleValid.value) {
    currentStep.value = 6
  }
}

const handleBack = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const editStep = (step: number) => {
  currentStep.value = step
}

// Media upload handler
const fileInputRef = ref<HTMLInputElement | null>(null)
const triggerUpload = () => {
  fileInputRef.value?.click()
}

const onFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    campaignStore.setMedia(target.files[0])
  }
}

const removeMedia = () => {
  campaignStore.setMedia(null)
}

// Edit Media Modal state
const showEditMediaModal = ref(false)
const openEditMediaModal = () => {
  showEditMediaModal.value = true
}
const closeEditMediaModal = () => {
  showEditMediaModal.value = false
}

// ================= VERIFICATION SEQUENCE STATE =================
// 'none' | 'phone_setup' | 'code_entry' | 'marketing_opt_in' | 'insights_show'
const verificationStep = ref<'none' | 'phone_setup' | 'code_entry' | 'marketing_opt_in' | 'insights_show'>('none')
const phoneCountryCode = ref('+256')
const phoneNumber = ref('0701627925')
const otpDigits = ref<string[]>(['', '', '', '', '', ''])
const otpInputs = ref<HTMLInputElement[]>([])
const marketingConsentChecked = ref(true)

const maskedPhoneNumber = computed(() => {
  const full = phoneNumber.value.trim()
  if (full.length < 5) return full
  return `${phoneCountryCode.value}******${full.slice(-5)}`
})

const onOtpInput = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement
  const val = target.value
  if (val.length > 1) {
    target.value = val.slice(-1)
  }
  otpDigits.value[index] = target.value

  if (target.value && index < 5) {
    const nextInput = otpInputs.value[index + 1]
    nextInput?.focus()
  }
}

const onOtpKeyDown = (index: number, event: KeyboardEvent) => {
  if (event.key === 'Backspace' && index > 0 && !otpDigits.value[index]) {
    otpDigits.value[index - 1] = ''
    const prevInput = otpInputs.value[index - 1]
    prevInput?.focus()
  }
}

const setOtpInputRef = (index: number, el: any) => {
  if (el) otpInputs.value[index] = el
}

const startVerification = () => {
  verificationStep.value = 'phone_setup'
}

const sendOtpCode = () => {
  if (!phoneNumber.value) return
  verificationStep.value = 'code_entry'
}

const verifyOtpCode = () => {
  verificationStep.value = 'marketing_opt_in'
}

const submitMarketingOptIn = () => {
  verificationStep.value = 'insights_show'
}

const skipMarketingOptIn = () => {
  verificationStep.value = 'insights_show'
}

// Confetti & Launch finalization
const isLaunching = ref(false)
const showConfetti = ref(false)
const launchSuccess = ref(false)

const handleFinishInsights = () => {
  verificationStep.value = 'none'
  isLaunching.value = true
  setTimeout(() => {
    isLaunching.value = false

    // Save campaign in store & localStorage
    const saved = campaignStore.saveCampaign('John Doe', resolvedCity.value)

    // Prepend to landingStore list
    landingStore.addCampaignToFundraisers(saved)

    showConfetti.value = true
    launchSuccess.value = true

    setTimeout(() => {
      campaignStore.resetForm()
      // Redirect directly to campaign dashboard
      router.push(`/campaign/${saved.id}/dashboard`)
    }, 2800)
  }, 1200)
}

// Full Public Campaign Preview
const showPreviewModal = ref(false)
const openPreview = () => {
  showPreviewModal.value = true
}
const closePreview = () => {
  showPreviewModal.value = false
}

// AI story enhancement
const isEnhancing = ref(false)
const handleEnhanceStory = () => {
  isEnhancing.value = true
  setTimeout(() => {
    campaignStore.enhanceStory()
    isEnhancing.value = false
  }, 1000)
}
</script>

<template>
  <div
    class="min-h-screen bg-slate-100 flex flex-col md:flex-row relative font-sans text-slate-800 antialiased overflow-x-hidden">

    <!-- LEFT PANEL: Dynamic steps info (Light Slate Background) -->
    <div
      class="w-full md:w-[420px] bg-slate-50 border-r border-slate-200/60 flex flex-col justify-between p-8 md:p-12 text-left relative shrink-0">

      <!-- Logo matches HelpFund header -->
      <button @click="router.push('/')"
        class="flex items-center gap-1.5 text-slate-800 focus:outline-none cursor-pointer">
        <iconify-icon icon="lucide:sunrise" class="text-blue-500 text-2xl"></iconify-icon>
        <span class="text-lg font-black tracking-tight text-slate-900">helpfund</span>
      </button>

      <!-- Dynamic Sidebar content based on currentStep -->
      <div class="my-16 md:my-0 flex-1 flex flex-col justify-center">
        <!-- Step Indicator -->
        <span v-if="currentStep > 0 && currentStep <= 5"
          class="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">
          {{ currentStep }} of 6
        </span>

        <h1
          class="text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight mb-4 transition-all duration-300">
          <template v-if="currentStep === 0">Let's begin your fundraising journey</template>
          <template v-else-if="currentStep === 1">Tell us who you're raising funds for</template>
          <template v-else-if="currentStep === 2">Tell us how much you'd like to raise</template>
          <template v-else-if="currentStep === 3">Add media</template>
          <template v-else-if="currentStep === 4">Tell donors your story</template>
          <template v-else-if="currentStep === 5">Give your fundraiser a title</template>
          <template v-else-if="currentStep === 6">Review your fundraiser</template>
        </h1>

        <p class="text-slate-500 text-sm leading-relaxed transition-all duration-300">
          <template v-if="currentStep === 0">
            We're here to guide you every step of the way. Set up your bank deposits and select the category that best
            matches your target goal.
          </template>
          <template v-else-if="currentStep === 1">
            This information helps us get to know you and your fundraising needs.
          </template>
          <template v-else-if="currentStep === 2">
            Keep in mind that you can change this goal at any time.
          </template>
          <template v-else-if="currentStep === 3">
            Using a bright and clear photo helps people connect to your fundraiser right away.
          </template>
          <template v-else-if="currentStep === 4">
            Share who you are, what you're raising money for, and how the funds will make an impact.
          </template>
          <template v-else-if="currentStep === 5">
            A catchy and direct title helps people immediately understand what your cause is.
          </template>
          <template v-else-if="currentStep === 6">
            Let's make sure your fundraiser is complete
          </template>
        </p>
      </div>

      <!-- Action help -->
      <div class="text-xs text-slate-400 font-medium">
        Already have an account? <RouterLink to="/login" class="text-blue-600 font-bold hover:underline">Sign in
        </RouterLink>
      </div>

    </div>

    <!-- RIGHT PANEL: Onboarding wizard pages (White panel with rounded corner overlay) -->
    <div
      class="flex-1 flex flex-col justify-between relative bg-slate-50 md:bg-slate-50 md:rounded-tl-[40px] md:shadow-inner md:border-t md:border-l md:border-white/20">

      <!-- Inner Form White Area -->
      <div
        class="flex-grow flex flex-col justify-center p-8 md:p-12 lg:p-16 max-w-3xl w-full mx-auto bg-white md:my-6 md:rounded-3xl md:shadow-sm border border-slate-100/60 overflow-y-auto">

        <!-- HIDDEN INPUT FOR FILE UPLOAD -->
        <input type="file" ref="fileInputRef" accept="image/*" class="hidden" @change="onFileSelected" />

        <!-- STEP COMPONENT SECTIONS -->
        <StepInitial v-if="currentStep === 0" v-model:country="country" v-model:zipCode="zipCode"
          :selectedCategory="selectedCategory" :categories="categories" @selectCategory="selectCategory" />

        <StepTarget v-else-if="currentStep === 1" v-model:beneficiary="beneficiary" />

        <StepAmount v-else-if="currentStep === 2" v-model:targetAmount="targetAmount"
          v-model:useAutomatedGoal="useAutomatedGoal" :startingGoal="startingGoal" :amountValid="amountValid" />

        <StepMedia v-else-if="currentStep === 3" :mediaUrl="mediaUrl" @triggerUpload="triggerUpload"
          @openEditMediaModal="openEditMediaModal" @removeMedia="removeMedia" />

        <StepStory v-else-if="currentStep === 4" v-model:story="story" :wordCount="wordCount" :storyValid="storyValid"
          :isEnhancing="isEnhancing" @enhanceStory="handleEnhanceStory" />

        <StepTitle v-else-if="currentStep === 5" v-model:title="title" />

        <StepReview v-else-if="currentStep === 6" :title="title" :targetAmount="targetAmount"
          :useAutomatedGoal="useAutomatedGoal" :startingGoal="startingGoal" :selectedCategory="selectedCategory"
          :zipCode="zipCode" :resolvedCity="resolvedCity" :story="story" :mediaUrl="mediaUrl" @editStep="editStep"
          @openPreview="openPreview" />

      </div>

      <!-- ACTION FOOTER: Buttons and Dynamic progress line -->
      <div class="w-full mt-auto relative z-10">

        <!-- Blue Step progress line -->
        <div class="w-full bg-slate-200/50 h-[3px]">
          <div class="bg-blue-600 h-full transition-all duration-300"
            :style="{ width: currentStep === 0 ? '0%' : (currentStep * 16.6) + '%' }"></div>
        </div>

        <div class="bg-white border-t border-slate-100 py-4 px-6 md:px-12 flex items-center justify-between">

          <!-- Back arrow button (white square box) -->
          <button v-if="currentStep > 0 && !launchSuccess" @click="handleBack"
            class="w-10 h-10 rounded-xl border border-slate-200 hover:border-slate-400 bg-white flex items-center justify-center transition-all hover:bg-slate-50 text-slate-600 text-sm shrink-0 cursor-pointer">
            <iconify-icon icon="ph:arrow-left-bold"></iconify-icon>
          </button>

          <!-- Spacer in step 0 -->
          <div v-else></div>

          <!-- Right side buttons -->
          <div class="flex items-center gap-3">
            <!-- Skip link in Step 3 -->
            <button v-if="currentStep === 3" @click="currentStep = 4"
              class="text-xs font-bold text-slate-500 hover:text-slate-800 hover:underline cursor-pointer">
              Skip for now
            </button>

            <!-- Dynamically styled next button -->
            <button v-if="currentStep < 5" @click="handleContinue"
              :disabled="(currentStep === 0 && !initialStepValid) || (currentStep === 2 && !amountValid) || (currentStep === 4 && !storyValid)"
              class="px-8 py-3 font-bold text-xs rounded-full shadow-md transition-all flex items-center gap-2 cursor-pointer"
              :class="(currentStep === 0 && !initialStepValid) || (currentStep === 2 && !amountValid) || (currentStep === 4 && !storyValid) ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-slate-900 text-white hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98]'">
              <span>Continue</span>
            </button>

            <!-- Step 5 has 'Review' button -->
            <button v-else-if="currentStep === 5" @click="handleContinue" :disabled="!titleValid"
              class="px-8 py-3 font-bold text-xs rounded-full shadow-md transition-all flex items-center gap-2 cursor-pointer"
              :class="!titleValid ? 'bg-gray-800 text-white cursor-not-allowed shadow-none' : 'bg-gray-800 text-white hover:bg-gray-700 hover:scale-[1.02] active:scale-[0.98]'">
              <span>Review</span>
            </button>

            <!-- Step 6 has 'Preview' and 'Launch fundraiser' -->
            <div v-else-if="currentStep === 6 && !launchSuccess" class="flex items-center gap-3.5">
              <button @click="openPreview"
                class="px-6 py-2.5 bg-white border border-slate-200 hover:border-slate-400 text-slate-700 font-bold text-xs rounded-full shadow-sm hover:bg-slate-50 transition-all cursor-pointer font-sans">
                Preview
              </button>

              <button @click="startVerification" :disabled="isLaunching"
                class="px-6 py-2.5 bg-gray-800 hover:bg-gray-800 text-white font-bold text-xs rounded-full shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer font-sans">
                <span v-if="isLaunching"
                  class="h-3 w-3 border-2 border-slate-800 border-t-transparent rounded-full animate-spin"></span>
                <span>Launch fundraiser</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>

    <!-- NATIVE CONFETTI & SUCCESS OVERLAY DIALOG -->
    <div v-if="showConfetti"
      class="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-md z-50 flex items-center justify-center">

      <!-- Confetti Particles -->
      <div class="confetti-container absolute inset-0 pointer-events-none">
        <div v-for="n in 30" :key="n" class="confetti-particle absolute" :style="{
          left: Math.random() * 100 + '%',
          top: -20 + 'px',
          backgroundColor: ['#2563eb', '#60a5fa', '#eab308', '#ec4899', '#a855f7', '#3b82f6'][n % 6],
          animationDelay: Math.random() * 2 + 's',
          animationDuration: (Math.random() * 2 + 1.5) + 's',
          transform: `rotate(${Math.random() * 360}deg)`
        }"></div>
      </div>

      <div
        class="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-100 shadow-2xl text-center relative z-10 animate-fade-in-up">
        <div
          class="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-4xl mb-4 text-blue-500 mx-auto shadow-sm">
          <iconify-icon icon="fa6-solid:circle-check" class="animate-pulse"></iconify-icon>
        </div>
        <h2 class="text-2xl font-bold text-slate-900 mb-2">Campaign Initialized!</h2>
        <p class="text-slate-500 text-sm mb-4">Great choice! Launching your custom fundraiser dashboard.</p>
        <span class="text-xs text-slate-400 font-medium animate-pulse">Loading campaign dashboard...</span>
      </div>
    </div>

    <!-- EDIT MEDIA MODAL DIALOG (Step 3/6) -->
    <div v-if="showEditMediaModal"
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        class="bg-white rounded-3xl w-full max-w-lg p-6 border border-slate-100 shadow-2xl relative overflow-hidden animate-in fade-in duration-200">

        <button @click="closeEditMediaModal"
          class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xl focus:outline-none cursor-pointer">
          <iconify-icon icon="ph:x-bold"></iconify-icon>
        </button>

        <h3 class="text-lg font-bold text-slate-900 mb-4 text-left">Edit media</h3>

        <div class="flex flex-col gap-5 text-left">

          <div
            class="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm max-w-md mx-auto w-full">
            <img :src="mediaUrl || ''" class="w-full h-full object-cover" />
            <span
              class="absolute top-3 right-3 bg-blue-50 text-blue-700 text-[9px] font-bold px-2 py-0.5 rounded border border-blue-200 uppercase tracking-wide">
              Featured Photo
            </span>
          </div>

          <div
            class="flex justify-center items-center gap-6 border-b border-slate-100 pb-4 text-xs font-bold text-slate-600">
            <button class="hover:text-blue-700 flex items-center gap-1 cursor-pointer">
              <iconify-icon icon="ph:crop-bold" class="text-base"></iconify-icon>
              <span>Crop</span>
            </button>
            <button @click="triggerUpload" class="hover:text-blue-700 flex items-center gap-1 cursor-pointer">
              <iconify-icon icon="ph:arrow-clockwise-bold" class="text-base"></iconify-icon>
              <span>Replace</span>
            </button>
          </div>

          <p class="text-[11px] text-slate-500 leading-normal">
            These images will be used to create posts and messages for you and your network to share.
          </p>

          <div @click="triggerUpload"
            class="border border-dashed border-slate-200 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition-all hover:bg-slate-50/50 flex flex-col items-center justify-center gap-1.5">
            <iconify-icon icon="ph:image-square" class="text-slate-400 text-xl"></iconify-icon>
            <span class="text-xs font-semibold text-slate-600">Drag or upload up to 5 photos here</span>
          </div>

          <div class="flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <div class="flex-grow border-t border-slate-100 mr-2"></div>
            <span>or</span>
            <div class="flex-grow border-t border-slate-100 ml-2"></div>
          </div>

          <div>
            <div
              class="relative rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
              <iconify-icon icon="ph:link-bold" class="absolute left-3 top-3.5 text-slate-400"></iconify-icon>
              <input type="text" v-model="youtubeLink" placeholder="Add a YouTube link"
                class="w-full pl-9 pr-4 py-3 focus:outline-none text-xs font-medium text-slate-700" />
            </div>
          </div>

          <button @click="closeEditMediaModal"
            class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer">
            Done
          </button>

        </div>

      </div>
    </div>

    <!-- PREVIEW MODAL (HelpFund Preview Clone) -->
    <div v-if="showPreviewModal"
      class="fixed inset-0 bg-[#0f172a]/70 backdrop-blur-sm z-50 overflow-y-auto p-4 md:p-8 flex items-start justify-center">
      <div
        class="bg-white rounded-3xl w-full max-w-6xl shadow-2xl relative border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-250">

        <button @click="closePreview"
          class="absolute top-4 right-4 bg-slate-900/60 backdrop-blur-sm text-white hover:bg-slate-900/80 text-xl p-2 rounded-full z-50 flex focus:outline-none shadow-md cursor-pointer">
          <iconify-icon icon="ph:x-bold"></iconify-icon>
        </button>

        <div class="text-[10px] font-bold uppercase bg-slate-900 text-yellow-400 text-center py-2 z-10 relative">
          Preview Mode &bull; This is how your page will look once launched.
        </div>

        <div class="max-h-[85vh] overflow-y-auto text-left">
          <!-- HelpFund Clone Header -->
          <div class="border-b border-slate-100 py-3 bg-white flex items-center justify-between px-6">
            <div class="flex items-center gap-1.5">
              <iconify-icon icon="lucide:sunrise" class="text-blue-500 text-xl"></iconify-icon>
              <span class="text-sm font-black tracking-tight text-slate-900">helpfund</span>
            </div>
            <div class="flex items-center gap-4 text-xs font-bold text-slate-700">
              <span class="hover:text-blue-600 cursor-pointer">Search</span>
              <span class="hover:text-blue-600 cursor-pointer">Donate</span>
              <span class="hover:text-blue-600 cursor-pointer">Fundraise</span>
              <span class="hover:text-blue-600 cursor-pointer">About</span>
              <div class="flex items-center gap-1 cursor-pointer">
                <div
                  class="w-5 h-5 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                  J</div>
                <span>John</span>
              </div>
            </div>
          </div>

          <!-- Campaign Details -->
          <div class="max-w-5xl mx-auto px-6 py-8 text-left">
            <h1 class="text-2xl lg:text-3xl font-extrabold text-slate-900 mb-6 tracking-tight">
              {{ title || 'Help Cats' }}
            </h1>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              <!-- Left section -->
              <div class="lg:col-span-8 flex flex-col gap-6">
                <!-- Cover Image -->
                <div
                  class="aspect-video w-full rounded-2xl overflow-hidden bg-blue-50/10 border border-slate-100 relative">
                  <img v-if="mediaUrl" :src="mediaUrl" class="w-full h-full object-cover" />
                  <div v-else
                    class="w-full h-full bg-gradient-to-tr from-blue-100 to-indigo-50 flex flex-col items-center justify-center text-slate-500 font-bold gap-1 text-xs">
                    <iconify-icon icon="lucide:sunrise" class="text-blue-500 text-3xl"></iconify-icon>
                    <span>helpfund</span>
                  </div>
                </div>

                <!-- Organizer brief header -->
                <div class="flex items-center gap-3 py-2 border-b border-slate-100">
                  <div
                    class="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                    JD</div>
                  <div class="text-[11px] text-slate-600 font-medium">
                    <span class="font-bold text-slate-900 block">JOHN DOE</span>
                    organizer &bull; Yourself
                  </div>
                </div>

                <!-- Protected tag -->
                <div class="bg-blue-50/30 border border-blue-100/50 rounded-xl p-3 flex items-center gap-2">
                  <iconify-icon icon="ph:shield-check-fill" class="text-blue-600 text-base shrink-0"></iconify-icon>
                  <span class="text-[10px] text-slate-600 leading-normal font-semibold">
                    Donation protected &bull; We guarantee a full refund for up to a year in the rare case that fraud
                    occurs.
                  </span>
                </div>

                <!-- Story text -->
                <p
                  class="text-xs lg:text-sm text-slate-600 leading-relaxed whitespace-pre-line border-b border-slate-100 pb-6 font-medium">
                  {{ story || 'lorem20 the quick brown fox jumped over the lazy old dog lorem20...' }}
                </p>

                <!-- Founding Donor card -->
                <div
                  class="bg-blue-50/50 border border-blue-100/60 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div>
                    <h4 class="font-bold text-blue-950 mb-0.5">Give $20 and be a founding donor</h4>
                    <p class="text-slate-500 font-semibold">Your donation starts John's journey to success by
                      inspiring
                      others to help.</p>
                  </div>
                  <button class="bg-blue-600 text-white font-bold px-4 py-2 rounded-full transition-all shrink-0">
                    Donate
                  </button>
                </div>

                <!-- Share notes -->
                <div>
                  <h4 class="text-xs font-bold text-slate-950 mb-2">Sharing helps more than you think</h4>
                  <p class="text-slate-500 text-[10px] mb-3 leading-normal">On average, each share can inspire $18 in
                    donations, by helping this fundraiser reach more people.</p>
                  <div
                    class="w-full aspect-video rounded-xl bg-slate-50 border border-slate-150 relative flex flex-col items-center justify-center p-6 mb-4">
                    <div
                      class="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 mb-2 shadow-sm">
                      <iconify-icon icon="ph:image-square"></iconify-icon>
                    </div>
                    <div class="absolute bottom-4 flex items-center gap-3.5 text-slate-500">
                      <iconify-icon icon="ph:link-bold"></iconify-icon>
                      <iconify-icon icon="ph:facebook-logo-fill" class="text-blue-600"></iconify-icon>
                      <iconify-icon icon="ph:whatsapp-logo-fill" class="text-emerald-500"></iconify-icon>
                      <iconify-icon icon="ph:messenger-logo-fill" class="text-blue-500"></iconify-icon>
                      <iconify-icon icon="ph:linkedin-logo-fill" class="text-blue-700"></iconify-icon>
                    </div>
                  </div>
                </div>

                <!-- Organizer block -->
                <div class="py-4 border-t border-b border-slate-100 flex items-center justify-between text-xs">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                      RM</div>
                    <div>
                      <h5 class="font-bold text-slate-900">JOHN DOE</h5>
                      <p class="text-slate-500 font-semibold">Organizer &bull; Beverly Hills, CA</p>
                    </div>
                  </div>
                  <button class="bg-white border border-slate-200 font-bold px-4 py-2 rounded-full">Message</button>
                </div>
              </div>

              <!-- Right sidebar card preview -->
              <div class="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                <div class="mb-4">
                  <div class="flex items-center gap-2 mb-2 text-xs">
                    <div
                      class="w-5 h-5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px]">
                      HF</div>
                    <span class="font-bold text-slate-700">Be the first to donate</span>
                  </div>

                  <button
                    class="w-full bg-blue-600 text-white font-extrabold text-xs py-3.5 rounded-xl mb-2 flex items-center justify-center gap-1.5 shadow-sm">
                    Donate now
                  </button>
                  <button
                    class="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3.5 rounded-xl mb-3 flex items-center justify-center gap-1.5 shadow-sm">
                    Share
                  </button>

                  <div class="text-[10px] text-slate-500 leading-normal flex gap-2 border-t border-slate-100 pt-3">
                    <iconify-icon icon="ph:shield-check-bold"
                      class="text-blue-600 text-base shrink-0 mt-0.5"></iconify-icon>
                    <div>
                      <p class="font-bold text-slate-800 mb-0.5">Become the first supporter</p>
                      <p>Your donation matters. HelpFund protects your donation. We guarantee you a full refund for up
                        to a
                        year...</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- ================= PHONE VERIFICATION SYSTEM MODALS ================= -->

    <!-- MODAL 1: SETUP PHONE NUMBER -->
    <div v-if="verificationStep === 'phone_setup'"
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        class="bg-white rounded-3xl w-full max-w-md p-6 border border-slate-100 shadow-2xl relative text-left animate-in fade-in duration-200">

        <button @click="verificationStep = 'none'"
          class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xl focus:outline-none cursor-pointer">
          <iconify-icon icon="ph:x-bold"></iconify-icon>
        </button>

        <div
          class="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-xl text-blue-600 mb-4">
          <iconify-icon icon="ph:shield-check-bold"></iconify-icon>
        </div>

        <h3 class="text-lg font-bold text-slate-900 mb-2">Set up phone verification for your protection</h3>
        <p class="text-slate-500 text-xs leading-relaxed mb-6 font-medium">
          Add your phone number to keep your account secure. We will send you a unique code to verify your identity
          which
          should only be entered in the HelpFund app or on helpfund.com.
        </p>

        <!-- Inputs Group -->
        <div class="flex gap-2.5 mb-5">
          <!-- Country code select -->
          <div class="w-24 relative shrink-0">
            <label class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Code</label>
            <div class="relative">
              <select v-model="phoneCountryCode"
                class="w-full bg-white px-3 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold appearance-none pr-8 cursor-pointer">
                <option>+256</option>
                <option>+1</option>
                <option>+44</option>
                <option>+61</option>
                <option>+49</option>
              </select>
              <iconify-icon icon="fa6-solid:chevron-down"
                class="absolute right-2.5 top-3.5 pointer-events-none text-slate-400 text-[10px]"></iconify-icon>
            </div>
          </div>

          <!-- Phone Number Input -->
          <div class="flex-grow">
            <label class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Phone number</label>
            <input type="tel" v-model="phoneNumber" placeholder="Phone number"
              class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold" />
          </div>
        </div>

        <!-- Agreement Terms -->
        <p class="text-[10px] text-slate-400 leading-normal mb-5 font-medium">
          By continuing, you agree to the HelpFund Terms of Service and acknowledge the Privacy Notice.
        </p>

        <button @click="sendOtpCode"
          class="w-full py-3 bg-[#1e3d30] hover:bg-[#152c22] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer">
          Send Code
        </button>
      </div>
    </div>

    <!-- MODAL 2: MOCK CODE ENTRY -->
    <div v-if="verificationStep === 'code_entry'"
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        class="bg-white rounded-3xl w-full max-w-md p-6 border border-slate-100 shadow-2xl relative text-left animate-in fade-in duration-200">

        <button @click="verificationStep = 'none'"
          class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xl focus:outline-none cursor-pointer">
          <iconify-icon icon="ph:x-bold"></iconify-icon>
        </button>

        <h3 class="text-lg font-bold text-slate-900 mb-2">Please complete verification</h3>
        <p class="text-slate-500 text-xs leading-relaxed mb-1 font-medium">
          Your safety is our top priority. Please enter the code we sent to your phone number <strong
            class="text-slate-800">{{ maskedPhoneNumber }}</strong>. Never share the code and only enter it here.
        </p>

        <!-- Not correct number links -->
        <button @click="verificationStep = 'phone_setup'"
          class="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline mb-6 cursor-pointer block focus:outline-none">
          Not the right number? Change number
        </button>

        <!-- OTP Input Grid -->
        <div class="flex gap-2.5 justify-center mb-4">
          <input v-for="(digit, idx) in 6" :key="idx" :ref="el => setOtpInputRef(idx, el)" type="text" maxlength="1"
            class="w-11 h-11 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-center rounded-xl font-bold text-sm bg-slate-50"
            @input="onOtpInput(idx, $event)" @keydown="onOtpKeyDown(idx, $event)" />
        </div>

        <p class="text-[10px] text-slate-400 font-semibold mb-4 text-center">This code will expire in 10 minutes.</p>

        <!-- Resend link -->
        <button @click="verifyOtpCode"
          class="text-[11px] font-bold text-blue-600 hover:underline block mb-6 focus:outline-none cursor-pointer">
          Resend code
        </button>

        <!-- Verify button -->
        <button @click="verifyOtpCode"
          class="w-full py-3 bg-[#1e3d30] hover:bg-[#152c22] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer">
          Verify
        </button>
      </div>
    </div>

    <!-- MODAL 3: MARKETING OPT-IN -->
    <div v-if="verificationStep === 'marketing_opt_in'"
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        class="bg-white rounded-3xl w-full max-w-md p-6 border border-slate-100 shadow-2xl relative text-center animate-in fade-in duration-200">

        <button @click="verificationStep = 'none'"
          class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xl focus:outline-none cursor-pointer">
          <iconify-icon icon="ph:x-bold"></iconify-icon>
        </button>

        <!-- Phone/Message icon -->
        <div
          class="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl text-blue-600 mx-auto mb-4">
          <iconify-icon icon="ph:chats-bold"></iconify-icon>
        </div>

        <h3 class="text-lg font-bold text-slate-900 mb-4">Receive texts with personal fundraising advice</h3>

        <!-- Prefilled Phone box -->
        <div
          class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-center gap-3 mb-4 text-left max-w-xs mx-auto">
          <iconify-icon icon="fa6-solid:flag-usa" v-if="phoneCountryCode === '+1'"
            class="text-slate-400 shrink-0"></iconify-icon>
          <iconify-icon icon="ph:phone-fill" v-else class="text-slate-400 shrink-0"></iconify-icon>
          <span class="text-xs font-bold text-slate-700">{{ phoneCountryCode }} {{ phoneNumber }}</span>
        </div>

        <!-- Marketing disclaimer checkbox -->
        <div class="flex gap-2.5 items-start text-left mb-6">
          <input type="checkbox" v-model="marketingConsentChecked" id="marketing-check"
            class="mt-1 cursor-pointer w-4 h-4 accent-blue-600 shrink-0" />
          <label for="marketing-check"
            class="text-[10px] text-slate-500 font-medium leading-relaxed cursor-pointer select-none">
            Send me HelpFund success tips and updates about this fundraiser I am creating on HelpFund through texts,
            which
            may be automated. Reply HELP for help or STOP to cancel. Msg and data rates may apply. Msg frequency may
            vary.
          </label>
        </div>

        <p class="text-[9px] text-slate-400 leading-normal mb-5 text-left font-medium">
          By clicking "Send me texts" you are agreeing to our <a href="#" class="underline hover:text-slate-700">Terms
            of
            Service</a>, <a href="#" class="underline hover:text-slate-700">SMS Terms</a>, and our <a href="#"
            class="underline hover:text-slate-700">Privacy Notice</a>.
        </p>

        <!-- Buttons row -->
        <div class="flex flex-col gap-3">
          <button @click="submitMarketingOptIn"
            class="w-full py-3 bg-gray-800 hover:bg-gray-900 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer">
            Send me texts
          </button>

          <button @click="skipMarketingOptIn"
            class="text-xs font-bold text-slate-500 hover:text-slate-800 hover:underline cursor-pointer focus:outline-none">
            Skip for now
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL 4: PERSONALIZED TIPS & INSIGHTS -->
    <div v-if="verificationStep === 'insights_show'"
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        class="bg-white rounded-3xl w-full max-w-md p-6 border border-slate-100 shadow-2xl relative text-center animate-in fade-in duration-200">

        <button @click="verificationStep = 'none'"
          class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xl focus:outline-none cursor-pointer">
          <iconify-icon icon="ph:x-bold"></iconify-icon>
        </button>

        <!-- Sprout/ Sunrise indicator -->
        <div
          class="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-base text-blue-600 mx-auto mb-4">
          <iconify-icon icon="lucide:sunrise"></iconify-icon>
        </div>

        <h3 class="text-lg font-bold text-slate-900 mb-2">Reach your goal with daily personalized tips and insights</h3>

        <!-- Core Insights graphic banner -->
        <div
          class="rounded-2xl bg-blue-50/50 p-6 flex items-center justify-center border border-blue-100/50 max-w-xs mx-auto mb-6 relative min-h-[160px] overflow-hidden">

          <!-- Image preview inside box -->
          <div class="w-32 aspect-square rounded-xl overflow-hidden shadow bg-slate-100 relative z-10">
            <img v-if="mediaUrl" :src="mediaUrl" class="w-full h-full object-cover" />
            <div v-else
              class="w-full h-full bg-gradient-to-tr from-blue-100 to-indigo-50 flex items-center justify-center text-blue-500">
              <iconify-icon icon="lucide:sunrise" class="text-2xl"></iconify-icon>
            </div>
          </div>

          <!-- Overlaid absolute stats boxes -->
          <div
            class="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-xl shadow-md border border-slate-100 text-slate-800 text-[10px] font-extrabold flex flex-col items-center shrink-0 z-20 hover:scale-105 transition-all">
            <span class="text-xs text-blue-600 font-black">32</span>
            <span class="text-[8px] text-slate-400 uppercase font-bold tracking-wider">Views</span>
          </div>

          <div
            class="absolute top-10 right-4 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-xl shadow-md border border-slate-100 text-slate-800 text-[10px] font-extrabold flex flex-col items-center shrink-0 z-20 hover:scale-105 transition-all">
            <span class="text-xs text-blue-600 font-black">24</span>
            <span class="text-[8px] text-slate-400 uppercase font-bold tracking-wider">Shares</span>
          </div>

          <div
            class="absolute bottom-4 left-1/3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-xl shadow-md border border-slate-100 text-slate-800 text-[10px] font-extrabold flex flex-col items-center shrink-0 z-20 hover:scale-105 transition-all">
            <span class="text-xs text-blue-600 font-black">12</span>
            <span class="text-[8px] text-slate-400 uppercase font-bold tracking-wider">Donations</span>
          </div>
        </div>

        <button @click="handleFinishInsights"
          class="w-full py-3 bg-[#1e3d30] hover:bg-[#152c22] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer">
          Continue
        </button>
      </div>
    </div>

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

@keyframes confetti-fall {
  0% {
    transform: translateY(-20px) rotate(0deg);
    opacity: 1;
  }

  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

.confetti-particle {
  width: 10px;
  height: 10px;
  border-radius: 20%;
  animation: confetti-fall linear infinite;
}

.confetti-particle:nth-child(2n) {
  border-radius: 50%;
  width: 8px;
  height: 8px;
}

.confetti-particle:nth-child(3n) {
  width: 12px;
  height: 6px;
  border-radius: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.25s ease-out forwards;
}

.animate-fade-in-up {
  animation: fadeInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
