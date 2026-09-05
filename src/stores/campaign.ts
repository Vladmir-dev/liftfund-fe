import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { campaignService, type CampaignCategory, type BackendCampaign } from '../services/campaign'
import { API_BASE_URL } from '../services/api'

export interface Campaign {
  id: string
  title: string
  story: string
  category: string
  categoryId?: string
  country: string
  zipCode: string
  beneficiary: 'Yourself' | 'Someone else' | 'Charity'
  targetAmount: number
  currency: string
  useAutomatedGoal: boolean
  startingGoal: number
  mediaUrl: string | null
  coverImageUrl?: string
  createdAt: string
  organizer: string
  city: string
  raisedAmount: number
  donorCount: number
  daysLeft: number
  status?: string
}

export const useCampaignStore = defineStore('campaign', () => {
  // Onboarding Wizard steps (0 = init category/zip, 1-6 = wizard steps)
  const currentStep = ref(0)

  // Categories from backend
  const categories = ref<CampaignCategory[]>([])
  const isLoadingCategories = ref(false)

  // Step 0 fields
  const country = ref('Uganda')
  const zipCode = ref('')
  const selectedCategory = ref<string | null>(null)
  const selectedCategoryId = ref<string | null>(null)

  // Step 1 fields
  const beneficiary = ref<'Yourself' | 'Someone else' | 'Charity'>('Yourself')

  // Step 2 fields
  const currency = ref<'UGX' | 'USD'>('USD')
  const targetAmount = ref<number>(10000) // default USD goal
  const useAutomatedGoal = ref(true)

  // Step 3 fields
  const mediaFile = ref<File | null>(null)
  const mediaUrl = ref<string | null>(null)
  const uploadedBackendUrl = ref<string | null>(null)
  const extraPhotos = ref<string[]>([])
  const youtubeLink = ref('')

  // Step 4 fields
  const story = ref('')

  // Step 5 fields
  const title = ref('')

  // Submission state
  const isSubmitting = ref(false)
  const submitError = ref('')

  // Load dynamic categories from backend
  async function loadCategories() {
    if (categories.value.length > 0) return
    isLoadingCategories.value = true
    try {
      const list = await campaignService.fetchCategories()
      categories.value = list
      if (list.length > 0 && !selectedCategory.value) {
        const first = list[0]
        if (first) {
          selectedCategory.value = first.name
          selectedCategoryId.value = first.id
        }
      }
    } catch {
      // Fallback categories if server hasn't seeded yet
      categories.value = [
        { id: 'cat-med', name: 'Medical', slug: 'medical' },
        { id: 'cat-emg', name: 'Emergency', slug: 'emergency' },
        { id: 'cat-edu', name: 'Education', slug: 'education' },
        { id: 'cat-ani', name: 'Animals', slug: 'animals' },
        { id: 'cat-com', name: 'Community', slug: 'community' },
        { id: 'cat-bus', name: 'Business', slug: 'business' },
        { id: 'cat-cre', name: 'Creative', slug: 'creative' },
        { id: 'cat-fai', name: 'Faith', slug: 'faith' },
        { id: 'cat-fam', name: 'Family', slug: 'family' },
        { id: 'cat-spo', name: 'Sports', slug: 'sports' },
        { id: 'cat-tra', name: 'Travel', slug: 'travel' },
        { id: 'cat-vol', name: 'Volunteer', slug: 'volunteer' },
        { id: 'cat-oth', name: 'Other', slug: 'other' },
      ]
      if (!selectedCategory.value) {
        selectedCategory.value = 'Community'
      }
    } finally {
      isLoadingCategories.value = false
    }
  }

  function selectCategory(cat: CampaignCategory | string) {
    if (typeof cat === 'string') {
      selectedCategory.value = cat
      const found = categories.value.find(c => c.name.toLowerCase() === cat.toLowerCase())
      if (found) selectedCategoryId.value = found.id
    } else {
      selectedCategory.value = cat.name
      selectedCategoryId.value = cat.id
    }
  }

  // Starting goal computation: 10% of target amount
  const startingGoal = computed(() => {
    if (!useAutomatedGoal.value) return targetAmount.value
    const minGoal = currency.value === 'UGX' ? 100000 : 50
    return Math.max(minGoal, Math.round(targetAmount.value * 0.10))
  })

  // Set media file and create local preview URL
  function setMedia(file: File | null) {
    mediaFile.value = file
    uploadedBackendUrl.value = null
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        mediaUrl.value = e.target?.result as string
      }
      reader.readAsDataURL(file)
    } else {
      mediaUrl.value = null
    }
  }

  // AI Story Enhancement
  function enhanceStory() {
    if (!story.value || story.value.trim().length === 0) {
      story.value = 'We are starting this fundraiser to support community initiatives and help those in need. Every small contribution makes a tremendous difference.'
      return
    }

    const basicText = story.value.toLowerCase()
    if (basicText.includes('lorem20') || basicText.includes('quick') || basicText.length < 150) {
      story.value = `We are reaching out to ask for your generous support. We are launching this urgent fundraiser to help our community members overcome unexpected hardships. Your donations will directly fund essential supplies, immediate relief, and ongoing rehabilitation efforts. Even a small contribution provides hope, warmth, and vital support. Thank you for your kindness and for sharing our mission with your family and friends!`
    } else {
      story.value = `Dear friends and supporters, we are launching this campaign to address urgent needs. ${story.value.trim()} Your contributions make a critical difference. Please help us build momentum by donating and sharing this campaign within your networks. Thank you for standing with us.`
    }
  }

  function resetForm() {
    currentStep.value = 0
    country.value = 'Uganda'
    zipCode.value = ''
    selectedCategory.value = categories.value[0]?.name || 'Community'
    selectedCategoryId.value = categories.value[0]?.id || null
    beneficiary.value = 'Yourself'
    currency.value = 'USD'
    targetAmount.value = 10000
    useAutomatedGoal.value = true
    mediaFile.value = null
    mediaUrl.value = null
    uploadedBackendUrl.value = null
    extraPhotos.value = []
    youtubeLink.value = ''
    story.value = ''
    title.value = ''
    submitError.value = ''
  }

  // Submit to backend and publish
  async function submitAndPublishCampaign(location: string = 'Kampala, Uganda'): Promise<BackendCampaign> {
    isSubmitting.value = true
    submitError.value = ''

    try {
      let coverPhotoUrl = uploadedBackendUrl.value || ''

      // 1. Upload cover image if selected
      if (mediaFile.value && !coverPhotoUrl) {
        try {
          const uploadRes = await campaignService.uploadImage(mediaFile.value)
          coverPhotoUrl = uploadRes.url
          uploadedBackendUrl.value = coverPhotoUrl
        } catch (uploadErr: any) {
          console.warn('Image upload failed, proceeding with default:', uploadErr)
        }
      }

      // If no photo was uploaded, use high quality unsplash default matching category
      if (!coverPhotoUrl && mediaUrl.value && mediaUrl.value.startsWith('http')) {
        coverPhotoUrl = mediaUrl.value
      }

      // 2. Prepare Category IDs
      let catIds: string[] = []
      if (selectedCategoryId.value && !selectedCategoryId.value.startsWith('cat-')) {
        catIds.push(selectedCategoryId.value)
      } else {
        const match = categories.value.find(c => c.name.toLowerCase() === (selectedCategory.value || '').toLowerCase())
        if (match && !match.id.startsWith('cat-')) {
          catIds.push(match.id)
        }
      }

      // 3. Create Campaign in backend
      const createdCampaign = await campaignService.createCampaign({
        title: title.value || `Help support ${selectedCategory.value || 'our cause'}`,
        story: story.value || 'No story details provided yet.',
        shortSummary: story.value ? story.value.slice(0, 150) : undefined,
        goalAmount: targetAmount.value,
        currency: currency.value,
        coverImageUrl: coverPhotoUrl ? (coverPhotoUrl.startsWith('http') ? coverPhotoUrl : `${API_BASE_URL}${coverPhotoUrl}`) : undefined,
        location: location,
        categoryIds: catIds.length > 0 ? catIds : undefined,
      })

      // 4. Publish the campaign
      try {
        await campaignService.publishCampaign(createdCampaign.id)
        createdCampaign.status = 'active'
      } catch (publishErr) {
        console.warn('Auto-publish note:', publishErr)
      }

      return createdCampaign
    } catch (err: any) {
      submitError.value = err.message || 'Failed to create campaign. Please check your inputs.'
      throw err
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    currentStep,
    categories,
    isLoadingCategories,
    country,
    zipCode,
    selectedCategory,
    selectedCategoryId,
    beneficiary,
    currency,
    targetAmount,
    useAutomatedGoal,
    startingGoal,
    mediaFile,
    mediaUrl,
    uploadedBackendUrl,
    extraPhotos,
    youtubeLink,
    story,
    title,
    isSubmitting,
    submitError,
    loadCategories,
    selectCategory,
    setMedia,
    enhanceStory,
    resetForm,
    submitAndPublishCampaign,
  }
})
