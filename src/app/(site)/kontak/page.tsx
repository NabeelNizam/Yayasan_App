import {
  Hero,
  ContactInfoSection,
  SocialMediaSection,
  LocationMapSection,
  FeedbackForm,
  contactInfoData,
  socialLinksData,
  mapEmbedUrl,
} from './components'
import { getContactSettings } from '@/features/kontak/getSettings'

export const revalidate = 300

export default async function KontakPage() {
  const settings = await getContactSettings()

  const items = settings.contactInfo.length > 0 ? settings.contactInfo : contactInfoData
  const socials = settings.socialLinks.length > 0 ? settings.socialLinks : socialLinksData
  const map = settings.mapEmbedUrl || mapEmbedUrl

  return (
    <div className="min-h-screen">
      <Hero />
      <ContactInfoSection items={items} />
      <SocialMediaSection items={socials} />
      <LocationMapSection mapEmbedUrl={map} />
      <FeedbackForm />
    </div>
  )
}