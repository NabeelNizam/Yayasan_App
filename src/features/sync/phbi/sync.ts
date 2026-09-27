import { revalidateTag } from 'next/cache'
import type { Payload } from 'payload'
import { parsePhbiRows } from './parse'

export async function runPhbiSync(payload: Payload, csvUrl?: string): Promise<{ rowCount: number }> {
  const url = csvUrl ?? process.env.PHBI_SHEET_CSV_URL
  const startedAt = new Date().toISOString()
  let rowCount = 0
  try {
    if (!url) throw new Error('PHBI_SHEET_CSV_URL belum diset')
    const res = await fetch(url)
    const csv = await res.text()
    const rows = parsePhbiRows(csv)
    for (const row of rows) {
      const existing = await payload.find({
        collection: 'phbi-recap',
        where: { rowKey: { equals: row.rowKey } },
        limit: 1,
      })
      const data = {
        rowKey: row.rowKey,
        event: row.event,
        year: row.year,
        date: row.date,
        description: row.description,
      }
      if (existing.docs.length > 0) {
        await payload.update({ collection: 'phbi-recap', id: existing.docs[0].id, data })
      } else {
        await payload.create({ collection: 'phbi-recap', data })
      }
      rowCount++
    }
    await payload.create({
      collection: 'sync-runs',
      data: { startedAt, finishedAt: new Date().toISOString(), status: 'success', rowCount },
    })
    revalidateTag('phbi', 'max')
    return { rowCount }
  } catch (error) {
    await payload.create({
      collection: 'sync-runs',
      data: {
        startedAt,
        finishedAt: new Date().toISOString(),
        status: 'failed',
        rowCount,
        errorMessage: error instanceof Error ? error.message : 'unknown',
      },
    })
    throw error
  }
}
