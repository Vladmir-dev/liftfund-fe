// API client for LiftFund backend

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:19430'
export const APP_PUBLIC_KEY = import.meta.env.VITE_APP_PUBLIC_KEY || '++y8EBXnk9ZTAEFwEjHWn7FjlV4tQ9RhXfcouY6Fr1Q='

export interface ApiResponse<T = any> {
  code: number
  data?: T
  error?: {
    type?: string
    description?: string
    statusCode?: number
    error?: string
    message?: string
  }
  timestamp: string
}

export class ApiError extends Error {
  statusCode: number
  errorData: any

  constructor(message: string, statusCode: number = 500, errorData?: any) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.errorData = errorData
  }
}

// Shared promise to prevent concurrent duplicate refresh requests
let refreshPromise: Promise<string | null> | null = null

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('helpfund_refreshToken')
  if (!refreshToken) return null

  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = (async () => {
    try {
      const refreshRes = await fetch(`${API_BASE_URL}/api/v1/auth/token/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })

      const rawText = await refreshRes.text()
      let refreshJson: any = null
      try {
        refreshJson = JSON.parse(rawText)
      } catch {
        refreshJson = null
      }

      const newAccess = refreshJson?.data?.accessToken || refreshJson?.accessToken
      if (refreshRes.ok && newAccess) {
        localStorage.setItem('helpfund_accessToken', newAccess)
        const newRefresh = refreshJson?.data?.refreshToken || refreshJson?.refreshToken
        if (newRefresh) {
          localStorage.setItem('helpfund_refreshToken', newRefresh)
        }
        return newAccess
      }

      // If refresh token is expired/invalid, clear session
      localStorage.removeItem('helpfund_accessToken')
      localStorage.removeItem('helpfund_refreshToken')
      localStorage.removeItem('helpfund_user')
      return null
    } catch {
      return null
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

export async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  }

  // Inject token if present and not already provided
  if (!headers['Authorization']) {
    const token = localStorage.getItem('helpfund_accessToken')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  // Read response as text first to handle both JSON and plain text error envelopes
  const rawText = await response.text()
  let json: any = null
  try {
    json = JSON.parse(rawText)
  } catch {
    json = null
  }

  // Detect token expiry across all HTTP status codes (401, or 500 containing auth failure text)
  const isAuthErr =
    response.status === 401 ||
    rawText.includes('invalid authentication token') ||
    rawText.includes('Authentication Failed') ||
    rawText.includes('invalid or expired refresh token') ||
    Boolean(json?.error?.error && String(json.error.error).includes('authentication token')) ||
    Boolean(json?.error?.description && String(json.error.description).includes('Authentication Failed'))

  if (isAuthErr && !(options as any)._isRetry) {
    const newAccess = await refreshAccessToken()
    if (newAccess) {
      headers['Authorization'] = `Bearer ${newAccess}`
      return request<T>(endpoint, { ...options, headers, _isRetry: true } as any)
    } else {
      throw new ApiError('Your session has expired. Please log in again.', 401)
    }
  }

  if (!response.ok || (json && typeof json.code === 'number' && json.code >= 400)) {
    const errMsg =
      json?.error?.description ||
      json?.error?.error ||
      json?.error?.message ||
      json?.message ||
      rawText ||
      `Request failed with status ${response.status}`
    throw new ApiError(errMsg, json?.code || response.status, json?.error)
  }

  if (!json && !rawText) {
    return {} as T
  }

  return (json && json.data !== undefined ? json.data : (json ?? (rawText as any))) as T
}
