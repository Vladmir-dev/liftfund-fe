import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  authService,
  type CreateClientUserPayload,
  type ValidateOtpResponse,
  type UpdateProfilePayload,
} from '../services/auth'

export interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  accountType: string
  realmId?: string
  avatar?: string
  bio?: string
  location?: string
  website?: string
  dateOfBirth?: string
  gender?: string
  socialLinks?: string[]
}

export const useAuthStore = defineStore('auth', () => {
  const savedUserJson = localStorage.getItem('helpfund_user')
  let initialUser: UserProfile = {
    id: '',
    name: localStorage.getItem('helpfund_userName') || '',
    email: localStorage.getItem('helpfund_userEmail') || '',
    phone: '',
    accountType: localStorage.getItem('helpfund_accountType') || 'CLIENT',
    avatar: '',
  }

  if (savedUserJson) {
    try {
      initialUser = JSON.parse(savedUserJson)
      if (initialUser.avatar && initialUser.avatar.includes('photo-1500648767791-00dcc994a43e')) {
        initialUser.avatar = ''
      }
    } catch {
      // fallback
    }
  }

  const user = ref<UserProfile>(initialUser)
  const accessToken = ref<string | null>(localStorage.getItem('helpfund_accessToken'))
  const refreshToken = ref<string | null>(localStorage.getItem('helpfund_refreshToken'))
  const realm = ref<string | null>(localStorage.getItem('helpfund_realm') || 'CLIENT')
  const isLoggedIn = ref<boolean>(!!accessToken.value)

  // Pending verify token while waiting for OTP validation
  const pendingVerifyToken = ref<string | null>(sessionStorage.getItem('helpfund_pendingVerifyToken'))
  const pendingEmail = ref<string>(sessionStorage.getItem('helpfund_pendingEmail') || '')

  const isAdmin = computed(() => {
    return user.value.accountType === 'BACKOFFICE' || realm.value === 'LIFTFUND'
  })

  // 1. Client self-registration
  async function signupClient(payload: CreateClientUserPayload) {
    return await authService.registerClient(payload)
  }

  // 2. Start login (Email + Password) -> returns verifyToken and triggers OTP
  async function initiateLogin(email: string, password: string): Promise<string> {
    const res = await authService.login({ email, password })
    pendingVerifyToken.value = res.accessToken
    pendingEmail.value = email
    sessionStorage.setItem('helpfund_pendingVerifyToken', res.accessToken)
    sessionStorage.setItem('helpfund_pendingEmail', email)
    return res.accessToken
  }

  // 3. Complete login with OTP code
  async function confirmOtp(code: string, verifyToken?: string): Promise<ValidateOtpResponse> {
    const token = verifyToken || pendingVerifyToken.value
    if (!token) {
      throw new Error('No pending verification token found. Please sign in again.')
    }

    const res = await authService.validateOtp(code, token)

    // Save tokens and session
    accessToken.value = res.accessToken
    refreshToken.value = res.refreshToken
    realm.value = res.realm
    isLoggedIn.value = true

    user.value = {
      id: res.user.id,
      name: res.user.name,
      email: res.user.email,
      phone: res.user.phone,
      accountType: res.user.accountType,
      realmId: res.user.realmId,
      avatar: res.user.avatarUrl?.Valid
        ? res.user.avatarUrl.String
        : '',
      bio: res.user.bio?.Valid ? res.user.bio.String : '',
      location: res.user.location?.Valid ? res.user.location.String : '',
    }

    localStorage.setItem('helpfund_accessToken', res.accessToken)
    localStorage.setItem('helpfund_refreshToken', res.refreshToken)
    localStorage.setItem('helpfund_realm', res.realm)
    localStorage.setItem('helpfund_isLoggedIn', 'true')
    localStorage.setItem('helpfund_user', JSON.stringify(user.value))
    localStorage.setItem('helpfund_userName', user.value.name)
    localStorage.setItem('helpfund_userEmail', user.value.email)
    localStorage.setItem('helpfund_accountType', user.value.accountType)

    // Clear pending state
    pendingVerifyToken.value = null
    pendingEmail.value = ''
    sessionStorage.removeItem('helpfund_pendingVerifyToken')
    sessionStorage.removeItem('helpfund_pendingEmail')

    return res
  }

  // 4. Logout
  async function logout() {
    try {
      if (accessToken.value) {
        await authService.logout()
      }
    } catch {
      // Ignore backend logout errors when expiring locally
    } finally {
      isLoggedIn.value = false
      accessToken.value = null
      refreshToken.value = null
      realm.value = null
      user.value = {
        id: '',
        name: '',
        email: '',
        phone: '',
        accountType: 'CLIENT',
        avatar: '',
      }
      localStorage.removeItem('helpfund_accessToken')
      localStorage.removeItem('helpfund_refreshToken')
      localStorage.removeItem('helpfund_realm')
      localStorage.removeItem('helpfund_isLoggedIn')
      localStorage.removeItem('helpfund_user')
      localStorage.removeItem('helpfund_userName')
      localStorage.removeItem('helpfund_userEmail')
      localStorage.removeItem('helpfund_accountType')
      sessionStorage.removeItem('helpfund_pendingVerifyToken')
      sessionStorage.removeItem('helpfund_pendingEmail')
    }
  }

  // 5. Fetch profile from backend
  async function fetchProfile() {
    if (!isLoggedIn.value) return
    try {
      const res = await authService.getProfile()
      if (res) {
        let avatarStr = ''
        if (typeof res.avatarUrl === 'string' && res.avatarUrl && !res.avatarUrl.includes('photo-1500648767791-00dcc994a43e')) {
          avatarStr = res.avatarUrl
        } else if (typeof res.avatarUrl === 'object' && res.avatarUrl?.Valid && res.avatarUrl.String && !res.avatarUrl.String.includes('photo-1500648767791-00dcc994a43e')) {
          avatarStr = res.avatarUrl.String
        } else if (user.value.avatar && !user.value.avatar.includes('photo-1500648767791-00dcc994a43e')) {
          avatarStr = user.value.avatar
        }

        let bioStr = user.value.bio || ''
        if (typeof res.bio === 'string') bioStr = res.bio
        else if (typeof res.bio === 'object' && res.bio?.Valid) bioStr = res.bio.String

        let locStr = user.value.location || ''
        if (typeof res.location === 'string') locStr = res.location
        else if (typeof res.location === 'object' && res.location?.Valid) locStr = res.location.String

        let webStr = user.value.website || ''
        if (typeof res.website === 'string') webStr = res.website
        else if (typeof res.website === 'object' && res.website?.Valid) webStr = res.website.String

        let dobStr = user.value.dateOfBirth || ''
        if (typeof res.dateOfBirth === 'string') dobStr = res.dateOfBirth
        else if (typeof res.dateOfBirth === 'object' && res.dateOfBirth?.Valid) dobStr = res.dateOfBirth.Time?.substring(0, 10)

        user.value = {
          ...user.value,
          id: res.id || user.value.id,
          name: res.name || user.value.name,
          email: res.email || user.value.email,
          phone: res.phone || user.value.phone,
          accountType: res.accountType || user.value.accountType,
          avatar: avatarStr,
          bio: bioStr,
          location: locStr,
          website: webStr,
          dateOfBirth: dobStr,
          socialLinks: res.socialLinks || [],
        }
        localStorage.setItem('helpfund_user', JSON.stringify(user.value))
        localStorage.setItem('helpfund_userName', user.value.name)
      }
    } catch (err) {
      console.warn('Could not fetch backend profile:', err)
    }
  }

  // 6. Save/update profile to backend
  async function saveProfile(payload: UpdateProfilePayload) {
    const res = await authService.updateProfile(payload)
    if (payload.displayName) user.value.name = payload.displayName
    if (payload.avatarUrl) user.value.avatar = payload.avatarUrl
    if (payload.bio !== undefined) user.value.bio = payload.bio
    if (payload.location !== undefined) user.value.location = payload.location
    if (payload.dateOfBirth !== undefined) user.value.dateOfBirth = payload.dateOfBirth
    if (payload.website !== undefined) user.value.website = payload.website
    if (payload.socialLinks !== undefined) user.value.socialLinks = payload.socialLinks

    localStorage.setItem('helpfund_user', JSON.stringify(user.value))
    localStorage.setItem('helpfund_userName', user.value.name)
    return res
  }

  return {
    user,
    accessToken,
    refreshToken,
    realm,
    isLoggedIn,
    isAdmin,
    pendingEmail,
    pendingVerifyToken,
    signupClient,
    initiateLogin,
    confirmOtp,
    logout,
    fetchProfile,
    saveProfile,
  }
})
