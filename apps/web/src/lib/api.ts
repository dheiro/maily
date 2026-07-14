import { ApiError, type Domain, type Email, type EmailListItem, type User } from '../types'

async function apiFetch<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({})) as { error?: string }
    throw new ApiError(errBody.error || res.statusText, res.status)
  }
  return res.json() as Promise<T>
}

export interface ListEmailsParams {
  to?: string
  page: number
  limit: number
}

export interface ListEmailsResult {
  emails: EmailListItem[]
  total: number
  page: number
  limit: number
}

export const api = {
  auth: {
    login: (username: string, password: string): Promise<{ success: boolean; username: string }> =>
      apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
    me: (): Promise<User> => apiFetch('/api/auth/me'),
    logout: (): Promise<{ success: boolean }> =>
      apiFetch('/api/auth/logout', { method: 'POST' }),
    changePassword: (currentPassword: string, newPassword: string): Promise<{ success: boolean }> =>
      apiFetch('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      }),
  },
  emails: {
    list: (params: ListEmailsParams): Promise<ListEmailsResult> => {
      const search = new URLSearchParams()
      if (params.to) search.append('to', params.to)
      search.append('page', String(params.page))
      search.append('limit', String(params.limit))
      return apiFetch<ListEmailsResult>(`/api/emails?${search.toString()}`)
    },
    get: (id: string): Promise<{ email: Email }> => apiFetch(`/api/emails/${id}`),
    delete: (id: string): Promise<{ success: boolean }> =>
      apiFetch(`/api/emails/${id}`, { method: 'DELETE' }),
  },
  domains: {
    list: (): Promise<{ domains: Domain[] }> => apiFetch('/api/domains'),
    create: (name: string): Promise<{ domain: Domain }> =>
      apiFetch('/api/domains', { method: 'POST', body: JSON.stringify({ name }) }),
    delete: (id: string): Promise<{ success: boolean }> =>
      apiFetch(`/api/domains/${id}`, { method: 'DELETE' }),
    reorder: (domainIds: string[]): Promise<{ success: boolean }> =>
      apiFetch('/api/domains/reorder', {
        method: 'PUT',
        body: JSON.stringify({ domainIds }),
      }),
  },
}
