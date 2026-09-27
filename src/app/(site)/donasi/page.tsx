import { Hero, Disclaimer, Quote, DonationGrid, donationCampaignsData } from './components'

export default function DonasiPage() {
  return (
    <div className="min-h-screen pb-16">
      <Hero />
      <Disclaimer />
      <Quote />
      <DonationGrid campaigns={donationCampaignsData} />
    </div>
  )
}
