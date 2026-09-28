import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import MediaImage from '@/components/MediaImage'
import type { LembagaItem } from '@/features/lembaga/getList'

export default function LembagaDirectory({ items }: { items: LembagaItem[] }) {
  if (items.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-gray-500">
        Belum ada data lembaga saat ini.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-8 py-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/kegiatan/${item.slug}`}
          className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
        >
          <div className="relative h-48 w-full overflow-hidden bg-gray-100">
            <MediaImage
              src={item.imageUrl ?? '/logo.svg'}
              alt={item.imageAlt || item.nama}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
          </div>

          <div className="flex flex-1 flex-col items-center px-6 pb-6 pt-6 text-center">
            <h3 className="mb-1 text-xl font-bold text-gray-900">{item.nama}</h3>

            {item.kategori ? (
              <div className="mb-3">
                <span className="inline-flex rounded-full bg-[#0B7932]/10 px-2.5 py-0.5 text-xs font-medium capitalize text-[#0B7932]">
                  {item.kategori}
                </span>
              </div>
            ) : null}

            <p className="mb-5 flex-1 text-sm leading-relaxed text-gray-600 line-clamp-2">
              {item.deskripsi}
            </p>

            <div className="mt-auto inline-flex w-max items-center justify-center gap-2 rounded-lg bg-[#0B7932]/10 px-5 py-2.5 text-sm font-semibold text-[#0B7932] transition-all duration-300 group-hover:bg-[#0B7932] group-hover:text-white">
              <span>Lihat Detail</span>
              <FontAwesomeIcon
                icon={faArrowRight}
                className="text-xs transition-transform duration-300 group-hover:translate-x-1"
              />
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
