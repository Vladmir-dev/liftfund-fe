<script setup lang="ts">
import { ref } from 'vue'
import NavHeader from '../../landing/components/NavHeader.vue'
import MainFooter from '../../landing/components/MainFooter.vue'

const navHeaderRef = ref<any>(null)
const closeDropdowns = () => {
  navHeaderRef.value?.closeDropdowns()
}

const activeMessageTab = ref<'primary' | 'archive'>('primary')
const selectedMessageId = ref('msg-01')

// Messages mock
const messages = ref([
  {
    id: 'msg-01',
    senderName: 'HelpFund',
    avatarClass: 'bg-[#edfce0] text-[#02a95c] border-[#bbf770]',
    icon: 'lucide:sunrise',
    text: "You've just unlocked a new way to connect with the HelpFund community!",
    isArchive: false
  }
])

const archiveMessage = (id: string) => {
  const msg = messages.value.find(m => m.id === id)
  if (msg) {
    msg.isArchive = !msg.isArchive
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50/50 text-slate-800 font-sans text-left" @click="closeDropdowns">
    <NavHeader ref="navHeaderRef" />

    <main class="max-w-7xl mx-auto px-4 py-12">
      <!-- Messenger Layout Box (Screenshot 2) -->
      <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        
        <!-- Left Sidebar: Messages list -->
        <div class="w-full md:w-80 border-r border-slate-100 p-5 flex flex-col shrink-0">
          <h2 class="text-xl font-black text-slate-900 mb-4">Your messages</h2>
          
          <!-- Tabs -->
          <div class="flex items-center gap-2 border-b border-slate-100 pb-2 mb-4 text-xs font-bold">
            <button @click="activeMessageTab = 'primary'" class="pb-2 cursor-pointer transition-colors"
              :class="activeMessageTab === 'primary' ? 'text-[#024731] border-b-2 border-[#024731]' : 'text-slate-400 hover:text-slate-600'">
              Primary
            </button>
            <button @click="activeMessageTab = 'archive'" class="pb-2 ml-4 cursor-pointer transition-colors"
              :class="activeMessageTab === 'archive' ? 'text-[#024731] border-b-2 border-[#024731]' : 'text-slate-400 hover:text-slate-600'">
              Archive
            </button>
          </div>

          <!-- Message Items -->
          <div class="flex flex-col gap-2 flex-1">
            <template v-for="msg in messages" :key="msg.id">
              <button v-if="(activeMessageTab === 'primary' && !msg.isArchive) || (activeMessageTab === 'archive' && msg.isArchive)"
                @click="selectedMessageId = msg.id"
                class="w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer"
                :class="selectedMessageId === msg.id ? 'bg-[#edfce0]/40 border-[#bbf770]' : 'bg-white border-transparent hover:bg-slate-50/50'">
                <div class="w-9 h-9 rounded-full flex items-center justify-center border shrink-0" :class="msg.avatarClass">
                  <iconify-icon :icon="msg.icon" class="text-base"></iconify-icon>
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-bold text-slate-900 text-xs mb-0.5">{{ msg.senderName }}</h4>
                  <p class="text-slate-400 text-[10px] truncate leading-relaxed font-semibold">{{ msg.text }}</p>
                </div>
              </button>
            </template>
            <div v-if="messages.filter(m => (activeMessageTab === 'primary' && !m.isArchive) || (activeMessageTab === 'archive' && m.isArchive)).length === 0"
              class="py-12 text-center text-slate-400 text-xs font-semibold">
              No conversations in this tab.
            </div>
          </div>
        </div>

        <!-- Right Content: Chat details -->
        <div class="flex-1 flex flex-col justify-between bg-slate-50/20">
          
          <template v-if="selectedMessageId === 'msg-01'">
            <!-- Chat Window Header -->
            <div class="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-full bg-[#edfce0] text-[#02a95c] border border-[#bbf770] flex items-center justify-center">
                  <iconify-icon icon="lucide:sunrise" class="text-xs"></iconify-icon>
                </div>
                <span class="text-xs sm:text-sm font-extrabold text-slate-900">HelpFund</span>
                <iconify-icon icon="lucide:badge-check" class="text-[#02a95c] text-sm"></iconify-icon>
              </div>
              
              <button @click="archiveMessage('msg-01')" class="text-xs font-bold text-slate-500 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-1 cursor-pointer">
                {{ messages[0]?.isArchive ? 'Move to Primary' : 'Archive' }}
              </button>
            </div>

            <!-- Chat Bubble Message Threads -->
            <div class="p-6 flex flex-col gap-4 flex-1 overflow-y-auto max-h-[420px]">
              <!-- Date banner -->
              <span class="text-[9px] font-bold uppercase tracking-widest text-slate-400 text-center mb-2">Today</span>

              <div class="flex gap-3 items-end max-w-lg">
                <div class="w-8 h-8 rounded-full bg-[#edfce0] text-[#02a95c] border border-[#bbf770] flex items-center justify-center shrink-0">
                  <iconify-icon icon="lucide:sunrise" class="text-xs"></iconify-icon>
                </div>

                <div class="flex flex-col gap-2 text-xs sm:text-sm text-left">
                  <!-- Bubble 1 -->
                  <div class="p-4 bg-white rounded-2xl rounded-bl-none border border-slate-100 shadow-sm text-slate-800 leading-relaxed">
                    You've just unlocked a new way to connect with the HelpFund community!
                  </div>

                  <!-- Bubble 2 -->
                  <div class="p-4 bg-white rounded-2xl rounded-bl-none border border-slate-100 shadow-sm text-slate-800 leading-relaxed">
                    <p class="font-bold mb-2">Here you can:</p>
                    <ul class="flex flex-col gap-1.5 pl-2 list-none">
                      <li class="flex items-start gap-1.5">
                        <span class="text-emerald-700">•</span>
                        Chat directly with organizers and supporters.
                      </li>
                      <li class="flex items-start gap-1.5">
                        <span class="text-emerald-700">•</span>
                        Ask questions, send encouragement, or share your thanks.
                      </li>
                      <li class="flex items-start gap-1.5">
                        <span class="text-emerald-700">•</span>
                        Keep all your fundraiser conversations safe and organized.
                      </li>
                    </ul>
                  </div>

                  <!-- Bubble 3 -->
                  <div class="p-4 bg-white rounded-2xl rounded-bl-none border border-slate-100 shadow-sm text-slate-800 leading-relaxed">
                    Start a conversation or reply to a message-- your support can make a real difference. Let's spread kindness, one message at a time! 💗
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer: Message Input Block -->
            <div class="px-6 py-4 bg-white border-t border-slate-100 text-center text-slate-400 text-xs font-semibold">
              Only HelpFund can send messages
            </div>
          </template>

          <template v-else>
            <div class="flex-1 flex items-center justify-center text-slate-400 text-xs sm:text-sm font-semibold">
              Select a conversation to view details.
            </div>
          </template>

        </div>

      </div>
    </main>

    <MainFooter />
  </div>
</template>
