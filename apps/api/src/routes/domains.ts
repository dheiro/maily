import { Hono } from 'hono'
import { requireAuth } from '../middleware/require-auth'
import {
  listDomains,
  getMaxSortOrder,
  createDomain,
  deleteDomain,
  reorderDomains,
} from '../repositories/domains'
import type { AppEnv } from '../env'

export const domainRoutes = new Hono<AppEnv>()
  .use('*', requireAuth)
  .get('/', async (c) => {
    const domains = await listDomains(c.env.DB)
    return c.json({ domains })
  })
  .post('/', async (c) => {
    const body = await c.req.json().catch(() => ({}))
    const { name } = body as { name?: string }

    if (!name || typeof name !== 'string' || !name.includes('.') || name.includes(' ')) {
      return c.json({ error: 'Invalid domain name' }, 400)
    }

    const maxOrder = await getMaxSortOrder(c.env.DB)
    const nextOrder = maxOrder + 1
    const id = crypto.randomUUID()
    const normalized = name.toLowerCase()

    try {
      await createDomain(c.env.DB, id, normalized, nextOrder)
      return c.json({ domain: { id, name: normalized, sort_order: nextOrder } })
    } catch (e: any) {
      if (e.message?.includes('UNIQUE constraint failed')) {
        return c.json({ error: 'Domain already exists' }, 409)
      }
      return c.json({ error: 'Internal server error' }, 500)
    }
  })
  .put('/reorder', async (c) => {
    const body = await c.req.json().catch(() => ({}))
    const { domainIds } = body as { domainIds?: unknown }

    if (!Array.isArray(domainIds)) {
      return c.json({ error: 'domainIds must be an array' }, 400)
    }

    try {
      await reorderDomains(c.env.DB, domainIds as string[])
      return c.json({ success: true })
    } catch (e) {
      console.error('Reorder error:', e)
      return c.json({ error: 'Failed to reorder domains' }, 500)
    }
  })
  .delete('/:id', async (c) => {
    const id = c.req.param('id')
    await deleteDomain(c.env.DB, id)
    return c.json({ success: true })
  })
