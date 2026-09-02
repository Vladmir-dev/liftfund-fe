<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const firstName = ref('')
const lastName = ref('')
const middleName = ref('')
const email = ref('')
const phone = ref('')
const accountType = ref<'CLIENT' | 'ORGANIZATION'>('CLIENT')
const address = ref('')
const registrationNumber = ref('')
const contactPersonName = ref('')
const contactPersonEmail = ref('')
const contactPersonPhone = ref('')

const isLoading = ref(false)
const errorMsg = ref('')
const successSubmitted = ref(false)

const handleRegister = async () => {
  errorMsg.value = ''
  if (!firstName.value.trim() || !lastName.value.trim() || !email.value.trim() || !phone.value.trim()) {
    errorMsg.value = 'Please fill in all required fields.'
    return
  }

  isLoading.value = true
  try {
    await authStore.signupClient({
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      middleName: middleName.value.trim() || undefined,
      email: email.value.trim(),
      phone: phone.value.trim(),
      accountType: accountType.value,
      address: address.value.trim() || undefined,
      registrationNumber: registrationNumber.value.trim() || undefined,
      contactPersonName: contactPersonName.value.trim() || undefined,
      contactPersonEmail: contactPersonEmail.value.trim() || undefined,
      contactPersonPhone: contactPersonPhone.value.trim() || undefined,
    })

    successSubmitted.value = true
  } catch (err: any) {
    errorMsg.value = err.message || 'Registration failed. Please verify your details.'
  } finally {
    isLoading.value = false
  }
}

const goToLanding = () => {
  router.push('/')
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

    <!-- Sign Up Card -->
    <div class="bg-white rounded-[24px] w-full max-w-[540px] p-8 sm:p-10 shadow-xl border border-slate-100 z-10 relative">
      
      <!-- Back Arrow -->
      <button @click="goToLanding" class="absolute top-6 left-6 text-slate-400 hover:text-slate-600 p-1 flex items-center justify-center cursor-pointer transition-colors" title="Back to Home">
        <iconify-icon icon="fa6-solid:arrow-left" class="text-base"></iconify-icon>
      </button>

      <!-- Logo inside card -->
      <div class="flex items-center justify-center gap-1.5 mb-6">
        <iconify-icon icon="lucide:sunrise" class="text-[#02a95c] text-2xl"></iconify-icon>
        <span class="text-2xl font-black text-[#024731] tracking-tight">helpfund</span>
      </div>

      <!-- Success Screen -->
      <div v-if="successSubmitted" class="py-8 flex flex-col items-center justify-center text-center">
        <div class="w-16 h-16 rounded-full bg-[#edfce0] border border-[#bbf770] flex items-center justify-center text-2xl mb-4 shadow-sm">
          <iconify-icon icon="fa6-solid:circle-check" class="text-3xl text-[#02a95c]"></iconify-icon>
        </div>
        <h3 class="text-2xl font-black text-slate-900 mb-2">Check Your Email!</h3>
        <p class="text-sm text-slate-600 mb-4 max-w-sm">
          We've sent a verification link to <strong class="text-slate-900">{{ email }}</strong>.
        </p>
        <div class="p-4 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs text-slate-600 text-left mb-6 leading-relaxed">
          <p class="font-bold text-[#024731] mb-1">Next Step:</p>
          Click the link in your email within 24 hours to create your password and activate your account.
        </div>
        <RouterLink 
          to="/login" 
          class="w-full bg-[#024731] hover:bg-[#013424] text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-center block"
        >
          Go to Sign In
        </RouterLink>
      </div>

      <!-- Registration Form Content -->
      <div v-else>
        <div class="text-center mb-6">
          <h2 class="text-2xl font-black text-slate-900 mb-1.5">Create your account</h2>
          <p class="text-slate-500 text-sm font-medium">Join HelpFund to start raising or supporting impactful causes.</p>
        </div>

        <!-- Account Type Switch -->
        <div class="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl mb-6 text-sm font-bold">
          <button 
            type="button" 
            @click="accountType = 'CLIENT'" 
            :class="accountType === 'CLIENT' ? 'bg-white text-[#024731] shadow-sm' : 'text-slate-500 hover:text-slate-800'"
            class="py-2 rounded-lg transition-all text-center cursor-pointer"
          >
            Individual
          </button>
          <button 
            type="button" 
            @click="accountType = 'ORGANIZATION'" 
            :class="accountType === 'ORGANIZATION' ? 'bg-white text-[#024731] shadow-sm' : 'text-slate-500 hover:text-slate-800'"
            class="py-2 rounded-lg transition-all text-center cursor-pointer"
          >
            Organization / NGO
          </button>
        </div>

        <!-- Error Message -->
        <div v-if="errorMsg" class="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <iconify-icon icon="fa6-solid:circle-exclamation" class="text-sm shrink-0"></iconify-icon>
          <span>{{ errorMsg }}</span>
        </div>

        <form @submit.prevent="handleRegister" class="flex flex-col gap-4 text-left">
          <!-- Name inputs -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">First Name *</label>
              <input 
                type="text" 
                v-model="firstName" 
                required 
                placeholder="e.g. Grace" 
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#024731] text-sm" 
                :disabled="isLoading" 
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Last Name *</label>
              <input 
                type="text" 
                v-model="lastName" 
                required 
                placeholder="e.g. Nakato" 
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#024731] text-sm" 
                :disabled="isLoading" 
              />
            </div>
          </div>

          <!-- Email & Phone -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
              <input 
                type="email" 
                v-model="email" 
                required 
                placeholder="grace@example.com" 
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#024731] text-sm" 
                :disabled="isLoading" 
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
              <input 
                type="tel" 
                v-model="phone" 
                required 
                placeholder="+256700000000" 
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#024731] text-sm" 
                :disabled="isLoading" 
              />
            </div>
          </div>

          <!-- Address -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Address / Location</label>
            <input 
              type="text" 
              v-model="address" 
              placeholder="e.g. Kampala, Uganda" 
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#024731] text-sm" 
              :disabled="isLoading" 
            />
          </div>

          <!-- Organization Extra Fields -->
          <div v-if="accountType === 'ORGANIZATION'" class="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
            <h4 class="text-xs font-extrabold text-[#024731] uppercase tracking-wider">Organization Details</h4>
            
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Registration / Certificate Number</label>
              <input 
                type="text" 
                v-model="registrationNumber" 
                placeholder="e.g. REG-2024-XXXX" 
                class="w-full px-4 py-2 bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#024731] text-sm" 
                :disabled="isLoading" 
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Contact Person Name</label>
                <input 
                  type="text" 
                  v-model="contactPersonName" 
                  placeholder="Primary contact" 
                  class="w-full px-4 py-2 bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#024731] text-sm" 
                  :disabled="isLoading" 
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Contact Person Phone</label>
                <input 
                  type="tel" 
                  v-model="contactPersonPhone" 
                  placeholder="+256..." 
                  class="w-full px-4 py-2 bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#024731] text-sm" 
                  :disabled="isLoading" 
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Contact Person Email</label>
              <input 
                type="email" 
                v-model="contactPersonEmail" 
                placeholder="contact@org.org" 
                class="w-full px-4 py-2 bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#024731] text-sm" 
                :disabled="isLoading" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            :disabled="isLoading" 
            class="w-full bg-[#024731] hover:bg-[#013424] text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-emerald-950/15 hover:shadow-lg disabled:opacity-50 text-center flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span v-if="isLoading" class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>{{ isLoading ? 'Creating account...' : 'Create Account' }}</span>
          </button>
        </form>

        <p class="text-xs text-slate-400 font-medium mt-6 text-center">
          Already have an account? 
          <RouterLink to="/login" class="text-[#024731] hover:underline font-bold">Sign in here</RouterLink>
        </p>
      </div>

    </div>
  </div>
</template>
