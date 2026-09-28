import { revalidateTag } from 'next/cache'
import type { Payload } from 'payload'
import { parsePhbiRows, type PhbiRow } from './parse'

export type SyncSummary = { rowCount: number; created: number; updated: number; skipped: number }

type ExistingRecap = {
  id: number
  rowKey?: string | null
  event?: string | null
  year?: string | null
  date?: string | null
  description?: string | null
}

function toData(row: PhbiRow) {
  return {
    rowKey: row.rowKey,
    event: row.event,
    year: row.year,
    date: row.date,
    description: row.description,
  }
}

function isUnchanged(existing: ExistingRecap, row: PhbiRow): boolean {
  return (
    existing.event === row.event &&
    existing.year === row.year &&
    existing.date === row.date &&
    existing.description === (row.description ?? '')
  )
}

export async function runPhbiSync(payload: Payload, csvUrl?: string): Promise<SyncSummary> {
  const url = csvUrl ?? process.env.PHBI_SHEET_CSV_URL
  const startedAt = new Date().toISOString()
  let rowCount = 0
  try {
    if (!url) throw new Error('PHBI_SHEET_CSV_URL belum diset')
    const res = await fetch(url)
    const csv = await res.text()
    const rows = parsePhbiRows(csv)
    rowCount = rows.length

    // One query: fetch existing rowKey -> doc for the rowKeys we are about to
    // sync, instead of one find() per row (2N -> N).
    const rowKeys = rows.map((r) => r.rowKey)
    const existingByKey = new Map<string, ExistingRecap>()
    if (rowKeys.length > 0) {
      const existing = await payload.find({
        collection: 'phbi-recap',
        where: { rowKey: { in: rowKeys } },
        limit: rowKeys.length,
        pagination: false,
        depth: 0,
      })
      for (const doc of existing.docs) {
        if (doc.rowKey) existingByKey.set(doc.rowKey, doc as ExistingRecap)
      }
    }

    let created = 0
    let updated = 0
    let skipped = 0
    for (const row of rows) {
      const data = toData(row)
      const current = existingByKey.get(row.rowKey)
      if (!current) {
        await payload.create({ collection: 'phbi-recap', data })
        created++
      } else if (isUnchanged(current, row)) {
        skipped++
      } else {
        await payload.update({ collection: 'phbi-recap', id: current.id, data })
        updated++
      }
    }

    await payload.create({
      collection: 'sync-runs',
      data: { startedAt, finishedAt: new Date().toISOString(), status: 'success', rowCount },
    })
    revalidateTag('phbi', 'max')
    return { rowCount, created, updated, skipped }
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
