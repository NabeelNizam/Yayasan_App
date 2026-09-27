import { z } from 'zod'
import { toSlug } from '@/lib/slug'

const Row = z.object({
  event: z.string().min(1),
  year: z.string().regex(/^\d{4}$/),
  date: z.string().min(1),
  description: z.string().default(''),
})

export type PhbiRow = z.infer<typeof Row> & { rowKey: string }

export function parsePhbiRows(csv: string): PhbiRow[] {
  const [header, ...lines] = csv.trim().split(/\r?\n/)
  const cols = header.split(',').map((c) => c.trim())
  const out: PhbiRow[] = []
  for (const line of lines) {
    const cells = line.split(',')
    const obj = Object.fromEntries(cols.map((c, i) => [c, (cells[i] ?? '').trim()]))
    const parsed = Row.safeParse(obj)
    if (!parsed.success) continue
    out.push({ ...parsed.data, rowKey: `${toSlug(parsed.data.event)}-${parsed.data.year}` })
  }
  return out
}
