import { Hono } from 'hono'
import { requireAuth } from '../middleware/require-auth'
import {
  listEmails,
  getEmailById,
  markEmailAsRead,
  deleteEmail,
} from '../repositories/emails'
import type { AppEnv } from '../env'

export const emailRoutes = new Hono<AppEnv>()
  .use('*', requireAuth)
  .get('/', async (c) => {
    const toParam = c.req.query('to')
    const page = parseInt(c.req.query('page') || '1', 10)
    const limit = parseInt(c.req.query('limit') || '20', 10)

    const { emails, total } = await listEmails(c.env.DB, {
      toFilter: toParam ?? null,
      page,
      limit,
    })

    return c.json({ emails, total, page, limit })
  })
  .get('/:id', async (c) => {
    const id = c.req.param('id')

    const email = await getEmailById(c.env.DB, id)
    if (!email) return c.json({ error: 'Not found' }, 404)

    await markEmailAsRead(c.env.DB, id)

    return c.json({ email })
  })
  .delete('/:id', async (c) => {
    const id = c.req.param('id')
    await deleteEmail(c.env.DB, id)
    return c.json({ success: true })
  })
