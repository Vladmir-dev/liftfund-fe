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

export async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
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

  let json: any
  try {
    json = await response.json()
  } catch (err) {
    if (!response.ok) {
      throw new ApiError(`Request failed with status ${response.status}`, response.status)
    }
    return {} as T
  }

  // Auto-refresh token if expired
  const isAuthErr = response.status === 401 || (json?.error?.error && String(json.error.error).includes('authentication token')) || (json?.error?.description && String(json.error.description).includes('Authentication Failed'))
  if (isAuthErr && !(options as any)._isRetry) {
    const refreshToken = localStorage.getItem('helpfund_refreshToken')
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/api/v1/auth/token/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        })
        const refreshJson = await refreshRes.json()
        const newAccess = refreshJson.data?.accessToken || refreshJson.accessToken
        if (refreshRes.ok && newAccess) {
          localStorage.setItem('helpfund_accessToken', newAccess)
          if (refreshJson.data?.refreshToken || refreshJson.refreshToken) {
            localStorage.setItem('helpfund_refreshToken', refreshJson.data?.refreshToken || refreshJson.refreshToken)
          }
          headers['Authorization'] = `Bearer ${newAccess}`
          return request<T>(endpoint, { ...options, headers, _isRetry: true } as any)
        }
      } catch {
        // Fall through to error throwing
      }
    }
  }

  if (!response.ok || (json.code && json.code >= 400)) {
    const errMsg =
      json.error?.description ||
      json.error?.error ||
      json.error?.message ||
      json.message ||
      `Request failed with status ${json.code || response.status}`
    throw new ApiError(errMsg, json.code || response.status, json.error)
  }

  return (json.data !== undefined ? json.data : json) as T
}
