import { request, APP_PUBLIC_KEY } from './api'

export interface CreateClientUserPayload {
  firstName: string
  lastName: string
  middleName?: string
  idType?: string
  idNumber?: string
  email: string
  phone: string
  accountType: 'CLIENT' | 'ORGANIZATION'
  address?: string
  registrationNumber?: string
  contactPersonName?: string
  contactPersonPhone?: string
  contactPersonEmail?: string
}

export interface CreateUserPayload extends CreateClientUserPayload {
  realmId?: string
  accessGroupId?: string
}

export interface LoginResponse {
  accessToken: string // verifyToken
  realm: string
}

export interface ValidateOtpResponse {
  user: {
    id: string
    name: string
    email: string
    phone: string
    accountType: string
    realmId: string
    isActive: { Bool: boolean; Valid: boolean }
    avatarUrl?: { String: string; Valid: boolean }
    bio?: { String: string; Valid: boolean }
    location?: { String: string; Valid: boolean }
  }
  realm: string
  accessToken: string
  refreshToken: string
  token_type: string
  expires_in: number
  expires_at: string
  issued_at: string
}

export interface UpdateProfilePayload {
  displayName?: string
  avatarUrl?: string
  bio?: string
  location?: string
  website?: string
  dateOfBirth?: string
  gender?: string
  organizationName?: string
  organizationTin?: string
  socialLinks?: string[]
}

export interface BackendUserProfile {
  id: string
  name: string
  email: string
  phone: string
  emailVerifiedAt?: any
  phoneVerifiedAt?: any
  realmId?: string
  createdAt?: string
  avatarUrl?: { String: string; Valid: boolean } | string
  bio?: { String: string; Valid: boolean } | string
  location?: { String: string; Valid: boolean } | string
  website?: { String: string; Valid: boolean } | string
  dateOfBirth?: { Time: string; Valid: boolean } | string
  gender?: { String: string; Valid: boolean } | string
  organizationName?: { String: string; Valid: boolean } | string
  socialLinks?: string[]
  accountType: string
  totalDonated?: number
  campaignCount?: number
  permissions?: string[]
}

export const authService = {
  // Fetch current user profile
  getProfile(): Promise<BackendUserProfile> {
    return request<BackendUserProfile>('/api/v1/auth/me')
  },

  // Update current user profile
  updateProfile(payload: UpdateProfilePayload): Promise<{ message: string; user: any; profile: any }> {
    return request('/api/v1/auth/me', {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },

  // Public client self-registration
  registerClient(payload: CreateClientUserPayload) {
    return request('/api/v1/auth/user/register-client', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  // Admin user creation
  registerUser(payload: CreateUserPayload) {
    return request('/api/v1/auth/user/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  // Step 1: Login with email + password -> returns verifyToken
  login(payload: { email: string; password: string }): Promise<LoginResponse> {
    return request<LoginResponse>('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        Authorization: APP_PUBLIC_KEY,
      },
      body: JSON.stringify(payload),
    })
  },

  // Step 2: Validate OTP using verifyToken in Authorization header
  validateOtp(code: string, verifyToken: string): Promise<ValidateOtpResponse> {
    return request<ValidateOtpResponse>('/api/v1/auth/validate/otp', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${verifyToken}`,
      },
      body: JSON.stringify({ code }),
    })
  },

  // Validate email verification link token -> returns setPasswordToken
  validateEmailToken(token: string): Promise<{ setPasswordToken: string }> {
    return request<{ setPasswordToken: string }>('/api/v1/auth/validate/token', {
      method: 'POST',
      headers: {
        Authorization: APP_PUBLIC_KEY,
      },
      body: JSON.stringify({ token }),
    })
  },

  // Set password using setPasswordToken
  setPassword(token: string, password: string): Promise<any> {
    return request('/api/v1/auth/password/set', {
      method: 'POST',
      headers: {
        Authorization: APP_PUBLIC_KEY,
      },
      body: JSON.stringify({ token, password }),
    })
  },

  // Refresh access and refresh tokens
  refreshToken(refreshToken: string): Promise<any> {
    return request('/api/v1/auth/token/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    })
  },

  // Logout current session
  logout(): Promise<any> {
    return request('/api/v1/auth/logout', {
      method: 'GET',
    })
  },

  // List users (Admin / Backoffice)
  listUsers(page: number = 1, limit: number = 20): Promise<{ users: any[]; total?: number }> {
    return request(`/api/v1/auth/users?page=${page}&limit=${limit}`)
  },

  // List realms (for admin form)
  listRealms(): Promise<any> {
    return request('/api/v1/auth/realms')
  },

  // List access groups (for admin form)
  listAccessGroups(): Promise<any> {
    return request('/api/v1/auth/accessGroups')
  },

  // Request password reset email
  forgotPassword(email: string): Promise<any> {
    return request('/api/v1/auth/password/forgot', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  },
}
