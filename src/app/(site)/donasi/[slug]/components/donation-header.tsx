import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUsers, faBullseye } from '@fortawesome/free-solid-svg-icons'
import { DonationCampaign } from '@/types/donation'
import { formatCurrency, calculateProgress } from '../../components/data'

interface DonationHeaderProps {
  campaign: DonationCampaign
}

export default function DonationHeader({ campaign }: DonationHeaderProps) {
  const progress = calculateProgress(campaign.collectedAmount, campaign.targetAmount)

  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-lg">
      {/* Cover Image */}
      <div className="relative h-64 w-full overflow-hidden bg-gray-100 sm:h-80 lg:h-96">
        <Image
          src={campaign.coverImage}
          alt={campaign.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="mx-auto max-w-6xl">
            <h1 className="mb-2 text-2xl font-bold text-white sm:text-3xl">
              {campaign.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
              <div className="flex items-center gap-1.5">
                <FontAwesomeIcon icon={faUsers} />
                <span>{campaign.donorCount} donatur</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FontAwesomeIcon icon={faBullseye} />
                <span>Terkumpul {formatCurrency(campaign.collectedAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="border-b border-gray-100 p-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">Terdonasikan</p>
              <p className="text-2xl font-bold text-[#059035]">
                {formatCurrency(campaign.collectedAmount)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Target</p>
              <p className="text-lg font-semibold text-gray-700">
                {formatCurrency(campaign.targetAmount)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Persentase</p>
              <p className="text-2xl font-bold text-[#0B7932]">{progress}%</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-3 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#0B7932] to-[#059035] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="p-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-3 text-lg font-bold text-gray-900">Deskripsi</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">
            {campaign.description}
          </p>
        </div>
      </div>
    </section>
  )
}
