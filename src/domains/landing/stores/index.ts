import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Fundraiser, Category, FAQItem } from '../types'
import { campaignService } from '../../../services/campaign'

const formatUgandanPhone = (phone?: string): string => {
  let cleaned = (phone || '').replace(/[\s\-\(\)]/g, '')
  if (!cleaned) return '+256700000000'
  if (cleaned.startsWith('+')) return cleaned
  if (cleaned.startsWith('0')) return '+256' + cleaned.slice(1)
  if (cleaned.startsWith('256')) return '+' + cleaned
  return '+256' + cleaned
}

export const useLandingStore = defineStore('landing', () => {
  const fundraisers = ref<Fundraiser[]>([])

  // Categories Metadata
  const categories = ref<Category[]>([
    { id: 'medical', name: 'Medical', icon: 'heart', description: 'Help cover medical bills, treatments, and life-saving surgeries.', colorClass: 'bg-blue-50 text-blue-600 border-blue-100' },
    { id: 'emergency', name: 'Emergency', icon: 'shield-alert', description: 'Direct support for natural disasters, crises, and urgent safety needs.', colorClass: 'bg-red-50 text-red-600 border-red-100' },
    { id: 'community', name: 'Community', icon: 'users', description: 'Fund local neighborhood projects, community parks, and civic improvements.', colorClass: 'bg-amber-50 text-amber-600 border-amber-100' },
    { id: 'education', name: 'Education', icon: 'graduation-cap', description: 'Support student fees, class materials, technology, and learning environments.', colorClass: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { id: 'animals', name: 'Animals', icon: 'paw-print', description: 'Help animal shelters, rescue clinics, and vet care operations.', colorClass: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
    { id: 'creative', name: 'Creative', icon: 'palette', description: 'Support local art, photography, indie films, and publishing dreams.', colorClass: 'bg-purple-50 text-purple-600 border-purple-100' }
  ])

  // FAQ list
  const faqs = ref<FAQItem[]>([
    {
      question: 'How do I start a HelpFund fundraiser?',
      answer: 'Click the "Start a HelpFund" button, select your country, target category, and follow the simple steps to set up your story, cover photo, and goal.'
    },
    {
      question: 'Are donations on HelpFund secure?',
      answer: 'Yes, absolutely. We use industry-standard encryption protocols and secure gateway payments (MarzPay / Flutterwave) to protect your funds and personal information.'
    },
    {
      question: 'How do I withdraw the funds I raised?',
      answer: 'You can request direct bank transfers or mobile money payouts to your verified account at any time. Verification takes 1-2 business days to complete.'
    },
    {
      question: 'Are there any platform fees on HelpFund?',
      answer: 'Starting a fundraiser is completely free! We have a 0% platform fee. Standard processing fees apply via our secure payment partners such as MarzPay.'
    }
  ])

  // Filters & State
  const searchQuery = ref('')
  const selectedCategory = ref<string | null>(null)

  // Filtered Fundraisers
  const filteredFundraisers = computed(() => {
    return fundraisers.value.filter((f) => {
      const matchesSearch = f.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        f.description.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        f.organizer.toLowerCase().includes(searchQuery.value.toLowerCase())
      const matchesCategory = !selectedCategory.value || f.category.toLowerCase() === selectedCategory.value.toLowerCase()
      return matchesSearch && matchesCategory
    })
  })

  // Donation Action (MarzPay default with backend integration & local fallback)
  const donateToFundraiser = async (
    id: string,
    amount: number,
    donorData?: { name?: string; email?: string; phone?: string; currency?: string; isAnonymous?: boolean; message?: string }
  ): Promise<{ success: boolean; paymentLink?: string; txRef?: string }> => {
    const fund = fundraisers.value.find((f) => f.id === id)
    if (!fund || amount <= 0) return { success: false }

    try {
      const res = await campaignService.createDonation({
        campaignId: id,
        amount: Number(amount),
        currency: donorData?.currency || fund.currency || 'UGX',
        isAnonymous: donorData?.isAnonymous ?? false,
        donorName: donorData?.isAnonymous ? 'Anonymous' : (donorData?.name?.trim() || 'Supporter'),
        email: donorData?.email?.trim() || 'donor@helpfund.org',
        phone: formatUgandanPhone(donorData?.phone),
        message: donorData?.message?.trim() || undefined,
        paymentMethod: 'card',
      })

      if (res?.paymentLink) {
        return { success: true, paymentLink: res.paymentLink, txRef: res.txRef }
      }

      // In sandbox mode or direct confirmation, verify donation with backend
      if (res?.txRef) {
        try {
          await campaignService.verifyDonation({ txRef: res.txRef })
        } catch (vErr) {
          console.warn('Donation verification response:', vErr)
        }
      }

      // Update local fundraiser counters
      fund.raisedAmount += amount
      fund.donorCount += 1
      return { success: true, txRef: res?.txRef }
    } catch (err) {
      console.warn('Backend donation creation error (falling back to simulated donation):', err)
      // Simulate API latency & local update
      await new Promise((resolve) => setTimeout(resolve, 600))
      fund.raisedAmount += amount
      fund.donorCount += 1

      // Save donation update to local storage if it's a custom campaign
      const savedCampaigns = JSON.parse(localStorage.getItem('helpfund_campaigns') || '[]')
      const index = savedCampaigns.findIndex((c: any) => c.id === id)
      if (index !== -1) {
        savedCampaigns[index].raisedAmount = fund.raisedAmount
        savedCampaigns[index].donorCount = fund.donorCount
        localStorage.setItem('helpfund_campaigns', JSON.stringify(savedCampaigns))
      }
      return { success: true }
    }
  }

  // Add custom campaign to active list
  const addCampaignToFundraisers = (c: any) => {
    const newFundraiser: Fundraiser = {
      id: c.id,
      title: c.title,
      description: c.story,
      category: c.category,
      imageUrl: c.mediaUrl || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=600',
      targetAmount: Number(c.targetAmount) || 20,
      raisedAmount: Number(c.raisedAmount) || 0,
      donorCount: Number(c.donorCount) || 0,
      daysLeft: Number(c.daysLeft) || 30,
      organizer: c.organizer || 'John Doe',
      city: c.city || 'Beverly Hills',
      country: c.country || 'United States'
    }
    fundraisers.value.unshift(newFundraiser)
  }

  // Fetch live campaigns from backend
  const fetchLiveCampaigns = async () => {
    try {
      const { campaigns } = await campaignService.listPublicCampaigns(1, 50)
      if (campaigns && campaigns.length > 0) {
        const mapped: Fundraiser[] = campaigns.map((c: any) => {
          let coverUrl = 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&q=80&w=600'
          if (typeof c.coverImageUrl === 'string' && c.coverImageUrl) coverUrl = c.coverImageUrl
          else if (c.coverImageUrl?.Valid && c.coverImageUrl.String) coverUrl = c.coverImageUrl.String

          let locationStr = 'Uganda'
          if (typeof c.location === 'string' && c.location) locationStr = c.location
          else if (c.location?.Valid && c.location.String) locationStr = c.location.String

          let shortDesc = c.story || ''
          if (typeof c.shortSummary === 'string' && c.shortSummary) shortDesc = c.shortSummary
          else if (c.shortSummary?.Valid && c.shortSummary.String) shortDesc = c.shortSummary.String

          return {
            id: c.id,
            title: c.title,
            description: shortDesc,
            category: c.categories && c.categories[0] ? c.categories[0].name : 'Community',
            imageUrl: coverUrl,
            targetAmount: Number(c.goalAmount) || 1000000,
            raisedAmount: Number(c.raisedAmount) || 0,
            currency: c.currency || 'UGX',
            donorCount: Number(c.donorCount) || 0,
            daysLeft: 30,
            organizer: c.ownerName || 'Verified Organizer',
            city: locationStr,
            country: 'Uganda',
          }
        })
        fundraisers.value = mapped
      } else {
        fundraisers.value = []
      }
    } catch (err) {
      console.warn('Failed to load live campaigns:', err)
      fundraisers.value = []
    }
  }

  return {
    fundraisers,
    categories,
    faqs,
    searchQuery,
    selectedCategory,
    filteredFundraisers,
    donateToFundraiser,
    addCampaignToFundraisers,
    fetchLiveCampaigns
  }
})
