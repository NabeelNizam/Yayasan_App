import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faBookOpen, faFilePdf, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import type { KajianItem } from '@/features/kajian/getList'

const ICON: Record<string, typeof faPlay> = {
  video: faPlay,
  artikel: faBookOpen,
  kitab: faFilePdf,
}

const LABEL: Record<string, string> = {
  video: 'Tonton Video',
  artikel: 'Baca Artikel',
  kitab: 'Buka Kitab',
}

export default function KajianList({ items }: { items: KajianItem[] }) {
  if (items.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-gray-500">
        Belum ada kajian saat ini.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 py-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex min-h-[280px] w-full max-w-[380px] flex-col justify-between rounded-3xl bg-[#059035] px-8 py-10 shadow-lg transition-transform duration-300 hover:-translate-y-2 mx-auto"
        >
          <div className="flex flex-col items-center">
            <div className="mb-6 flex h-20 w-full items-center justify-center">
              <FontAwesomeIcon
                icon={ICON[item.type] ?? faBookOpen}
                className="text-6xl text-white/90 drop-shadow-xl"
              />
            </div>
            <h2 className="mb-3 text-center text-xl font-bold text-white line-clamp-2">
              {item.title}
            </h2>
            <span className="mb-6 rounded-full bg-white/15 px-3 py-0.5 text-xs font-medium uppercase tracking-wide text-white/90">
              {item.type}
            </span>
          </div>

          <Link
            href={`/kajian/${item.slug}`}
            className="group inline-flex w-max items-center justify-center gap-2 rounded-xl bg-white px-7 py-3 text-sm font-bold text-[#059035] shadow-sm transition-all duration-300 hover:bg-gray-50 hover:shadow-md mx-auto"
          >
            {LABEL[item.type] ?? 'Buka'}
            <FontAwesomeIcon
              icon={faArrowRight}
              className="text-xs transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      ))}
    </div>
  )
}
