import { Hero, Disclaimer, Quote, DonationGrid } from './components'
import { getCampaigns } from '@/features/donasi/getCampaigns'

export const revalidate = 300

export default async function DonasiPage() {
  const campaigns = await getCampaigns()
  return (
    <div className="min-h-screen pb-16">
      <Hero />
      <Disclaimer />
      <Quote />
      <DonationGrid campaigns={campaigns} />
    </div>
  )
}