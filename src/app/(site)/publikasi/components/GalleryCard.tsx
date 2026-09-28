'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlassPlus, faXmark } from '@fortawesome/free-solid-svg-icons'
import MediaImage from '@/components/MediaImage'
import type { PublikasiItem } from '@/features/publikasi/getList'

export default function GalleryCard({ item }: { item: PublikasiItem }) {
  const [open, setOpen] = useState(false)
  const src = item.imageUrl ?? '/logo.svg'

  return (
    <>
      <article className="max-w-[360px] overflow-hidden rounded-lg bg-white shadow-lg transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl">
        <div className="group relative overflow-hidden">
          <MediaImage
            src={src}
            alt={item.imageAlt || item.title}
            width={360}
            height={220}
            className="h-[220px] w-full object-cover"
          />
          <div className="absolute inset-0 translate-y-full bg-black/40 transition-transform duration-300 group-hover:translate-y-0">
            <div className="flex h-full items-center justify-center">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="rounded-full bg-white/20 p-3 text-white backdrop-blur-sm transition hover:bg-white/30"
                aria-label="Lihat preview gambar"
              >
                <FontAwesomeIcon icon={faMagnifyingGlassPlus} className="text-2xl" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4">
          <h2 className="text-lg font-bold leading-snug text-gray-900">{item.title}</h2>
          <p className="mt-2 text-sm text-gray-600">{formatDate(item.date)}</p>
        </div>
      </article>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative max-h-[90vh] max-w-4xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-2 top-2 z-10 rounded-full bg-white p-2 text-black shadow"
              aria-label="Tutup preview"
            >
              <FontAwesomeIcon icon={faXmark} className="text-xl" />
            </button>
            <MediaImage
              src={src}
              alt={item.imageAlt || item.title}
              width={1024}
              height={768}
              className="max-h-[90vh] w-auto rounded-lg object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  )
}

function formatDate(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}
