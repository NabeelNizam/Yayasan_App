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

export default function KontakPage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <ContactInfoSection items={contactInfoData} />
      <SocialMediaSection items={socialLinksData} />
      <LocationMapSection mapEmbedUrl={mapEmbedUrl} />
      <FeedbackForm />
    </div>
  )
}
