import { getPayload } from 'payload'
import config from '@payload-config'
import { PUBLIC_READ } from '@/features/data/constants'

export type TentangKamiContent = {
  visi: string
  misi: string[]
  detail: string
}

type RawTentangKami = {
  visi?: string | null
  misi?: { teks?: string | null }[] | null
  detail?: string | null
} | null

export function normalizeTentangKami(raw: RawTentangKami): TentangKamiContent {
  return {
    visi: raw?.visi ?? '',
    misi: Array.isArray(raw?.misi)
      ? raw.misi.map((m) => m?.teks ?? '').filter((t) => t.length > 0)
      : [],
    detail: raw?.detail ?? '',
  }
}

export async function getTentangKami(): Promise<TentangKamiContent> {
  const payload = await getPayload({ config })
  const settings = await payload
    .findGlobal({ slug: 'site-settings', ...PUBLIC_READ })
    .catch(() => null)
  const raw = (settings as { tentangKami?: RawTentangKami } | null)?.tentangKami ?? null
  return normalizeTentangKami(raw)
}
