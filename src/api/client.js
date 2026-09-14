const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false'

export class ApiError extends Error {
    constructor(message, status = 0, details = null) {
        super(message)
        this.name = 'ApiError'
        this.status = status
        this.details = details
    }
}

export function getAuthToken() {
    return window.localStorage.getItem('pngrfl_auth_token')
}

export function setAuthToken(token) {
    if (token) window.localStorage.setItem('pngrfl_auth_token', token)
    else window.localStorage.removeItem('pngrfl_auth_token')
}

export async function request(path, options = {}) {
    const { fallback, ...fetchOptions } = options

    if (USE_MOCK_DATA && fallback !== undefined) return fallback

    const headers = new Headers(fetchOptions.headers)
    headers.set('Accept', 'application/json')
    if (fetchOptions.body && !(fetchOptions.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json')
    }

    const token = getAuthToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)

    const response = await fetch(`${API_BASE_URL}/${path.replace(/^\//, '')}`, {
        ...fetchOptions,
        headers,
    })

    const contentType = response.headers.get('content-type') || ''
    const payload = contentType.includes('application/json')
        ? await response.json()
        : await response.text()

    if (!response.ok) {
        throw new ApiError(payload?.message || 'The request could not be completed.', response.status, payload)
    }

    return payload
}

export { API_BASE_URL, USE_MOCK_DATA }