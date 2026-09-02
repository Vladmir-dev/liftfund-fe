<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../../stores/auth'
import { authService } from '../../../services/auth'
import { Notify } from '../../../utils/notify'

const router = useRouter()
const authStore = useAuthStore()

// View steps: 'credentials' | 'otp'
const step = ref<'credentials' | 'otp'>('credentials')

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const otpCode = ref('')

const isLoading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

// Forgot Password states
const showForgotModal = ref(false)
const forgotEmail = ref('')
const isSendingReset = ref(false)
const forgotSuccess = ref(false)
const forgotError = ref('')

const openForgotPassword = () => {
  forgotEmail.value = email.value.trim()
  forgotSuccess.value = false
  forgotError.value = ''
  showForgotModal.value = true
}

const handleForgotPassword = async () => {
  if (!forgotEmail.value.trim()) {
    forgotError.value = 'Please enter your account email address.'
    return
  }
  isSendingReset.value = true
  forgotError.value = ''
  try {
    await authService.forgotPassword(forgotEmail.value.trim())
    forgotSuccess.value = true
    Notify.success('Password reset link sent to your email!')
  } catch (err: any) {
    forgotError.value = err.message || 'Failed to send reset link. Please verify your email.'
    Notify.failure(forgotError.value)
  } finally {
    isSendingReset.value = false
  }
}

// Step 1: Submit email + password
const handleLogin = async () => {
  errorMsg.value = ''
  if (!email.value.trim() || !password.value.trim()) {
    errorMsg.value = 'Please enter both email and password.'
    return
  }

  isLoading.value = true
  try {
    await authStore.initiateLogin(email.value.trim(), password.value)
    step.value = 'otp'
  } catch (err: any) {
    errorMsg.value = err.message || 'Invalid credentials or login failed.'
  } finally {
    isLoading.value = false
  }
}

// Step 2: Submit OTP
const handleVerifyOtp = async () => {
  errorMsg.value = ''
  if (!otpCode.value.trim()) {
    errorMsg.value = 'Please enter the verification code.'
    return
  }

  isLoading.value = true
  try {
    const res = await authStore.confirmOtp(otpCode.value.trim())
    successMsg.value = `Welcome back, ${res.user?.name || 'User'}!`

    setTimeout(() => {
      if (authStore.isAdmin) {
        router.push('/admin/users')
      } else {
        router.push('/profile')
      }
    }, 1000)
  } catch (err: any) {
    errorMsg.value = err.message || 'Invalid or expired OTP code. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const resendOtp = async () => {
  if (!email.value.trim() || !password.value.trim()) return
  isLoading.value = true
  errorMsg.value = ''
  try {
    await authStore.initiateLogin(email.value.trim(), password.value)
    successMsg.value = 'A fresh code has been sent.'
    setTimeout(() => {
      successMsg.value = ''
    }, 3000)
  } catch (err: any) {
    errorMsg.value = err.message || 'Failed to resend code.'
  } finally {
    isLoading.value = false
  }
}

const goToLanding = () => {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-slate-100/60 flex items-center justify-center px-4 relative overflow-hidden font-sans">
    
    <!-- Faded Background Graphics -->
    <div class="absolute inset-0 z-0 pointer-events-none opacity-40">
      <div class="absolute w-[400px] h-[300px] bg-white rounded-3xl border border-slate-200/50 shadow-sm top-1/4 -left-36 rotate-12"></div>
      <div class="absolute w-[350px] h-[250px] bg-white rounded-3xl border border-slate-200/50 shadow-sm bottom-1/4 -right-28 -rotate-12"></div>
      <div class="absolute w-[300px] h-[300px] bg-[#edfce0] rounded-full blur-3xl top-12 right-12"></div>
    </div>

    <!-- Sign In Card -->
    <div class="bg-white rounded-[24px] w-full max-w-[440px] p-8 shadow-xl border border-slate-100 z-10 text-center relative">
      
      <!-- Back Arrow -->
      <button 
        v-if="step === 'otp'" 
        @click="step = 'credentials'" 
        class="absolute top-6 left-6 text-slate-400 hover:text-slate-600 p-1 flex items-center justify-center cursor-pointer transition-colors"
        title="Back to login form"
      >
        <iconify-icon icon="fa6-solid:arrow-left" class="text-base"></iconify-icon>
      </button>
      <button 
        v-else 
        @click="goToLanding" 
        class="absolute top-6 left-6 text-slate-400 hover:text-slate-600 p-1 flex items-center justify-center cursor-pointer transition-colors"
        title="Back to Home"
      >
        <iconify-icon icon="fa6-solid:arrow-left" class="text-base"></iconify-icon>
      </button>

      <!-- Logo inside card -->
      <div class="flex items-center justify-center gap-1.5 mb-6">
        <iconify-icon icon="lucide:sunrise" class="text-[#02a95c] text-2xl"></iconify-icon>
        <span class="text-2xl font-black text-[#024731] tracking-tight">helpfund</span>
      </div>

      <!-- Success Screen -->
      <div v-if="successMsg && step === 'otp' && !errorMsg && authStore.isLoggedIn" class="py-8 flex flex-col items-center justify-center text-center">
        <div class="w-14 h-14 rounded-full bg-[#edfce0] border border-[#bbf770] flex items-center justify-center text-2xl mb-4">
          <iconify-icon icon="fa6-solid:circle-check" class="text-2xl text-[#02a95c]"></iconify-icon>
        </div>
        <p class="font-bold text-slate-800">{{ successMsg }}</p>
        <span class="text-xs text-slate-400 mt-2">Redirecting to your dashboard...</span>
      </div>

      <!-- Step 2: OTP Entry Form -->
      <div v-else-if="step === 'otp'">
        <h2 class="text-2xl font-black text-slate-900 mb-1.5">Enter Verification Code</h2>
        <p class="text-slate-500 text-sm mb-6 font-medium">
          We've sent a 5-digit verification code to <span class="font-semibold text-slate-800">{{ email }}</span>.
        </p>

        <!-- Notification Banner if resend successful -->
        <div v-if="successMsg" class="mb-4 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[#024731] text-xs font-semibold">
          {{ successMsg }}
        </div>

        <!-- Error Banner -->
        <div v-if="errorMsg" class="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 text-left">
          <iconify-icon icon="fa6-solid:circle-exclamation" class="text-sm shrink-0"></iconify-icon>
          <span>{{ errorMsg }}</span>
        </div>

        <form @submit.prevent="handleVerifyOtp" class="flex flex-col gap-4 text-left">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">5-Digit OTP Code</label>
            <input 
              type="text" 
              v-model="otpCode" 
              maxlength="6"
              required 
              placeholder="12345" 
              class="w-full px-5 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#024731] text-center text-xl font-mono tracking-widest transition-all" 
              :disabled="isLoading" 
            />
          </div>

          <button 
            type="submit" 
            :disabled="isLoading || !otpCode.trim()" 
            class="w-full bg-[#024731] hover:bg-[#013424] text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-emerald-950/15 hover:shadow-lg disabled:opacity-50 text-center flex items-center justify-center gap-2 cursor-pointer"
          >
            <span v-if="isLoading" class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>Verify & Sign In</span>
          </button>
        </form>

        <div class="mt-6 flex items-center justify-between text-xs font-medium text-slate-500">
          <button @click="step = 'credentials'" class="hover:text-slate-800 underline cursor-pointer">
            Use different email
          </button>
          <button @click="resendOtp" :disabled="isLoading" class="text-[#024731] font-bold hover:underline cursor-pointer">
            Resend code
          </button>
        </div>
      </div>

      <!-- Step 1: Email + Password Form -->
      <div v-else>
        <h2 class="text-2xl font-black text-slate-900 mb-1.5">Welcome</h2>
        <p class="text-slate-500 text-sm mb-6 font-medium">Sign in to HelpFund or create an account.</p>

        <!-- Error Banner -->
        <div v-if="errorMsg" class="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 text-left">
          <iconify-icon icon="fa6-solid:circle-exclamation" class="text-sm shrink-0"></iconify-icon>
          <span>{{ errorMsg }}</span>
        </div>

        <!-- Email & Password Form -->
        <form @submit.prevent="handleLogin" class="flex flex-col gap-4 text-left">
          <div class="flex flex-col">
            <label class="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" 
              v-model="email" 
              required 
              placeholder="grace@example.com" 
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#024731] text-sm transition-all" 
              :disabled="isLoading" 
            />
          </div>

          <div class="flex flex-col">
            <div class="flex items-center justify-between mb-1">
              <label class="block text-xs font-bold text-slate-700">Password</label>
              <button 
                type="button" 
                @click="openForgotPassword" 
                class="text-[11px] font-bold text-[#024731] hover:underline cursor-pointer">
                Forgot password?
              </button>
            </div>
            <div class="relative">
              <input 
                :type="showPassword ? 'text' : 'password'" 
                v-model="password" 
                required 
                placeholder="Enter your password" 
                class="w-full pl-4 pr-11 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#024731] text-sm transition-all" 
                :disabled="isLoading" 
              />
              <button 
                type="button" 
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 flex items-center justify-center cursor-pointer transition-colors"
                tabindex="-1"
                :title="showPassword ? 'Hide password' : 'Show password'"
              >
                <iconify-icon :icon="showPassword ? 'lucide:eye-off' : 'lucide:eye'" class="text-base"></iconify-icon>
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            :disabled="isLoading || !email.trim() || !password.trim()" 
            class="w-full bg-[#024731] hover:bg-[#013424] text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-emerald-950/15 hover:shadow-lg disabled:opacity-50 text-center flex items-center justify-center gap-2 cursor-pointer mt-1"
          >
            <span v-if="isLoading" class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>Sign In</span>
          </button>
        </form>

        <p class="text-xs text-slate-400 font-medium mt-6 text-center">
          Don't have an account? 
          <RouterLink to="/signup" class="text-[#024731] hover:underline font-bold">Sign up here</RouterLink>
        </p>
      </div>

    </div>

    <!-- Forgot Password Modal -->
    <div v-if="showForgotModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in text-left">
      <div
        class="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 flex flex-col gap-4">
        
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-full bg-emerald-50 text-[#024731] flex items-center justify-center text-lg">
              <iconify-icon icon="ph:key-bold"></iconify-icon>
            </div>
            <div>
              <h3 class="text-base font-black text-slate-900 leading-tight">Reset Password</h3>
              <p class="text-[11px] text-slate-500 font-medium">We will email you a secure reset link</p>
            </div>
          </div>
          <button
            @click="showForgotModal = false"
            class="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer">
            <iconify-icon icon="ph:x-bold" class="text-base"></iconify-icon>
          </button>
        </div>

        <div v-if="forgotSuccess" class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex flex-col gap-2">
          <div class="flex items-center gap-2 font-bold text-xs">
            <iconify-icon icon="ph:check-circle-bold" class="text-emerald-700 text-base"></iconify-icon>
            <span>Reset Link Sent!</span>
          </div>
          <p class="text-xs text-emerald-800 leading-relaxed font-medium">
            We've sent a password reset link to <strong class="text-emerald-950">{{ forgotEmail }}</strong>. Please check your inbox and click the link to set your new password.
          </p>
          <button
            @click="showForgotModal = false"
            class="mt-2 py-2 px-4 rounded-xl bg-[#024731] text-white text-xs font-bold self-start cursor-pointer hover:bg-[#013424]">
            Back to Sign In
          </button>
        </div>

        <form v-else @submit.prevent="handleForgotPassword" class="flex flex-col gap-3.5">
          <p class="text-xs text-slate-600 leading-relaxed font-medium">
            Enter the email address registered with your HelpFund account and we'll send you instructions to reset your password.
          </p>

          <div v-if="forgotError" class="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {{ forgotError }}
          </div>

          <div class="flex flex-col">
            <label class="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" 
              v-model="forgotEmail" 
              required 
              placeholder="grace@example.com" 
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#024731] text-xs font-medium" 
              :disabled="isSendingReset" 
            />
          </div>

          <div class="grid grid-cols-2 gap-2 mt-1">
            <button
              type="button"
              @click="showForgotModal = false"
              :disabled="isSendingReset"
              class="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer">
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSendingReset || !forgotEmail.trim()"
              class="py-2.5 px-4 rounded-xl bg-[#024731] hover:bg-[#013424] disabled:opacity-50 text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer">
              <span v-if="isSendingReset"
                class="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Send Reset Link</span>
            </button>
          </div>
        </form>

      </div>
    </div>

    </div>
  </div>
</template>
