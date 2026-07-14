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

export interface ListEmailsParams {
  toFilter: string | null
  page: number
  limit: number
}

export interface ListEmailsResult {
  emails: EmailListItem[]
  total: number
}

export async function listEmails(db: D1Database, params: ListEmailsParams): Promise<ListEmailsResult> {
  const { toFilter, page, limit } = params
  const offset = (page - 1) * limit

  let countQuery = 'SELECT COUNT(*) as total FROM emails WHERE 1=1'
  let query = 'SELECT id, "from", subject, received_at, is_read FROM emails WHERE 1=1'
  const queryParams: unknown[] = []

  if (toFilter) {
    countQuery += ' AND "to" LIKE ?'
    query += ' AND "to" LIKE ?'
    queryParams.push(`%${toFilter}`)
  }

  query += ' ORDER BY received_at DESC LIMIT ? OFFSET ?'

  const countParams = [...queryParams]
  queryParams.push(limit, offset)

  const countResult = await db.prepare(countQuery).bind(...countParams).first() as { total: number } | null
  const { results } = await db.prepare(query).bind(...queryParams).all()

  return {
    emails: results as unknown as EmailListItem[],
    total: countResult?.total ?? 0,
  }
}

export async function getEmailById(db: D1Database, id: string): Promise<Email | null> {
  return await db.prepare('SELECT * FROM emails WHERE id = ?').bind(id).first() as Email | null
}

export async function markEmailAsRead(db: D1Database, id: string): Promise<void> {
  await db.prepare('UPDATE emails SET is_read = 1 WHERE id = ?').bind(id).run()
}

export async function deleteEmail(db: D1Database, id: string): Promise<void> {
  await db.prepare('DELETE FROM emails WHERE id = ?').bind(id).run()
}

export interface InsertEmailParams {
  id: string
  to: string
  from: string
  subject: string
  bodyText: string
  bodyHtml: string
  receivedAt: string
}

export async function insertEmail(db: D1Database, params: InsertEmailParams): Promise<void> {
  await db.prepare(
    'INSERT INTO emails (id, "to", "from", subject, body_text, body_html, received_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(
    params.id,
    params.to,
    params.from,
    params.subject,
    params.bodyText,
    params.bodyHtml,
    params.receivedAt
  ).run()
}
