import { describe, it, expect } from 'vitest'
import { parsePhbiRows } from '@/features/sync/phbi/parse'

describe('parsePhbiRows', () => {
  it('parses valid rows and builds stable rowKey', () => {
    const csv = 'event,year,date,description\nIdul Adha,2024,2024-06-10,qurban\n'
    const rows = parsePhbiRows(csv)
    expect(rows).toHaveLength(1)
    expect(rows[0].rowKey).toBe('idul-adha-2024')
  })
  it('drops rows missing required fields', () => {
    const csv = 'event,year,date,description\n,2024,,\n'
    expect(parsePhbiRows(csv)).toHaveLength(0)
  })
})
