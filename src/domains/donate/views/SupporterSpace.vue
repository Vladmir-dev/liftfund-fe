<script setup lang="ts">
import { ref, computed } from 'vue'
import NavHeader from '../../landing/components/NavHeader.vue'
import MainFooter from '../../landing/components/MainFooter.vue'

const navHeaderRef = ref<any>(null)
const closeDropdowns = () => {
  navHeaderRef.value?.closeDropdowns()
}

// Popular articles
const popularArticles = [
  {
    num: 1,
    title: 'Giving Back This Holiday Season? Try These Ideas.',
    category: 'Where to give',
    description: 'Practical ways to support families in need, participate in gift collections, and donate to local shelter networks.'
  },
  {
    num: 2,
    title: '10 Random Acts of Kindness Ideas Under $10',
    category: 'Story tips',
    description: 'Surprise someone today with small, thoughtful gestures like custom notes, pre-paid coffees, or sharing books.'
  },
  {
    num: 3,
    title: 'Best Practices for Donating Safety Online with HelpFund',
    category: 'Supporter FAQ',
    description: 'Simple checklists to verify fundraiser identities, check update logs, and report concerns securely.'
  },
  {
    num: 4,
    title: 'These 6 Donations From Taylor Swift Will Inspire You',
    category: 'Inspiration',
    description: 'A look at how global icons use their tours to fund regional food banks and emergency assistance groups directly.'
  }
]

// All articles
const allArticles = [
  {
    id: 'art-01',
    title: 'These 6 Donations From Taylor Swift Will Inspire You',
    category: 'Inspiration',
    summary: 'We look at standard relief gifts that Taylor Swift made to support food banks and local communities during her tours.',
    imageUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=400',
    author: 'HelpFund Team'
  },
  {
    id: 'art-02',
    title: '10 Random Acts of Kindness Ideas Under $10',
    category: 'Story tips',
    summary: 'Surprise someone today with one of these ideas for a random act of kindness.',
    imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=400',
    author: 'HelpFund Team'
  },
  {
    id: 'art-03',
    title: "Discover 10 charities that change children's lives",
    category: 'Where to give',
    summary: 'Creative non-profits providing mentorship, youth medical resources, and safe places for kids.',
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=400',
    author: 'HelpFund Team'
  },
  {
    id: 'art-04',
    title: 'Are There More Ways I Can Help Beyond Donating?',
    category: 'Supporter FAQ',
    summary: 'You can raise awareness, start local resource chains, and volunteer matching hours.',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=400',
    author: 'HelpFund Team'
  }
]

// Category Filter Tabs
const selectedTab = ref<string>('All')
const tabs = ['All', 'Story tips', 'Inspiration', 'Supporter FAQ', 'Where to give']

const filteredArticles = computed(() => {
  if (selectedTab.value === 'All') return allArticles
  return allArticles.filter(art => art.category === selectedTab.value)
})

// Topic Pills
const topics = [
  'Animals', 'Business', 'Children', 'Culture', 'Disaster', 
  'Education', 'Environment', 'Medical', 'Non-profit', 'Relief', 'Wellness'
]

// Story Popup simulation
const showStoryModal = ref(false)
const storyContent = ref({
  title: '',
  text: ''
})

const openStory = (title: string, text: string) => {
  storyContent.value = { title, text }
  showStoryModal.value = true
}

const closeStoryModal = () => {
  showStoryModal.value = false
}
</script>

<template>
  <div class="min-h-screen bg-white text-slate-800 font-sans text-left" @click="closeDropdowns">
    <NavHeader ref="navHeaderRef" />

    <!-- Hero Header (Green curved layout matching Screenshot 3) -->
    <header class="bg-[#dcfce7]/60 py-16 px-4 relative overflow-hidden">
      <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
        <div>
          <nav class="text-xs font-semibold text-emerald-800/80 mb-4 flex items-center gap-1.5">
            <RouterLink to="/" class="hover:text-emerald-950">Home</RouterLink>
            <span>/</span>
            <span class="text-emerald-950 font-bold">Supporter Space</span>
          </nav>
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-tight mb-4">
            Supporter Space
          </h1>
          <p class="text-slate-600 text-sm sm:text-base leading-relaxed max-w-lg">
            Find powerful ways to make a difference with top places to donate, community stories, and tips on giving.
          </p>
        </div>
        <div class="flex justify-center md:justify-end">
          <div class="max-w-md w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-lg border border-white/60">
            <img src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=600" class="w-full h-full object-cover" alt="Volunteers and animals" />
          </div>
        </div>
      </div>
    </header>

    <!-- Popular Section (White overlap card style) -->
    <section class="max-w-7xl mx-auto px-4 py-16">
      <h2 class="text-2xl font-black text-slate-900 mb-8 border-b border-slate-100 pb-3">Popular</h2>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="art in popularArticles" :key="art.num" class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div class="w-8 h-8 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 flex items-center justify-center font-bold text-sm mb-4">
              {{ art.num }}
            </div>
            <h3 class="font-extrabold text-slate-900 text-sm mb-2 leading-snug">{{ art.title }}</h3>
            <p class="text-slate-500 text-[11px] leading-relaxed mb-4">{{ art.description }}</p>
          </div>
          <button @click="openStory(art.title, art.description)" class="text-xs font-bold text-emerald-700 hover:text-emerald-950 flex items-center gap-1 mt-2 cursor-pointer">
            <span>Read article</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Category Tabs & Dynamic Grid -->
    <section class="max-w-7xl mx-auto px-4 py-12 border-t border-slate-50">
      <!-- Tabs header -->
      <div class="flex items-center gap-2 overflow-x-auto pb-4 mb-8 -mx-4 px-4 scrollbar-none">
        <button v-for="tab in tabs" :key="tab" @click="selectedTab = tab"
          class="px-5 py-2 rounded-full text-xs sm:text-sm font-semibold border transition-all whitespace-nowrap cursor-pointer"
          :class="selectedTab === tab ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'">
          {{ tab }}
        </button>
      </div>

      <!-- Articles Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        <div v-for="art in filteredArticles" :key="art.id" @click="openStory(art.title, art.summary)" class="group bg-white rounded-2xl border border-slate-100/80 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between cursor-pointer">
          <div>
            <div class="aspect-video bg-slate-50 overflow-hidden">
              <img :src="art.imageUrl" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" :alt="art.title" />
            </div>
            <div class="p-5">
              <span class="text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-100/50 px-2 py-0.5 rounded-full inline-block mb-3">{{ art.category }}</span>
              <h3 class="font-extrabold text-slate-900 text-sm leading-snug mb-2 group-hover:text-emerald-700 transition-colors">{{ art.title }}</h3>
              <p class="text-slate-500 text-[11px] leading-relaxed line-clamp-3">{{ art.summary }}</p>
            </div>
          </div>

          <div class="p-5 pt-0 flex items-center gap-2 border-t border-slate-50 mt-4">
            <span class="w-4 h-4 rounded-full bg-emerald-700 flex items-center justify-center text-[8px] text-white font-bold">✓</span>
            <span class="text-[10px] text-slate-400 font-semibold">{{ art.author }}</span>
          </div>
        </div>
      </div>

      <!-- Browse more topics -->
      <div class="text-center bg-slate-50/50 rounded-3xl p-8 border border-slate-100/50">
        <h3 class="font-extrabold text-slate-800 text-sm mb-4 uppercase tracking-wider">Browse more topics</h3>
        <div class="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
          <button v-for="topic in topics" :key="topic" class="px-4 py-2 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-600 border border-slate-200 rounded-full transition-colors cursor-pointer">
            {{ topic }}
          </button>
        </div>
      </div>
    </section>

    <!-- HelpFund Voices: Christy Wong Banner -->
    <section class="max-w-7xl mx-auto px-4 py-12">
      <div class="bg-[#0f2e24] rounded-3xl overflow-hidden text-white grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div class="p-8 lg:p-12 text-left">
          <span class="text-emerald-400 font-extrabold text-[10px] uppercase tracking-wider block mb-3">HelpFund Voices</span>
          <h2 class="text-3xl font-black mb-4 leading-tight">Meet Christy Wong</h2>
          <p class="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
            Animals have always been a big part of life for Christy Wong and her family. However, they never imagined that they would someday be operating an animal rescue farm. Through targeted community fundraising, she managed to secure land shelter structures and local veterinarian assistance.
          </p>
          <button @click="openStory('Meet Christy Wong', 'Animals have always been a big part of life for Christy Wong and her family. However, they never imagined that they would someday be operating an animal rescue farm. Through targeted community fundraising, she managed to secure land shelter structures and local veterinarian assistance.')" class="bg-emerald-400 hover:bg-emerald-5050 text-slate-900 font-bold px-6 py-3 rounded-xl text-xs transition-colors cursor-pointer">
            Read more
          </button>
        </div>
        <div class="h-full min-h-[300px] bg-slate-950 relative">
          <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800" class="w-full h-full object-cover opacity-85" alt="Christy Wong rescuer" />
        </div>
      </div>
    </section>

    <!-- HelpFund Giving Guarantee Banner -->
    <section class="max-w-7xl mx-auto px-4 py-8">
      <div class="bg-amber-50 rounded-3xl border border-amber-100 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 text-left">
        <div class="max-w-2xl">
          <span class="text-amber-800 font-extrabold text-[10px] uppercase tracking-wider block mb-1">Donor Protection</span>
          <h3 class="text-xl font-bold text-slate-900 mb-2">You're covered by the HelpFund Giving Guarantee</h3>
          <p class="text-slate-600 text-xs leading-relaxed">
            We believe it's our responsibility to protect your kindness—by protecting your donation. In the rare event that something is mismanaged, we work to redirect donations or issue full refunds. Donate with peace of mind.
          </p>
        </div>
        <button @click="openStory('HelpFund Giving Guarantee', 'We protect your donation. In the rare event that misuse or misrepresentation occurs, we work to redirect donations or issue full refunds.')" class="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-3.5 rounded-xl text-xs transition-colors cursor-pointer whitespace-nowrap">
          Learn more
        </button>
      </div>
    </section>

    <!-- Featured Section (Best Charities) -->
    <section class="max-w-7xl mx-auto px-4 py-12 mb-16">
      <div class="bg-slate-50 rounded-3xl border border-slate-100 p-8 grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
        <div class="lg:col-span-3 text-left">
          <span class="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider block mb-2">Featured list</span>
          <h2 class="text-2xl font-black text-slate-900 mb-4">Best Charities to Donate to on HelpFund</h2>
          <p class="text-slate-500 text-xs sm:text-sm leading-relaxed mb-6">
            Using data from HelpFund's community and trusted resources like Charity Navigator, we've created a list of the best charities to donate to on HelpFund in 2026. Reach verified groups working on health, youth support, and education.
          </p>
          <button @click="openStory('Best Charities to Donate to on HelpFund', 'Using data from HelpFund\'s community and trusted resources like Charity Navigator, we\'ve created a list of the best charities to donate to on HelpFund in 2026.')" class="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3.5 rounded-xl text-xs transition-colors cursor-pointer">
            Explore the list
          </button>
        </div>
        <div class="lg:col-span-2 flex justify-center">
          <div class="max-w-xs w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-md">
            <img src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400" class="w-full h-full object-cover" alt="Sorting aid kits" />
          </div>
        </div>
      </div>
    </section>

    <MainFooter />

    <!-- Interactive Story/Article Modal -->
    <div v-if="showStoryModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm" @click.self="closeStoryModal">
      <div class="bg-white rounded-3xl w-full max-w-lg p-6 border border-slate-100 shadow-2xl animate-scale text-left relative">
        <button @click="closeStoryModal" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 class="text-xl font-black text-slate-900 mt-2 mb-4 leading-tight">
          {{ storyContent.title }}
        </h3>
        <p class="text-slate-500 text-sm leading-relaxed mb-6">
          {{ storyContent.text }}
        </p>
        <div class="p-4 bg-emerald-50 rounded-xl text-emerald-800 text-xs font-semibold">
          💡 This is a simulated article/story view for the Supporter Space page.
        </div>
        <button @click="closeStoryModal" class="mt-6 w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer text-center">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scrollbar utility override */
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
