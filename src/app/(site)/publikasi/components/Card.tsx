"use client"

import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMagnifyingGlassPlus, faXmark } from "@fortawesome/free-solid-svg-icons"

export default function Card() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  return (
    <>
      <div className="max-w-[320px] overflow-hidden bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300 ease-out
                      hover:shadow-xl hover:scale-105">
        <div className="group relative overflow-hidden">
          <img
            src="/images/publikasi/publikasi1.png"
            alt="Kajian Madani"
            className="h-[220px] w-full object-cover"
          />

          {/* Overlay slide up */}
          <div className="absolute inset-0 translate-y-full bg-black/40 transition-transform duration-300 group-hover:translate-y-0">
            <div className="flex h-full items-center justify-center">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="rounded-full bg-white/20 p-3 text-white backdrop-blur-sm transition hover:bg-white/30"
                aria-label="Lihat preview gambar"
              >
                <FontAwesomeIcon icon={faMagnifyingGlassPlus} className="text-2xl" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4">
          <h2 className="text-lg font-bold leading-snug text-gray-900">
            Kajian Madani Bersama Ust. Heru Kusumahadi
          </h2>

          <p className="mt-2 text-sm text-gray-600">31 Agustus 2024</p>
        </div>
      </div>

      {/* Modal Preview */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative max-h-[90vh] max-w-4xl">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(false)}
              className="absolute right-2 top-2 z-10 rounded-full bg-white p-2 text-black shadow"
              aria-label="Tutup preview"
            >
              <FontAwesomeIcon icon={faXmark} className="text-xl" />
            </button>

            <img
              src="/images/publikasi/publikasi1.png"
              alt="Preview Kajian Madani"
              className="max-h-[90vh] w-auto rounded-lg object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  )
}