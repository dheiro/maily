export interface Email {
  id: string
  to: string
  from: string
  subject: string
  body_text: string
  body_html: string
  received_at: string
  is_read: number
}

export interface EmailListItem {
  id: string
  from: string
  subject: string
  received_at: string
  is_read: number
}

export interface Domain {
  id: string
  name: string
  sort_order: number
}

export interface User {
  username: string
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}
