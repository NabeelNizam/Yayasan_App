import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarDays, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import MediaImage from '@/components/MediaImage'
import Link from 'next/link'
import type { RecapItem } from '@/features/recap/getList'

export default function RecapCards({ items }: { items: RecapItem[] }) {
  if (items.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-gray-500">
        Belum ada rekap kegiatan saat ini.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 py-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <article
          key={item.id}
          className="flex flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-md"
        >
          <div className="relative mb-4 aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100">
            <MediaImage
              src={item.imageUrl ?? '/logo.svg'}
              alt={item.event}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>

          <h3 className="mb-3 text-lg font-bold leading-snug text-[#0B7932] line-clamp-2">
            {item.event}
          </h3>

          {item.date || item.year ? (
            <div className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-gray-700">
              <FontAwesomeIcon icon={faCalendarDays} className="text-[#0B7932]" />
              <span>{[item.date, item.year].filter(Boolean).join(' · ')}</span>
            </div>
          ) : null}

          <p className="mb-6 flex-1 text-sm leading-relaxed text-gray-600 line-clamp-3">
            {item.description}
          </p>

          <Link
            href="/kegiatan"
            className="group mt-auto inline-flex w-max items-center justify-center gap-2 rounded-full border border-[#0B7932] px-5 py-2 text-xs font-semibold text-[#0B7932] transition-colors duration-300 hover:bg-[#0B7932] hover:text-white"
          >
            <span>Selengkapnya</span>
            <FontAwesomeIcon
              icon={faArrowRight}
              className="text-[8px] transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </Link>
        </article>
      ))}
    </div>
  )
}
