import type { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'
import type { AppEnv } from '../env'

export const requireAuth = async (c: Context<AppEnv>, next: Next) => {
  const username = getCookie(c, 'session_user')
  if (!username) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  c.set('username', username)
  await next()
}
