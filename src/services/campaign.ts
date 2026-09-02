import { request, API_BASE_URL, ApiError } from './api'

export interface CampaignCategory {
  id: string
  name: string
  slug: string
  description?: string
  createdAt?: string
}

export interface CreateCampaignPayload {
  title: string
  story: string
  shortSummary?: string
  goalAmount: number
  currency?: string
  coverImageUrl?: string
  location?: string
  endsAt?: string
  categoryIds?: string[]
  accountBank?: string
  accountNumber?: string
  businessEmail?: string
  businessName?: string
  businessContact?: string
  businessMobile?: string
  country?: string
}

export interface BackendCampaign {
  id: string
  ownerId: string
  ownerName?: string
  title: string
  slug: string
  story: string
  shortSummary?: { String: string; Valid: boolean } | string
  goalAmount: number
  raisedAmount: number
  donorCount: number
  currency: string
  coverImageUrl?: { String: string; Valid: boolean } | string
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
  location?: { String: string; Valid: boolean } | string
  createdAt: string
  endsAt?: { Time: string; Valid: boolean } | string
  categories?: CampaignCategory[]
  flutterwaveSubaccountId?: { String: string; Valid: boolean } | string
}

export interface CampaignDetailResponse {
  campaign: BackendCampaign
  categories: CampaignCategory[]
  images: { id: string; url: string; mediaType: string; sortOrder: number }[]
  teamMembers: any[]
  likeCount: number
  commentCount: number
  shareCount: number
  shareBreakdown: { platform: string; shareCount: number }[]
  hasLiked: boolean
}

export interface CampaignComment {
  id: string
  campaignId: string
  userId: string
  name?: string
  authorName?: string
  content: string
  parentId?: string
  createdAt: string
}

export interface CampaignDonation {
  id: string
  campaignId: string
  amount: number
  currency: string
  isAnonymous: boolean
  donorName?: string
  message?: string
  paymentStatus: string
  createdAt: string
}

export interface CreateDonationPayload {
  campaignId: string
  amount: number
  currency?: string
  isAnonymous?: boolean
  donorName?: string
  message?: string
  txRef?: string
}

export interface CreateDonationResponse {
  donation: CampaignDonation
  txRef: string
  paymentMethodId?: string
}

export interface WithdrawalRecord {
  id: string
  campaignId: string
  requesterId: string
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  notes?: { String: string; Valid: boolean } | string
  createdAt: string
  processedAt?: { Time: string; Valid: boolean } | string
}

export interface CreateWithdrawalPayload {
  campaignId: string
  amount: number
  currency?: string
  notes?: string
}

export interface CampaignUpdateRecord {
  id: string
  campaignId: string
  title: string
  content: string
  createdAt: string
}

export interface CreateCampaignUpdatePayload {
  campaignId: string
  title: string
  content: string
}

export interface TeamMemberRecord {
  id: string
  campaignId: string
  userId: string
  role?: string
  userName?: string
  userEmail?: string
  avatar?: string
}

export interface UpdateCampaignPayload {
  title?: string
  story?: string
  shortSummary?: string
  coverImageUrl?: string
  location?: string
  status?: string
  isFeatured?: boolean
  endsAt?: string
}

export interface UserDashboardMetrics {
  totalCampaigns: number
  totalDonations: number
  totalDonated: number
}

export interface DonorDonationRecord {
  id: string
  campaignId: string
  donorId?: string
  donorName: string
  amount: number
  currency: string
  message?: string
  paymentStatus: 'pending' | 'succeeded' | 'failed' | 'refunded'
  txRef?: string
  createdAt: string
  campaignTitle?: string
  campaignSlug?: string
  campaignCover?: string | { String: string; Valid: boolean }
}

export const campaignService = {
  // Fetch available campaign categories
  async fetchCategories(): Promise<CampaignCategory[]> {
    const res = await request<CampaignCategory[]>('/api/v1/campaigns/categories')
    return Array.isArray(res) ? res : ((res as any)?.categories || [])
  },

  // Upload a campaign image (returns { url: "/uploads/{userId}/{filename}" })
  async uploadImage(file: File): Promise<{ url: string }> {
    const token = localStorage.getItem('helpfund_accessToken')
    if (!token) {
      throw new ApiError('Authentication required to upload images. Please sign in.', 401)
    }

    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/api/v1/campaigns/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const text = await response.text()
      throw new ApiError(text || `Failed to upload image (${response.status})`, response.status)
    }

    const json = await response.json()
    return json
  },

  // List public campaigns
  async listPublicCampaigns(page: number = 1, limit: number = 20, status?: string): Promise<{ campaigns: BackendCampaign[]; pagination?: any }> {
    const statusParam = status ? `&status=${status}` : ''
    const res = await request<any>(`/api/v1/campaigns?page=${page}&limit=${limit}${statusParam}`)
    const list = res?.content || (Array.isArray(res) ? res : (res?.campaigns || []))
    return {
      campaigns: list,
      pagination: res?.pagination,
    }
  },

  // List featured campaigns for hero/showcase
  async listFeaturedCampaigns(): Promise<BackendCampaign[]> {
    const res = await request<any>('/api/v1/campaigns/featured')
    return Array.isArray(res) ? res : (res?.campaigns || res?.content || [])
  },

  // Get full campaign detail
  getCampaignDetail(idOrSlug: string): Promise<CampaignDetailResponse> {
    return request<CampaignDetailResponse>(`/api/v1/campaigns/${idOrSlug}`)
  },

  // Create a new campaign (in draft state)
  createCampaign(payload: CreateCampaignPayload): Promise<BackendCampaign> {
    return request<BackendCampaign>('/api/v1/campaigns', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  // Publish a campaign (transitions status from draft to active)
  publishCampaign(campaignId: string): Promise<any> {
    return request(`/api/v1/campaigns/${campaignId}/publish`, {
      method: 'GET',
    })
  },

  // Get campaigns created by current logged-in user
  async getMyCampaigns(page: number = 1, limit: number = 20): Promise<BackendCampaign[]> {
    const res = await request<any>(`/api/v1/campaigns/me/campaigns?page=${page}&limit=${limit}`)
    return Array.isArray(res) ? res : (res?.campaigns || res?.content || [])
  },

  // Toggle like for campaign (authenticated)
  toggleLike(campaignId: string): Promise<{ liked: boolean; likeCount: number }> {
    return request<{ liked: boolean; likeCount: number }>(`/api/v1/campaigns/${campaignId}/like`, {
      method: 'GET',
    })
  },

  // List comments for a campaign
  async listComments(campaignId: string, page: number = 1, limit: number = 50): Promise<CampaignComment[]> {
    const res = await request<any>(`/api/v1/campaigns/${campaignId}/comments?page=${page}&limit=${limit}`)
    return Array.isArray(res) ? res : (res?.comments || res?.content || [])
  },

  // Add comment to campaign (authenticated)
  addComment(campaignId: string, content: string, parentId?: string): Promise<CampaignComment> {
    return request<CampaignComment>('/api/v1/campaigns/comments', {
      method: 'POST',
      body: JSON.stringify({
        campaignId,
        content,
        parentId,
      }),
    })
  },

  // Record a share
  recordShare(campaignId: string, platform: string): Promise<any> {
    return request('/api/v1/campaigns/shares', {
      method: 'POST',
      body: JSON.stringify({
        campaignId,
        platform,
      }),
    })
  },

  // Initiate a donation (returns donation record and txRef)
  createDonation(payload: CreateDonationPayload): Promise<CreateDonationResponse> {
    return request<CreateDonationResponse>('/api/v1/campaigns/donations', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  // List donations for a campaign
  async listCampaignDonations(campaignId: string, page: number = 1, limit: number = 50): Promise<CampaignDonation[]> {
    const res = await request<any>(`/api/v1/campaigns/${campaignId}/donations?page=${page}&limit=${limit}`)
    return Array.isArray(res) ? res : (res?.donations || res?.content || [])
  },

  // Request a withdrawal / payout
  createWithdrawal(payload: CreateWithdrawalPayload): Promise<WithdrawalRecord> {
    return request<WithdrawalRecord>('/api/v1/campaigns/withdrawals', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  // List withdrawals (filtered by campaign if campaignId is provided)
  async listWithdrawals(campaignId?: string): Promise<WithdrawalRecord[]> {
    const query = campaignId ? `?campaignId=${campaignId}` : ''
    const res = await request<any>(`/api/v1/campaigns/withdrawals${query}`)
    return Array.isArray(res) ? res : (res?.content || res?.withdrawals || [])
  },

  // Post an update to donors
  createCampaignUpdate(payload: CreateCampaignUpdatePayload): Promise<CampaignUpdateRecord> {
    return request<CampaignUpdateRecord>('/api/v1/campaigns/updates', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  // List posted updates for a campaign
  async listCampaignUpdates(campaignId: string): Promise<CampaignUpdateRecord[]> {
    const res = await request<any>(`/api/v1/campaigns/${campaignId}/updates`)
    return Array.isArray(res) ? res : (res?.content || res?.updates || [])
  },

  // Add team member / collaborator
  addTeamMember(payload: { campaignId: string; userId: string; role?: string }): Promise<any> {
    return request('/api/v1/campaigns/team', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  // List team members for a campaign
  async listTeamMembers(campaignId: string): Promise<TeamMemberRecord[]> {
    const res = await request<any>(`/api/v1/campaigns/${campaignId}/team`)
    return Array.isArray(res) ? res : (res?.content || res?.teamMembers || [])
  },

  // Update existing campaign
  updateCampaign(id: string, payload: UpdateCampaignPayload): Promise<any> {
    return request(`/api/v1/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ id, ...payload }),
    })
  },

  // Fetch user's overall impact dashboard metrics
  async getMyDashboard(): Promise<UserDashboardMetrics> {
    const res = await request<UserDashboardMetrics>('/api/v1/campaigns/me/dashboard')
    return {
      totalCampaigns: Number(res?.totalCampaigns) || 0,
      totalDonations: Number(res?.totalDonations) || 0,
      totalDonated: Number(res?.totalDonated) || 0,
    }
  },

  // Fetch all donations made by the current user
  async getMyDonations(page = 1, limit = 20): Promise<{ content: DonorDonationRecord[]; pagination: any }> {
    const res = await request<any>(`/api/v1/campaigns/me/donations?page=${page}&limit=${limit}`)
    const list = Array.isArray(res) ? res : (res?.content || [])
    return {
      content: list,
      pagination: res?.pagination || { currentPage: page, totalPages: 1, totalRows: list.length },
    }
  },
}
