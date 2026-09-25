'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronUp, faHandsPraying } from '@fortawesome/free-solid-svg-icons'
import { Prayer } from '@/types/donation'
import { getRelativeTime } from '../../components/data'

interface PrayerListProps {
  prayers: Prayer[]
}

export default function PrayerList({ prayers }: PrayerListProps) {
  const [showAll, setShowAll] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const displayedPrayers = showAll ? prayers : prayers.slice(0, 3)

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Doa & Pesan</h2>
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
        <div className="space-y-4">
          {displayedPrayers.map((prayer) => (
            <div
              key={prayer.id}
              className="rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100"
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">
                  {prayer.isAnonymous ? 'Hamba Allah' : prayer.donorName}
                </p>
                <span className="text-xs text-gray-400">
                  {getRelativeTime(prayer.createdAt)}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-gray-600">
                &quot;{prayer.message}&quot;
              </p>
            </div>
          ))}

          {!showAll && prayers.length > 3 && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full rounded-lg border border-gray-200 py-2 text-center text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
            >
              Lihat {prayers.length - 3} doa lainnya
            </button>
          )}
        </div>
      )}

      {!isExpanded && (
        <p className="text-center text-sm text-gray-500">
          Klik &quot;Tampilkan Semua&quot; untuk melihat {prayers.length} doa
        </p>
      )}
    </div>
  )
}
