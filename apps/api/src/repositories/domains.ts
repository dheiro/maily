export interface Domain {
  id: string
  name: string
  sort_order: number
}

export async function listDomains(db: D1Database): Promise<Domain[]> {
  const { results } = await db.prepare(
    'SELECT id, name, sort_order FROM domains ORDER BY sort_order ASC, name ASC'
  ).all()
  return results as unknown as Domain[]
}

export async function getMaxSortOrder(db: D1Database): Promise<number> {
  const result = await db.prepare('SELECT MAX(sort_order) as maxOrder FROM domains').first() as { maxOrder: number | null } | null
  return result?.maxOrder ?? -1
}

export async function createDomain(db: D1Database, id: string, name: string, sortOrder: number): Promise<void> {
  await db.prepare(
    'INSERT INTO domains (id, name, sort_order) VALUES (?, ?, ?)'
  ).bind(id, name, sortOrder).run()
}

export async function deleteDomain(db: D1Database, id: string): Promise<void> {
  await db.prepare('DELETE FROM domains WHERE id = ?').bind(id).run()
}

export async function reorderDomains(db: D1Database, domainIds: string[]): Promise<void> {
  const statements = domainIds.map((id, index) =>
    db.prepare('UPDATE domains SET sort_order = ? WHERE id = ?').bind(index, id)
  )
  await db.batch(statements)
}
