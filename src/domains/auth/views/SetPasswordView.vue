<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authService } from '../../../services/auth'

const route = useRoute()
const router = useRouter()

const rawToken = ref<string>('')
const setPasswordToken = ref<string>('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const isValidatingToken = ref(true)
const isSubmitting = ref(false)
const tokenError = ref('')
const formError = ref('')
const isSuccess = ref(false)

onMounted(async () => {
  const tokenParam = route.query.token as string
  if (!tokenParam) {
    isValidatingToken.value = false
    tokenError.value = 'No verification token provided in URL. Please check your email link.'
    return
  }

  rawToken.value = tokenParam

  try {
    const res = await authService.validateEmailToken(tokenParam)
    setPasswordToken.value = res.setPasswordToken
  } catch (err: any) {
    tokenError.value = err.message || 'This verification link is invalid or has expired.'
  } finally {
    isValidatingToken.value = false
  }
})

const handleSetPassword = async () => {
  formError.value = ''
  if (password.value.length < 6) {
    formError.value = 'Password must be at least 6 characters long.'
    return
  }

  if (password.value !== confirmPassword.value) {
    formError.value = 'Passwords do not match.'
    return
  }

  isSubmitting.value = true
  try {
    await authService.setPassword(setPasswordToken.value, password.value)
    isSuccess.value = true
  } catch (err: any) {
    formError.value = err.message || 'Failed to set password. Please try again or request a new link.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-100/60 flex items-center justify-center px-4 py-12 relative overflow-hidden font-sans">
    
    <!-- Faded Background Graphics -->
    <div class="absolute inset-0 z-0 pointer-events-none opacity-40">
      <div class="absolute w-[450px] h-[350px] bg-white rounded-3xl border border-slate-200/50 shadow-sm top-1/4 -left-36 rotate-12"></div>
      <div class="absolute w-[400px] h-[300px] bg-white rounded-3xl border border-slate-200/50 shadow-sm bottom-1/4 -right-28 -rotate-12"></div>
      <div class="absolute w-[320px] h-[320px] bg-[#edfce0] rounded-full blur-3xl top-12 right-12"></div>
    </div>

    <!-- Card -->
    <div class="bg-white rounded-[24px] w-full max-w-[460px] p-8 sm:p-10 shadow-xl border border-slate-100 z-10 relative">
      
      <!-- Logo inside card -->
      <div class="flex items-center justify-center gap-1.5 mb-6">
        <iconify-icon icon="lucide:sunrise" class="text-[#02a95c] text-2xl"></iconify-icon>
        <span class="text-2xl font-black text-[#024731] tracking-tight">helpfund</span>
      </div>

      <!-- Token validation loader -->
      <div v-if="isValidatingToken" class="py-12 flex flex-col items-center justify-center text-center">
        <span class="h-8 w-8 border-3 border-[#024731] border-t-transparent rounded-full animate-spin mb-4"></span>
        <p class="text-sm font-bold text-slate-700">Verifying your link...</p>
        <p class="text-xs text-slate-400 mt-1">Please wait a moment while we validate your token.</p>
      </div>

      <!-- Invalid Token Error Screen -->
      <div v-else-if="tokenError" class="py-6 flex flex-col items-center justify-center text-center">
        <div class="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-2xl mb-4 text-rose-600">
          <iconify-icon icon="fa6-solid:triangle-exclamation" class="text-3xl"></iconify-icon>
        </div>
        <h3 class="text-xl font-black text-slate-900 mb-2">Invalid or Expired Link</h3>
        <p class="text-sm text-slate-500 mb-6 max-w-xs">{{ tokenError }}</p>
        <RouterLink 
          to="/login" 
          class="w-full bg-[#024731] hover:bg-[#013424] text-white font-bold py-3 rounded-xl transition-all shadow-md text-center block text-sm"
        >
          Return to Sign In
        </RouterLink>
      </div>

      <!-- Success Screen -->
      <div v-else-if="isSuccess" class="py-6 flex flex-col items-center justify-center text-center">
        <div class="w-16 h-16 rounded-full bg-[#edfce0] border border-[#bbf770] flex items-center justify-center text-2xl mb-4">
          <iconify-icon icon="fa6-solid:circle-check" class="text-3xl text-[#02a95c]"></iconify-icon>
        </div>
        <h3 class="text-2xl font-black text-slate-900 mb-2">Password Set!</h3>
        <p class="text-sm text-slate-600 mb-6">
          Your account has been verified and your password is active. You can now sign in.
        </p>
        <RouterLink 
          to="/login" 
          class="w-full bg-[#024731] hover:bg-[#013424] text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-center block"
        >
          Sign In Now
        </RouterLink>
      </div>

      <!-- Set Password Form -->
      <div v-else>
        <div class="text-center mb-6">
          <h2 class="text-2xl font-black text-slate-900 mb-1.5">Create Password</h2>
          <p class="text-slate-500 text-sm font-medium">Choose a secure password for your HelpFund account.</p>
        </div>

        <div v-if="formError" class="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <iconify-icon icon="fa6-solid:circle-exclamation" class="text-sm shrink-0"></iconify-icon>
          <span>{{ formError }}</span>
        </div>

        <form @submit.prevent="handleSetPassword" class="flex flex-col gap-4 text-left">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">New Password</label>
            <div class="relative">
              <input 
                :type="showPassword ? 'text' : 'password'" 
                v-model="password" 
                required 
                placeholder="At least 6 characters" 
                class="w-full pl-4 pr-11 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#024731] text-sm" 
                :disabled="isSubmitting" 
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

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
            <div class="relative">
              <input 
                :type="showConfirmPassword ? 'text' : 'password'" 
                v-model="confirmPassword" 
                required 
                placeholder="Re-enter your password" 
                class="w-full pl-4 pr-11 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#024731] text-sm" 
                :disabled="isSubmitting" 
              />
              <button 
                type="button" 
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 flex items-center justify-center cursor-pointer transition-colors"
                tabindex="-1"
                :title="showConfirmPassword ? 'Hide password' : 'Show password'"
              >
                <iconify-icon :icon="showConfirmPassword ? 'lucide:eye-off' : 'lucide:eye'" class="text-base"></iconify-icon>
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            :disabled="isSubmitting" 
            class="w-full bg-[#024731] hover:bg-[#013424] text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-emerald-950/15 hover:shadow-lg disabled:opacity-50 text-center flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span v-if="isSubmitting" class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>{{ isSubmitting ? 'Saving password...' : 'Set Password & Activate' }}</span>
          </button>
        </form>
      </div>

    </div>
  </div>
</template>
