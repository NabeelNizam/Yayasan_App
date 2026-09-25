'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronUp, faHeart } from '@fortawesome/free-solid-svg-icons'
import { Donor } from '@/types/donation'
import { formatCurrency, getRelativeTime } from '../../components/data'

interface DonorListProps {
  donors: Donor[]
}

export default function DonorList({ donors }: DonorListProps) {
  const [showAll, setShowAll] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const displayedDonors = showAll ? donors : donors.slice(0, 5)

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Daftar Donatur</h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-sm font-medium text-[#059035] transition-colors hover:text-[#0B7932]"
        >
          {isExpanded ? (
            <>
              Sembunyikan
              <FontAwesomeIcon icon={faChevronUp} className="text-xs" />
            </>
          ) : (
            <>
              Tampilkan Semua
              <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
            </>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-3">
          {displayedDonors.map((donor) => (
            <div
              key={donor.id}
              className="flex items-center justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#059035]/10">
                  <FontAwesomeIcon icon={faHeart} className="text-xs text-[#059035]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {donor.isAnonymous ? 'Hamba Allah' : donor.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getRelativeTime(donor.createdAt)}
                  </p>
                </div>
              </div>
              <p className="text-sm font-semibold text-[#059035]">
                {formatCurrency(donor.amount)}
              </p>
            </div>
          ))}

          {!showAll && donors.length > 5 && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full rounded-lg border border-gray-200 py-2 text-center text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
            >
              Lihat {donors.length - 5} donatur lainnya
            </button>
          )}
        </div>
      )}

      {!isExpanded && (
        <p className="text-center text-sm text-gray-500">
          Klik &quot;Tampilkan Semua&quot; untuk melihat {donors.length} donatur
        </p>
      )}
    </div>
  )
}
