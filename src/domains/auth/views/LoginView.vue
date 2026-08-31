<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const email = ref('')
const isLoading = ref(false)
const successMsg = ref('')

const handleLogin = () => {
  if (email.value.trim()) {
    isLoading.value = true
    // Simulate auth latency
    setTimeout(() => {
      isLoading.value = false
      authStore.login(email.value, 'John Doe')
      successMsg.value = `Welcome back! Signed in as ${email.value}`
      setTimeout(() => {
        router.push('/profile')
      }, 1000)
    }, 1200)
  }
}

const handleSocialLogin = (platform: 'Google' | 'Apple') => {
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
    authStore.login('john.doe@example.com', 'John Doe')
    successMsg.value = `Signed in successfully with ${platform}`
    setTimeout(() => {
      router.push('/profile')
    }, 1000)
  }, 800)
}

const goToLanding = () => {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-slate-100/60 flex items-center justify-center px-4 relative overflow-hidden font-sans">
    
    <!-- Faded Background Graphics -->
    <div class="absolute inset-0 z-0 pointer-events-none opacity-40">
      <!-- Floating decorative card outlines mimicking Screenshot 4 -->
      <div class="absolute w-[400px] h-[300px] bg-white rounded-3xl border border-slate-200/50 shadow-sm top-1/4 -left-36 rotate-12"></div>
      <div class="absolute w-[350px] h-[250px] bg-white rounded-3xl border border-slate-200/50 shadow-sm bottom-1/4 -right-28 -rotate-12"></div>
      <div class="absolute w-[300px] h-[300px] bg-[#edfce0] rounded-full blur-3xl top-12 right-12"></div>
    </div>

    <!-- Sign In Card -->
    <div class="bg-white rounded-[24px] w-full max-w-[440px] p-8 shadow-xl border border-slate-100 z-10 text-center relative animate-scale">
      
      <!-- Back Arrow -->
      <button @click="goToLanding" class="absolute top-6 left-6 text-slate-400 hover:text-slate-600 p-1 flex items-center justify-center cursor-pointer">
        <iconify-icon icon="fa6-solid:arrow-left" class="text-base"></iconify-icon>
      </button>

      <!-- Logo inside card -->
      <div class="flex items-center justify-center gap-1.5 mb-6">
        <iconify-icon icon="lucide:sunrise" class="text-[#02a95c] text-2xl"></iconify-icon>
        <span class="text-2xl font-black text-[#024731] tracking-tight">helpfund</span>
      </div>

      <!-- Success Screen -->
      <div v-if="successMsg" class="py-8 flex flex-col items-center justify-center text-center">
        <div class="w-14 h-14 rounded-full bg-[#edfce0] border border-[#bbf770] flex items-center justify-center text-2xl mb-4">
          <iconify-icon icon="fa6-solid:circle-check" class="text-2xl text-[#02a95c]"></iconify-icon>
        </div>
        <p class="font-bold text-slate-800">{{ successMsg }}</p>
        <span class="text-xs text-slate-400 mt-2">Redirecting to home page...</span>
      </div>

      <!-- Auth Form Content -->
      <div v-else>
        <h2 class="text-2xl font-black text-slate-900 mb-1.5">Welcome</h2>
        <p class="text-slate-500 text-sm mb-8 font-medium">Sign in to HelpFund or sign up to continue.</p>

        <!-- Social Buttons -->
        <div class="flex flex-col gap-3">
          <!-- Google button -->
          <button @click="handleSocialLogin('Google')" :disabled="isLoading" class="w-full flex items-center justify-center gap-3 py-3 border border-slate-200 rounded-full hover:bg-slate-50 font-bold text-sm text-slate-700 transition-all hover:border-[#024731] cursor-pointer">
            <iconify-icon icon="logos:google-icon" class="text-base"></iconify-icon>
            Sign in with Google
          </button>

          <!-- Apple button -->
          <button @click="handleSocialLogin('Apple')" :disabled="isLoading" class="w-full flex items-center justify-center gap-3 py-3 border border-slate-200 rounded-full hover:bg-slate-50 font-bold text-sm text-slate-700 transition-all hover:border-[#024731] cursor-pointer">
            <iconify-icon icon="logos:apple" class="text-base text-black"></iconify-icon>
            Continue with Apple
          </button>
        </div>

        <!-- Divider -->
        <div class="relative my-6 flex items-center justify-center">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-slate-100"></div>
          </div>
          <span class="relative bg-white px-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">or</span>
        </div>

        <!-- Email Sign-in form -->
        <form @submit.prevent="handleLogin" class="flex flex-col gap-4 text-left">
          <div class="flex flex-col">
            <input type="email" v-model="email" required placeholder="Email Address" class="w-full px-5 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#024731] focus:border-transparent text-sm transition-all" :disabled="isLoading" />
          </div>

          <button type="submit" :disabled="isLoading || !email.trim()" class="w-full bg-[#024731] hover:bg-[#013424] text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-emerald-950/15 hover:shadow-lg disabled:opacity-50 text-center flex items-center justify-center gap-2 cursor-pointer">
            <span v-if="isLoading" class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>Continue</span>
          </button>
        </form>

        <p class="text-xs text-slate-400 font-medium mt-6 text-center">
          Don't have an account? <RouterLink to="/signup" class="text-[#024731] hover:underline font-bold">Sign up here</RouterLink>
        </p>
      </div>

    </div>
  </div>
</template>
