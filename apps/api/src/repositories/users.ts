export interface User {
  id: string
  username: string
  password_hash: string
}

export async function getUserByUsername(db: D1Database, username: string): Promise<User | null> {
  return await db.prepare('SELECT * FROM users WHERE username = ?').bind(username).first() as User | null
}

export async function updateUserPassword(db: D1Database, username: string, newHash: string): Promise<void> {
  await db.prepare('UPDATE users SET password_hash = ? WHERE username = ?').bind(newHash, username).run()
}
