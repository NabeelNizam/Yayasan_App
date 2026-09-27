import Link from 'next/link'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUsers, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { DonationCampaign } from '@/types/donation'
import { formatCurrency, calculateProgress } from './data'

interface DonationCardProps {
  campaign: DonationCampaign
}

export default function DonationCard({ campaign }: DonationCardProps) {
  const progress = calculateProgress(campaign.collectedAmount, campaign.targetAmount)

  return (
    <Link
      href={`/donasi/${campaign.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      {/* Cover Image */}
      <div className="relative h-44 overflow-hidden bg-gray-100">
        <Image
          src={campaign.coverImage}
          alt={campaign.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Progress badge */}
        <div className="absolute right-3 top-3 rounded-full bg-[#0B7932] px-3 py-1 text-xs font-semibold text-white">
          {progress}% terpenuhi
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-2 text-lg font-bold text-gray-900 line-clamp-2">
          {campaign.title}
        </h3>

        <p className="mb-4 flex-grow text-sm leading-relaxed text-gray-600 line-clamp-2">
          {campaign.shortDescription}
        </p>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="mb-1 flex justify-between text-xs">
            <span className="font-medium text-[#059035]">
              {formatCurrency(campaign.collectedAmount)}
            </span>
            <span className="text-gray-500">
              dari {formatCurrency(campaign.targetAmount)}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#0B7932] to-[#059035] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <FontAwesomeIcon icon={faUsers} className="text-xs" />
            <span>{campaign.donorCount} donatur</span>
          </div>

          <div className="flex items-center gap-1 text-sm font-medium text-[#059035] transition-all group-hover:gap-2">
            <span>Donasi</span>
            <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
          </div>
        </div>
      </div>
    </Link>
  )
}
