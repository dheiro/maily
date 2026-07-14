import { Hono } from 'hono'
import { authRoutes } from './routes/auth'
import { domainRoutes } from './routes/domains'
import { emailRoutes } from './routes/emails'
import type { AppEnv } from './env'

export const app = new Hono<AppEnv>()
  .get('/api/health', (c) => c.json({ status: 'ok' }))
  .route('/api/auth', authRoutes)
  .route('/api/domains', domainRoutes)
  .route('/api/emails', emailRoutes)
  .get('*', async (c) => {
    if (c.env.ASSETS) {
      const url = new URL(c.req.url)
      const indexReq = new Request(new URL('/', url), c.req.raw)
      return await c.env.ASSETS.fetch(indexReq)
    }
    return c.notFound()
  })
