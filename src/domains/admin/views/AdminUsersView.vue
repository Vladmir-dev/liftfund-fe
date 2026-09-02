<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../../stores/auth'
import { authService, type CreateUserPayload } from '../../../services/auth'

const router = useRouter()
const authStore = useAuthStore()

const users = ref<any[]>([])
const realms = ref<any[]>([])
const accessGroups = ref<any[]>([])
const isLoading = ref(true)
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Modal state
const showCreateModal = ref(false)
const form = ref<CreateUserPayload>({
  firstName: '',
  lastName: '',
  middleName: '',
  idType: 'NATIONAL_ID',
  idNumber: '',
  email: '',
  phone: '',
  accountType: 'CLIENT',
  realmId: '',
  accessGroupId: '',
  address: '',
  registrationNumber: '',
  contactPersonName: '',
  contactPersonPhone: '',
  contactPersonEmail: '',
})

const fetchUsers = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const res = await authService.listUsers(1, 50)
    users.value = (res as any)?.users || (Array.isArray(res) ? res : [])
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to load users.'
  } finally {
    isLoading.value = false
  }
}

const fetchAuxData = async () => {
  try {
    const [realmsRes, agRes] = await Promise.allSettled([
      authService.listRealms(),
      authService.listAccessGroups(),
    ])
    if (realmsRes.status === 'fulfilled') {
      const data = realmsRes.value as any
      realms.value = data?.realms || (Array.isArray(data) ? data : [])
      if (realms.value.length > 0 && !form.value.realmId) {
        form.value.realmId = realms.value[0].id
      }
    }
    if (agRes.status === 'fulfilled') {
      const data = agRes.value as any
      accessGroups.value = data?.accessGroups || (Array.isArray(data) ? data : [])
      if (accessGroups.value.length > 0 && !form.value.accessGroupId) {
        form.value.accessGroupId = accessGroups.value[0].id
      }
    }
  } catch {
    // optional metadata
  }
}

onMounted(() => {
  if (!authStore.isLoggedIn) {
    router.push('/login')
    return
  }
  fetchUsers()
  fetchAuxData()
})

const openModal = () => {
  form.value = {
    firstName: '',
    lastName: '',
    middleName: '',
    idType: 'NATIONAL_ID',
    idNumber: '',
    email: '',
    phone: '',
    accountType: 'CLIENT',
    realmId: realms.value[0]?.id || '',
    accessGroupId: accessGroups.value[0]?.id || '',
    address: '',
    registrationNumber: '',
    contactPersonName: '',
    contactPersonPhone: '',
    contactPersonEmail: '',
  }
  showCreateModal.value = true
}

const handleCreateUser = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!form.value.firstName || !form.value.lastName || !form.value.email || !form.value.phone) {
    errorMessage.value = 'Please complete all required fields.'
    return
  }

  isSubmitting.value = true
  try {
    await authService.registerUser(form.value)
    successMessage.value = `User ${form.value.firstName} ${form.value.lastName} created! A verification link has been emailed.`
    showCreateModal.value = false
    await fetchUsers()
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to create user.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-800 font-sans">
    
    <!-- Top Admin Bar -->
    <header class="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-3">
          <RouterLink to="/" class="flex items-center gap-1.5">
            <iconify-icon icon="lucide:sunrise" class="text-[#02a95c] text-2xl"></iconify-icon>
            <span class="text-xl font-black text-[#024731] tracking-tight">helpfund</span>
          </RouterLink>
          <span class="text-xs bg-emerald-100 text-[#024731] px-2 py-0.5 rounded font-extrabold tracking-wider uppercase">
            Admin Portal
          </span>
        </div>

        <div class="flex items-center gap-4">
          <RouterLink to="/profile" class="text-sm font-semibold text-slate-600 hover:text-slate-900">
            My Profile
          </RouterLink>
          <button 
            @click="authStore.logout(); router.push('/login')" 
            class="text-sm font-semibold text-rose-600 hover:text-rose-800 cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>

    <!-- Main Container -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      
      <!-- Top Action Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-black text-slate-900">User Accounts</h1>
          <p class="text-sm text-slate-500 mt-0.5">Manage registered clients, administrators, and organizations.</p>
        </div>

        <div class="flex items-center gap-3">
          <button 
            @click="fetchUsers" 
            :disabled="isLoading" 
            class="px-4 py-2 border border-slate-200 rounded-xl hover:bg-white text-slate-600 text-sm font-bold flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <iconify-icon icon="fa6-solid:rotate-right" :class="{ 'animate-spin': isLoading }"></iconify-icon>
            Refresh
          </button>
          <button 
            @click="openModal" 
            class="px-5 py-2 bg-[#024731] hover:bg-[#013424] text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-md cursor-pointer transition-all"
          >
            <iconify-icon icon="fa6-solid:user-plus"></iconify-icon>
            Create User
          </button>
        </div>
      </div>

      <!-- Notification Alerts -->
      <div v-if="successMessage" class="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-[#024731] text-sm font-semibold flex items-center justify-between">
        <span>{{ successMessage }}</span>
        <button @click="successMessage = ''" class="text-slate-400 hover:text-slate-700">✕</button>
      </div>

      <div v-if="errorMessage" class="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold flex items-center justify-between">
        <span>{{ errorMessage }}</span>
        <button @click="errorMessage = ''" class="text-slate-400 hover:text-slate-700">✕</button>
      </div>

      <!-- Users Table Card -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div v-if="isLoading" class="p-12 text-center">
          <span class="h-8 w-8 border-3 border-[#024731] border-t-transparent rounded-full animate-spin inline-block mb-3"></span>
          <p class="text-sm font-bold text-slate-600">Loading user accounts...</p>
        </div>

        <div v-else-if="users.length === 0" class="p-12 text-center">
          <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <iconify-icon icon="fa6-solid:users" class="text-xl"></iconify-icon>
          </div>
          <h3 class="font-bold text-slate-800 mb-1">No users found</h3>
          <p class="text-xs text-slate-400 mb-4">No accounts were returned by the backend.</p>
          <button @click="openModal" class="text-sm font-bold text-[#024731] hover:underline">
            + Provision first user
          </button>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">
              <tr>
                <th class="py-3.5 px-6">User</th>
                <th class="py-3.5 px-6">Email / Phone</th>
                <th class="py-3.5 px-6">Account Type</th>
                <th class="py-3.5 px-6">Status</th>
                <th class="py-3.5 px-6">Created</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
              <tr v-for="u in users" :key="u.id" class="hover:bg-slate-50/80 transition-colors">
                <td class="py-4 px-6 flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-emerald-100 text-[#024731] flex items-center justify-center font-bold text-xs uppercase shrink-0">
                    {{ u.name ? u.name.charAt(0) : 'U' }}
                  </div>
                  <div>
                    <div class="font-bold text-slate-900">{{ u.name || 'Unnamed' }}</div>
                    <div class="text-xs text-slate-400 font-mono">{{ u.id.slice(0, 8) }}...</div>
                  </div>
                </td>
                <td class="py-4 px-6">
                  <div>{{ u.email }}</div>
                  <div class="text-xs text-slate-400">{{ u.phone || 'No phone' }}</div>
                </td>
                <td class="py-4 px-6">
                  <span 
                    class="px-2.5 py-1 rounded-full text-xs font-bold"
                    :class="{
                      'bg-purple-100 text-purple-700': u.accountType === 'BACKOFFICE',
                      'bg-blue-100 text-blue-700': u.accountType === 'ORGANIZATION',
                      'bg-emerald-100 text-emerald-700': u.accountType === 'CLIENT'
                    }"
                  >
                    {{ u.accountType }}
                  </span>
                </td>
                <td class="py-4 px-6">
                  <span 
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                    :class="u.isActive?.Bool !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" :class="u.isActive?.Bool !== false ? 'bg-emerald-500' : 'bg-rose-500'"></span>
                    {{ u.isActive?.Bool !== false ? 'Active' : 'Disabled' }}
                  </span>
                </td>
                <td class="py-4 px-6 text-xs text-slate-500">
                  {{ u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </main>

    <!-- Create User Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl border border-slate-100 my-8">
        
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-black text-slate-900">Provision New User Account</h3>
          <button @click="showCreateModal = false" class="text-slate-400 hover:text-slate-600 cursor-pointer">
            <iconify-icon icon="fa6-solid:xmark" class="text-lg"></iconify-icon>
          </button>
        </div>

        <form @submit.prevent="handleCreateUser" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">First Name *</label>
              <input type="text" v-model="form.firstName" required class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#024731]" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Last Name *</label>
              <input type="text" v-model="form.lastName" required class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#024731]" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
              <input type="email" v-model="form.email" required class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#024731]" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
              <input type="tel" v-model="form.phone" required placeholder="+256..." class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#024731]" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Account Type *</label>
              <select v-model="form.accountType" class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#024731]">
                <option value="CLIENT">Client / Fundraiser</option>
                <option value="BACKOFFICE">Platform Admin (Backoffice)</option>
                <option value="ORGANIZATION">Organization</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">ID Number / NIN</label>
              <input type="text" v-model="form.idNumber" placeholder="CM..." class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#024731]" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Address</label>
            <input type="text" v-model="form.address" placeholder="e.g. Kampala, Uganda" class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#024731]" />
          </div>

          <div class="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button 
              type="button" 
              @click="showCreateModal = false" 
              class="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              :disabled="isSubmitting" 
              class="px-6 py-2.5 rounded-xl bg-[#024731] hover:bg-[#013424] text-white text-sm font-bold shadow-md cursor-pointer flex items-center gap-2"
            >
              <span v-if="isSubmitting" class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Provision User</span>
            </button>
          </div>
        </form>

      </div>
    </div>

  </div>
</template>
