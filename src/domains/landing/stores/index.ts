import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Fundraiser, Category, FAQItem } from '../types'

export const useLandingStore = defineStore('landing', () => {
  // Load initial custom campaigns from localStorage
  const loadCustomCampaigns = (): Fundraiser[] => {
    const saved = localStorage.getItem('helpfund_campaigns')
    if (!saved) return []
    try {
      const parsed = JSON.parse(saved)
      return parsed.map((c: any) => ({
        id: c.id,
        title: c.title,
        description: c.story,
        category: c.category,
        imageUrl: c.mediaUrl || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=600',
        targetAmount: Number(c.targetAmount) || 20,
        raisedAmount: Number(c.raisedAmount) || 0,
        donorCount: Number(c.donorCount) || 0,
        daysLeft: Number(c.daysLeft) || 30,
        organizer: c.organizer || 'Raymond Mwese',
        city: c.city || 'Beverly Hills',
        country: c.country || 'United States'
      }))
    } catch (e) {
      console.error(e)
      return []
    }
  }

  // Mock Fundraisers
  const defaultFundraisers: Fundraiser[] = [
    {
      id: 'fund-01',
      title: 'Support Emily\'s Recovery & Medical Care',
      description: 'Emily recently underwent major surgery. We are raising funds to cover her ongoing ICU bills and physical rehabilitation therapies.',
      category: 'Medical',
      imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600',
      targetAmount: 50000,
      raisedAmount: 32450,
      donorCount: 284,
      daysLeft: 12,
      organizer: 'Sarah Jenkins',
      city: 'Boston',
      country: 'United States'
    },
    {
      id: 'fund-02',
      title: 'Support Urgent Earthquake Relief in Colombia',
      description: 'Families have lost their homes and access to clean water. Help us distribute emergency kits, food supplies, and shelter kits.',
      category: 'Emergency',
      imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=600',
      targetAmount: 100000,
      raisedAmount: 76890,
      donorCount: 940,
      daysLeft: 18,
      organizer: 'Global Relief Association',
      city: 'Bogota',
      country: 'Colombia'
    },
    {
      id: 'fund-03',
      title: 'Rescue Animal Shelter Winter Upgrade',
      description: 'Help us buy heaters, insulate the kennels, and pay for veterinary supplies for our 120 rescue dogs and cats this winter.',
      category: 'Animals',
      imageUrl: 'https://images.unsplash.com/photo-1444212477490-ca407925329e?auto=format&fit=crop&q=80&w=600',
      targetAmount: 15000,
      raisedAmount: 9420,
      donorCount: 165,
      daysLeft: 7,
      organizer: 'Second Chance Paws',
      city: 'Portland',
      country: 'United States'
    },
    {
      id: 'fund-04',
      title: 'Laptops and Books for Rural Community Library',
      description: 'Bridging the digital divide by equipping our local library with modern computers and educational textbooks for school kids.',
      category: 'Education',
      imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600',
      targetAmount: 25000,
      raisedAmount: 18100,
      donorCount: 198,
      daysLeft: 22,
      organizer: 'Marcus Vance',
      city: 'Austin',
      country: 'United States'
    },
    {
      id: 'fund-05',
      title: 'Rebuilding the Green Valley Youth Sports Field',
      description: 'Storm damage destroyed our community sports pavilion and playing fields. Help us rebuild a safe space for youth sports.',
      category: 'Community',
      imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=600',
      targetAmount: 35000,
      raisedAmount: 12500,
      donorCount: 112,
      daysLeft: 30,
      organizer: 'Green Valley Sports Council',
      city: 'Seattle',
      country: 'United States'
    },
    {
      id: 'fund-06',
      title: 'Local Art Space and Mural Project Renovation',
      description: 'Support local artists in designing and painting mural walls in inner-city neighborhoods to bring vibrant culture to our streets.',
      category: 'Creative',
      imageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=600',
      targetAmount: 8000,
      raisedAmount: 6800,
      donorCount: 75,
      daysLeft: 5,
      organizer: 'Vivid City Arts',
      city: 'Chicago',
      country: 'United States'
    }
  ]

  const fundraisers = ref<Fundraiser[]>([
    ...loadCustomCampaigns(),
    ...defaultFundraisers
  ])

  // Categories Metadata
  const categories = ref<Category[]>([
    { id: 'medical', name: 'Medical', icon: 'heart', description: 'Help cover medical bills, treatments, and life-saving surgeries.', colorClass: 'bg-blue-50 text-blue-600 border-blue-100' },
    { id: 'emergency', name: 'Emergency', icon: 'shield-alert', description: 'Direct support for natural disasters, crises, and urgent safety needs.', colorClass: 'bg-red-50 text-red-600 border-red-100' },
    { id: 'community', name: 'Community', icon: 'users', description: 'Fund local neighborhood projects, community parks, and civic improvements.', colorClass: 'bg-amber-50 text-amber-600 border-amber-100' },
    { id: 'education', name: 'Education', icon: 'graduation-cap', description: 'Support student fees, class materials, technology, and learning environments.', colorClass: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { id: 'animals', name: 'Animals', icon: 'paw', description: 'Help animal shelters, rescue clinics, and vet care operations.', colorClass: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
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
      answer: 'Yes, absolutely. We use industry-standard encryption protocols and secure gateway payments (Stripe/PayPal) to protect your funds and personal information.'
    },
    {
      question: 'How do I withdraw the funds I raised?',
      answer: 'You can request direct bank transfers to your verified bank account at any time. Verification takes 1-2 business days to complete.'
    },
    {
      question: 'Are there any platform fees on HelpFund?',
      answer: 'Starting a fundraiser is completely free! We have a 0% platform fee. Standard card processing fees (approx 2.9% + $0.30 per transaction) apply.'
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

  // Simulated Donation Action
  const donateToFundraiser = async (id: string, amount: number): Promise<boolean> => {
    const fund = fundraisers.value.find((f) => f.id === id)
    if (fund && amount > 0) {
      // Simulate API latency
      await new Promise((resolve) => setTimeout(resolve, 800))
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
      return true
    }
    return false
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
      organizer: c.organizer || 'Raymond Mwese',
      city: c.city || 'Beverly Hills',
      country: c.country || 'United States'
    }
    fundraisers.value.unshift(newFundraiser)
  }

  return {
    fundraisers,
    categories,
    faqs,
    searchQuery,
    selectedCategory,
    filteredFundraisers,
    donateToFundraiser,
    addCampaignToFundraisers
  }
})
