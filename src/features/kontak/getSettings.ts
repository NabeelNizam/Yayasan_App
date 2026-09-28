import { getPayload } from 'payload'
import config from '@payload-config'
import { PUBLIC_READ } from '@/features/data/constants'

export type ContactInfoItem = { id: string; icon: string; title: string; value: string }
export type SocialLinkItem = { id: string; platform: string; icon: string; description: string; url: string }

export type ContactSettings = {
  contactInfo: ContactInfoItem[]
  socialLinks: SocialLinkItem[]
  mapEmbedUrl: string
  hours: string
}

type RawSettings = {
  kontak?: {
    email?: string | null
    phone?: string | null
    address?: string | null
    mapEmbedUrl?: string | null
    hours?: string | null
  } | null
  sosial?: { platform?: string | null; url?: string | null }[] | null
} | null

const SOCIAL_ICON: Record<string, string> = {
  instagram: 'faInstagram',
  youtube: 'faYoutube',
  facebook: 'faFacebook',
}

const SOCIAL_DESCRIPTION: Record<string, string> = {
  instagram: 'Ikuti kami di Instagram untuk informasi terkini.',
  youtube: 'Tonton kajian dan dokumentasi kegiatan kami di YouTube.',
  facebook: 'Ikuti kami di Facebook untuk informasi terkini.',
}

export function normalizeContactSettings(raw: RawSettings): ContactSettings {
  const kontak = raw?.kontak ?? {}

  const contactInfo: ContactInfoItem[] = []
  if (kontak.email) contactInfo.push({ id: 'email', icon: 'faEnvelope', title: 'Email', value: kontak.email })
  if (kontak.phone) contactInfo.push({ id: 'phone', icon: 'faPhone', title: 'Nomor Telepon', value: kontak.phone })
  if (kontak.address) contactInfo.push({ id: 'address', icon: 'faLocationDot', title: 'Alamat', value: kontak.address })

  const socialLinks: SocialLinkItem[] = (raw?.sosial ?? [])
    .filter((s): s is { platform?: string | null; url?: string | null } => Boolean(s?.url))
    .map((s, i) => {
      const platform = (s.platform ?? '').trim()
      const key = platform.toLowerCase()
      return {
        id: key || `social-${i}`,
        platform,
        icon: SOCIAL_ICON[key] ?? 'faGlobe',
        description: SOCIAL_DESCRIPTION[key] ?? `Ikuti kami di ${platform}.`,
        url: s.url ?? '',
      }
    })

  return {
    contactInfo,
    socialLinks,
    mapEmbedUrl: kontak.mapEmbedUrl ?? '',
    hours: kontak.hours ?? '',
  }
}

export async function getContactSettings(): Promise<ContactSettings> {
  const payload = await getPayload({ config })
  const settings = await payload
    .findGlobal({
      slug: 'site-settings',
      ...PUBLIC_READ,
      select: { kontak: true, sosial: true },
    })
    .catch(() => null)
  return normalizeContactSettings(settings as RawSettings)
}
