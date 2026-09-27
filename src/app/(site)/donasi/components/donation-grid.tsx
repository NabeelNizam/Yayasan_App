import { DonationCampaign } from '@/types/donation'
import DonationCard from './donation-card'

interface DonationGridProps {
  campaigns: DonationCampaign[]
}

export default function DonationGrid({ campaigns }: DonationGridProps) {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Program Donasi
          </h2>
          <p className="text-sm text-gray-600">
            Pilih program donasi yang ingin Anda dukung
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <DonationCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      </div>
    </section>
  )
}
