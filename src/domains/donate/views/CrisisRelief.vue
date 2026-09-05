<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import NavHeader from '../../landing/components/NavHeader.vue'
import MainFooter from '../../landing/components/MainFooter.vue'

const router = useRouter()
const navHeaderRef = ref<any>(null)
const closeDropdowns = () => {
  navHeaderRef.value?.closeDropdowns()
}

// Mock Crises / Resource Hubs
const crises = ref([
  {
    id: 'hub-hawaii',
    title: 'Hawaii Wildfires Resource Hub',
    description: 'Direct relief and immediate emergency support for families displaced by the recent devastating wildfires across Hawaii.',
    raisedAmount: 385400,
    targetAmount: 500000,
    donorCount: 4120,
    imageUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'hub-la',
    title: 'Los Angeles County Wildfires Resource Hub',
    description: 'Supporting regional volunteer response efforts and housing support for families affected by the fire emergency in LA County.',
    raisedAmount: 189000,
    targetAmount: 300000,
    donorCount: 2205,
    imageUrl: 'https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'hub-maui',
    title: 'Maui Wildfire Relief',
    description: 'Providing urgent shelter, supply distributions, and medical help to community members affected by the Maui fires.',
    raisedAmount: 512000,
    targetAmount: 600000,
    donorCount: 5410,
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'hub-venezuela',
    title: 'Venezuela Humanitarian Crisis',
    description: 'Deploying direct medical aid packages and vital nutrition kits to local coordinators supporting families in Venezuela.',
    raisedAmount: 142000,
    targetAmount: 250000,
    donorCount: 1830,
    imageUrl: 'https://images.unsplash.com/photo-1535090486751-1115c0878027?auto=format&fit=crop&q=80&w=600'
  }
])

// Simulate Donation States
const activeCrisisId = ref<string | null>(null)
const donationAmount = ref<number>(50)
const isDonating = ref(false)
const donationSuccess = ref(false)

const openDonateModal = (id: string) => {
  activeCrisisId.value = id
  donationAmount.value = 50
  donationSuccess.value = false
  isDonating.value = false
}

const closeDonateModal = () => {
  activeCrisisId.value = null
}

const handleDonate = async () => {
  const crisis = crises.value.find(c => c.id === activeCrisisId.value)
  if (crisis && donationAmount.value > 0) {
    isDonating.value = true
    await new Promise(resolve => setTimeout(resolve, 800))
    crisis.raisedAmount += donationAmount.value
    crisis.donorCount += 1
    isDonating.value = false
    donationSuccess.value = true
    setTimeout(() => {
      closeDonateModal()
    }, 1500)
  }
}

const getProgressPercent = (raised: number, target: number) => {
  return Math.min(Math.round((raised / target) * 100), 100)
}

// FAQ accordion logic
const activeFaqIndex = ref<number | null>(null)
const toggleFaq = (index: number) => {
  if (activeFaqIndex.value === index) {
    activeFaqIndex.value = null
  } else {
    activeFaqIndex.value = index
  }
}

const faqs = [
  {
    question: 'How HelpFund stops fraud',
    answer: 'Our Trust & Safety specialists audit campaigns continuously. We use machine learning algorithms combined with manual verification of banking documents and government IDs to ensure every dollar reaches verified on-the-ground coordinators.'
  },
  {
    question: 'How much it costs to run a HelpFund',
    answer: 'Creating and launching a fundraiser is completely free. There are no platform fees. We only apply a standard transaction fee (2.9% + $0.30) to cover secure payment processing partners.'
  },
  {
    question: 'How HelpFunds impact FEMA eligibility and other benefits',
    answer: 'Crowdfunded donations intended as personal support are generally treated as gifts by federal and state agencies, meaning they rarely affect FEMA assistance. However, laws differ across regions, so consulting a tax professional is recommended.'
  },
  {
    question: 'How you can withdraw the funds from HelpFund',
    answer: 'You can link your verified checking account immediately upon starting. Direct deposits are initiated daily, meaning you do not have to wait for the campaign to finish or reach its target.'
  },
  {
    question: 'What to do if your HelpFund is placed under review',
    answer: 'If our system spots missing identity verifications or suspicious actions, we place withdrawals on hold temporarily. We will contact you immediately via email to help you submit the correct documentation so transfers resume.'
  }
]

const startFundraiser = () => {
  router.push('/start-fundraiser')
}

const scrollToFaq = () => {
  document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <div class="min-h-screen bg-white text-slate-800 font-sans text-left" @click="closeDropdowns">
    <NavHeader ref="navHeaderRef" />

    <!-- Hero Section (Light green card background matching design) -->
    <section class="bg-gradient-to-b from-emerald-50/50 to-white py-16 px-4">
      <div class="max-w-5xl mx-auto text-center flex flex-col items-center">
        <span class="text-emerald-700 font-extrabold text-[10px] uppercase tracking-wider mb-3">
          HelpFund Crisis Response
        </span>
        <h1 class="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6 max-w-3xl">
          When bad things happen, <br class="hidden sm:inline" /> good people show up.
        </h1>
        <p class="text-slate-600 text-sm sm:text-base max-w-2xl leading-relaxed mb-8">
          HelpFund is a trusted leader in online fundraising. Support local donation organizers, share sheets, tax relief guidelines, and smart dashboards to analyze donor trends.
        </p>
        <button @click="scrollToFaq" class="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-8 py-3 rounded-full shadow-md hover:shadow-lg transition-all text-sm cursor-pointer">
          FAQ
        </button>
      </div>
    </section>

    <!-- Best friends do HelpFunds (Green theme cards) -->
    <section class="max-w-7xl mx-auto px-4 py-16">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-black text-slate-900 mb-3">Best friends do HelpFunds</h2>
        <p class="text-slate-500 text-sm max-w-xl mx-auto leading-relaxed">
          Over both distance and time, our platform supports a large list of fundraising templates to match any situation.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Card 1 -->
        <div class="bg-emerald-50/30 rounded-3xl border border-emerald-100/50 p-6 flex flex-col justify-between hover:shadow-lg transition-all">
          <div>
            <div class="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 mb-6">
              <img src="https://images.unsplash.com/photo-1531983412531-1f49a365ffed?auto=format&fit=crop&q=80&w=400" class="w-full h-full object-cover" alt="Need help" />
            </div>
            <h3 class="font-bold text-slate-900 text-lg mb-2">Need help for yourself or a family member?</h3>
            <p class="text-slate-500 text-xs leading-relaxed mb-6">
              Launch a direct personal campaign to collect emergency aid for medical bills, housing needs, or daily essentials.
            </p>
          </div>
          <button @click="startFundraiser" class="w-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer text-center">
            Start a fundraiser
          </button>
        </div>

        <!-- Card 2 -->
        <div class="bg-emerald-50/30 rounded-3xl border border-emerald-100/50 p-6 flex flex-col justify-between hover:shadow-lg transition-all">
          <div>
            <div class="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 mb-6">
              <img src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=400" class="w-full h-full object-cover" alt="Support a cause" />
            </div>
            <h3 class="font-bold text-slate-900 text-lg mb-2">Want to support a cause or a friend?</h3>
            <p class="text-slate-500 text-xs leading-relaxed mb-6">
              Set up a campaign to help coordinate resources, rebuild homes, or assist loved ones through sudden emergencies.
            </p>
          </div>
          <button @click="scrollToFaq" class="w-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer text-center">
            Donate now
          </button>
        </div>

        <!-- Card 3 -->
        <div class="bg-emerald-50/30 rounded-3xl border border-emerald-100/50 p-6 flex flex-col justify-between hover:shadow-lg transition-all">
          <div>
            <div class="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 mb-6">
              <img src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=400" class="w-full h-full object-cover" alt="Charity support" />
            </div>
            <h3 class="font-bold text-slate-900 text-lg mb-2">Raising support for a charity?</h3>
            <p class="text-slate-500 text-xs leading-relaxed mb-6">
              Partner with registered non-profits directly, raising funds that bypass personal accounts with tax exemptions.
            </p>
          </div>
          <button @click="scrollToFaq" class="w-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer text-center">
            Learn more
          </button>
        </div>
      </div>
    </section>

    <!-- Nonprofit Fundraising Feature -->
    <section class="bg-slate-50 border-y border-slate-100 py-16">
      <div class="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 class="text-3xl font-black text-slate-900 mb-4">Fundraising for nonprofits? Make it easy.</h2>
          <p class="text-slate-500 text-sm leading-relaxed mb-6">
            Reach new supporters, download template toolkits, customize your event sheets, and get automated tax compliance tools. HelpFund simplifies the complexity of charity donation processes, from onboarding to regular distributions.
          </p>
          <div class="flex flex-col gap-3 mb-8">
            <div class="flex gap-2">
              <span class="text-emerald-700 font-bold">✓</span>
              <p class="text-xs text-slate-600 font-semibold">Zero upfront setup fees for certified charities.</p>
            </div>
            <div class="flex gap-2">
              <span class="text-emerald-700 font-bold">✓</span>
              <p class="text-xs text-slate-600 font-semibold">Seamless dashboard to export donor lists and CRM files.</p>
            </div>
            <div class="flex gap-2">
              <span class="text-emerald-700 font-bold">✓</span>
              <p class="text-xs text-slate-600 font-semibold">Automatic 501(c)(3) tax receipting for donors.</p>
            </div>
          </div>
          <button @click="startFundraiser" class="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-6 py-3.5 rounded-xl shadow-md transition-all cursor-pointer">
            Get free guide
          </button>
        </div>
        <div class="flex justify-center">
          <div class="max-w-md w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border border-slate-200">
            <img src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600" class="w-full h-full object-cover" alt="Dog companion" />
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Accordion section -->
    <section id="faq" class="max-w-4xl mx-auto px-4 py-20">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-black text-slate-900 mb-4">15 years of expertise, here when you need it most</h2>
        <p class="text-slate-500 text-sm max-w-xl mx-auto">
          We are committed to safety and support. Find immediate details on security audits, processing costs, and direct transfers.
        </p>
      </div>

      <div class="flex flex-col gap-3">
        <div v-for="(faq, idx) in faqs" :key="idx" class="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <button @click="toggleFaq(idx)" class="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-slate-800 text-sm sm:text-base hover:text-emerald-700 transition-colors">
            <span>{{ faq.question }}</span>
            <svg class="transition-transform duration-200 text-slate-400" :class="{ 'rotate-180 text-emerald-700': activeFaqIndex === idx }" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div v-show="activeFaqIndex === idx" class="px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-500 leading-relaxed border-t border-slate-50">
            {{ faq.answer }}
          </div>
        </div>
      </div>
    </section>

    <!-- Yellow Section (How HelpFund helps in a crisis) -->
    <section class="bg-amber-400 py-16 text-slate-900 border-y border-amber-500/20">
      <div class="max-w-5xl mx-auto px-4 text-center">
        <h2 class="text-3xl font-black mb-10 leading-tight">How HelpFund helps in a crisis</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-left">
          <div class="p-5 bg-white/40 rounded-2xl border border-white/30 shadow-sm">
            <h4 class="font-extrabold text-sm mb-2 text-slate-900">Immediate support</h4>
            <p class="text-xs text-slate-800 leading-relaxed">Swift emergency grants assigned to coordinators directly to cover food and basic shelter expenses.</p>
          </div>
          <div class="p-5 bg-white/40 rounded-2xl border border-white/30 shadow-sm">
            <h4 class="font-extrabold text-sm mb-2 text-slate-900">Direct transfer</h4>
            <p class="text-xs text-slate-800 leading-relaxed">Easy digital setup verifying local banks quickly to permit instant access to donations.</p>
          </div>
          <div class="p-5 bg-white/40 rounded-2xl border border-white/30 shadow-sm">
            <h4 class="font-extrabold text-sm mb-2 text-slate-900">Tax receipts</h4>
            <p class="text-xs text-slate-800 leading-relaxed">Automatic generation of tax-deductible files for audit compliance and business giving records.</p>
          </div>
          <div class="p-5 bg-white/40 rounded-2xl border border-white/30 shadow-sm">
            <h4 class="font-extrabold text-sm mb-2 text-slate-900">HelpFund Guarantee</h4>
            <p class="text-xs text-slate-800 leading-relaxed">100% security coverage verifying each transaction and ensuring funds hit the right target.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Public Official section -->
    <section class="max-w-7xl mx-auto px-4 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div>
        <h2 class="text-3xl font-black text-slate-900 mb-6">I'm a public official, how can I work with HelpFund?</h2>
        <p class="text-slate-500 text-sm leading-relaxed mb-6">
          We collaborate closely with government representatives and local agencies during disaster reliefs. HelpFund provides region-specific fundraising registries and verification checks, helping target emergency aid accurately.
        </p>
        <ul class="flex flex-col gap-3.5 text-xs font-semibold text-slate-700 mb-8">
          <li class="flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-700"></span>
            Verify local distribution coordinates quickly
          </li>
          <li class="flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-700"></span>
            Monitor donations and regional trends
          </li>
          <li class="flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-700"></span>
            Establish direct public-private channels
          </li>
        </ul>
        <button class="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-6 py-3.5 rounded-xl shadow-md transition-all cursor-pointer">
          Contact us
        </button>
      </div>
      <div class="flex justify-center">
        <div class="max-w-md w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border border-slate-100">
          <img src="https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=600" class="w-full h-full object-cover" alt="Public speaker" />
        </div>
      </div>
    </section>

    <!-- Hubs for verified crisis relief -->
    <section class="bg-slate-50 border-t border-slate-100 py-20">
      <div class="max-w-7xl mx-auto px-4">
        <div class="text-center mb-12">
          <span class="text-emerald-700 font-extrabold text-[10px] uppercase tracking-wider mb-2 block">Crisis Relief Hubs</span>
          <h2 class="text-3xl font-black text-slate-900 mb-3">Hubs for verified crisis relief</h2>
          <p class="text-slate-500 text-sm max-w-xl mx-auto leading-relaxed">
            Donate directly to ongoing disaster zones. Every transaction supports audited, on-the-ground volunteer networks.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div v-for="crisis in crises" :key="crisis.id" class="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col sm:flex-row justify-between">
            <div class="w-full sm:w-2/5 aspect-[4/3] sm:aspect-auto bg-slate-100 relative shrink-0">
              <img :src="crisis.imageUrl" class="w-full h-full object-cover" />
              <span class="absolute top-3 left-3 bg-red-600 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-sm">
                Active Hub
              </span>
            </div>
            <div class="p-6 flex-1 flex flex-col justify-between text-left">
              <div>
                <h3 class="font-extrabold text-slate-900 text-base mb-2 leading-snug">{{ crisis.title }}</h3>
                <p class="text-slate-500 text-[11px] leading-relaxed mb-4">{{ crisis.description }}</p>
              </div>

              <div>
                <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 mb-3">
                  <div class="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                    <span>${{ crisis.raisedAmount.toLocaleString() }} raised</span>
                    <span class="text-emerald-700">{{ getProgressPercent(crisis.raisedAmount, crisis.targetAmount) }}%</span>
                  </div>
                  <div class="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div class="h-full bg-emerald-700 rounded-full transition-all duration-500" :style="{ width: getProgressPercent(crisis.raisedAmount, crisis.targetAmount) + '%' }"></div>
                  </div>
                </div>
                <button @click="openDonateModal(crisis.id)" class="w-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-md shadow-emerald-100 text-center cursor-pointer">
                  Donate now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <MainFooter />

    <!-- Simulate Donation Modal -->
    <div v-if="activeCrisisId" class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/50 backdrop-blur-sm" @click.self="closeDonateModal">
      <div class="bg-white rounded-2xl sm:rounded-3xl w-full max-w-md max-h-[calc(100vh-1rem)] sm:max-h-[calc(100vh-2rem)] overflow-y-auto p-4 sm:p-6 border border-slate-100 shadow-2xl animate-scale text-left relative">
        <button @click="closeDonateModal" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div v-if="donationSuccess" class="py-12 flex flex-col items-center justify-center text-center">
          <div class="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center text-3xl mb-4 animate-bounce">
            ✓
          </div>
          <h3 class="text-xl font-bold text-slate-800 mb-1">Thank You!</h3>
          <p class="text-slate-500 text-sm">Your simulated relief donation of ${{ donationAmount }} was received.</p>
        </div>

        <div v-else>
          <span class="text-xs text-emerald-700 font-bold uppercase tracking-wider">Simulate Donation</span>
          <h3 class="text-lg font-black text-slate-900 mt-1 mb-4 leading-tight">
            {{ crises.find(c => c.id === activeCrisisId)?.title }}
          </h3>

          <form @submit.prevent="handleDonate" class="flex flex-col gap-4">
            <div class="flex flex-col">
              <label class="text-xs text-slate-500 font-semibold mb-1.5">Donation Amount ($)</label>
              <input type="number" v-model="donationAmount" min="5" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-sm" />
            </div>
            <button type="submit" :disabled="isDonating" class="w-full bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer">
              <span v-if="isDonating" class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Confirm Donation</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
