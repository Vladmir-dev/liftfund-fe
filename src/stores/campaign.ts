import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface Campaign {
  id: string
  title: string
  story: string
  category: string
  country: string
  zipCode: string
  beneficiary: 'Yourself' | 'Someone else' | 'Charity'
  targetAmount: number
  useAutomatedGoal: boolean
  startingGoal: number
  mediaUrl: string | null
  createdAt: string
  organizer: string
  city: string
  raisedAmount: number
  donorCount: number
  daysLeft: number
}

export const useCampaignStore = defineStore('campaign', () => {
  // Onboarding Wizard steps (0 = init category/zip, 1-6 = wizard steps)
  const currentStep = ref(0)

  // Step 0 fields
  const country = ref('United States')
  const zipCode = ref('')
  const selectedCategory = ref<string | null>(null)

  // Step 1 fields
  const beneficiary = ref<'Yourself' | 'Someone else' | 'Charity'>('Yourself')

  // Step 2 fields
  const targetAmount = ref<number>(20)
  const useAutomatedGoal = ref(true)

  // Step 3 fields
  const mediaFile = ref<File | null>(null)
  const mediaUrl = ref<string | null>(null)
  const extraPhotos = ref<string[]>([])
  const youtubeLink = ref('')

  // Step 4 fields
  const story = ref('')

  // Step 5 fields
  const title = ref('')

  // Starting goal computation: 10% of target amount, minimum $200
  const startingGoal = computed(() => {
    if (!useAutomatedGoal.value) return targetAmount.value
    // If target is very small (like $20), starting goal is still $200 as per HelpFund screenshots
    return Math.max(200, Math.round(targetAmount.value * 0.10))
  })

  // Set media file and create local preview URL
  function setMedia(file: File | null) {
    mediaFile.value = file
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

  // Simulate AI Story Enhancement
  function enhanceStory() {
    if (!story.value || story.value.trim().length === 0) {
      story.value = 'We are starting this fundraiser to support community initiatives and help those in need. Every small contribution counts.'
      return
    }

    // Check if they used lorem or basic text, and replace with a beautiful narrative
    const basicText = story.value.toLowerCase()
    if (basicText.includes('lorem20') || basicText.includes('quick') || basicText.length < 150) {
      story.value = `We are reaching out to ask for your generous support to help our community cats. With winter approaching, we need to secure cozy shelters, nutritious food, and vital veterinary care for over 120 stray and abandoned cats in our neighborhood. Your donations will directly fund outdoor insulated cat houses, food supplies, and TNR (Trap-Neuter-Return) medical services. Even a small gift can provide warmth and comfort to a vulnerable animal. Thank you for your kindness and for sharing our mission with others!`
    } else {
      // General professional polish
      story.value = `Dear friends and supporters, we are launching this campaign to address urgent needs. ${story.value.trim()} Your contributions make a critical difference. Please help us build momentum by donating and sharing this campaign within your networks. Thank you for standing with us.`
    }
  }

  function resetForm() {
    currentStep.value = 0
    country.value = 'United States'
    zipCode.value = ''
    selectedCategory.value = null
    beneficiary.value = 'Yourself'
    targetAmount.value = 20
    useAutomatedGoal.value = true
    mediaFile.value = null
    mediaUrl.value = null
    extraPhotos.value = []
    youtubeLink.value = ''
    story.value = ''
    title.value = ''
  }

  // Save campaign to local storage and global list
  function saveCampaign(organizerName: string, city: string = 'Beverly Hills'): Campaign {
    const newCampaign: Campaign = {
      id: 'camp-' + Math.random().toString(36).substring(2, 9),
      title: title.value || `Help support ${selectedCategory.value || 'our cause'}`,
      story: story.value || 'No story details provided yet.',
      category: selectedCategory.value || 'Community',
      country: country.value,
      zipCode: zipCode.value,
      beneficiary: beneficiary.value,
      targetAmount: targetAmount.value,
      useAutomatedGoal: useAutomatedGoal.value,
      startingGoal: startingGoal.value,
      mediaUrl: mediaUrl.value,
      createdAt: new Date().toISOString(),
      organizer: organizerName || 'John Doe',
      city: city || 'Beverly Hills',
      raisedAmount: 0,
      donorCount: 0,
      daysLeft: 30
    }

    // Save to local storage
    const savedCampaigns = JSON.parse(localStorage.getItem('helpfund_campaigns') || '[]')
    savedCampaigns.push(newCampaign)
    localStorage.setItem('helpfund_campaigns', JSON.stringify(savedCampaigns))

    return newCampaign
  }

  return {
    currentStep,
    country,
    zipCode,
    selectedCategory,
    beneficiary,
    targetAmount,
    useAutomatedGoal,
    startingGoal,
    mediaFile,
    mediaUrl,
    extraPhotos,
    youtubeLink,
    story,
    title,
    setMedia,
    enhanceStory,
    resetForm,
    saveCampaign
  }
})
