import { Hono } from 'hono'
import { setCookie, getCookie } from 'hono/cookie'
import { requireAuth } from '../middleware/require-auth'
import { getUserByUsername, updateUserPassword } from '../repositories/users'
import { verifyPassword, hashPassword } from '../lib/crypto'
import type { AppEnv } from '../env'

export const authRoutes = new Hono<AppEnv>()
  .post('/login', async (c) => {
    const body = await c.req.json().catch(() => ({}))
    const { username, password } = body as { username?: string; password?: string }

    if (!username || !password) return c.json({ error: 'Missing credentials' }, 400)

    const user = await getUserByUsername(c.env.DB, username)
    if (!user) return c.json({ error: 'Invalid credentials' }, 401)

    const isValid = await verifyPassword(password, user.password_hash)
    if (!isValid) return c.json({ error: 'Invalid credentials' }, 401)

    setCookie(c, 'session_user', username, { path: '/', httpOnly: true })
    return c.json({ success: true, username })
  })
  .get('/me', (c) => {
    const user = getCookie(c, 'session_user')
    if (!user) return c.json({ error: 'Unauthorized' }, 401)
    return c.json({ username: user })
  })
  .post('/logout', (c) => {
    setCookie(c, 'session_user', '', { path: '/', httpOnly: true, maxAge: 0 })
    return c.json({ success: true })
  })
  .post('/change-password', requireAuth, async (c) => {
    const username = c.get('username')
    const body = await c.req.json().catch(() => ({}))
    const { currentPassword, newPassword } = body as { currentPassword?: string; newPassword?: string }

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return c.json({ error: 'Invalid input' }, 400)
    }

    const user = await getUserByUsername(c.env.DB, username)
    if (!user) return c.json({ error: 'User not found' }, 404)

    const isValid = await verifyPassword(currentPassword, user.password_hash)
    if (!isValid) {
      return c.json({ error: 'Current password is incorrect' }, 401)
    }

    const newHash = await hashPassword(newPassword)
    await updateUserPassword(c.env.DB, username, newHash)

    return c.json({ success: true })
  })
