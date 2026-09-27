'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import { LARGE_DONATION_WHATSAPP } from '@/types/donation'
import { formatCurrency } from '../../components/data'

interface LargeDonationDialogProps {
  isOpen: boolean
  onClose: () => void
  amount: number
}

export default function LargeDonationDialog({
  isOpen,
  onClose,
  amount,
}: LargeDonationDialogProps) {
  if (!isOpen) return null

  const whatsappLink = `https://wa.me/${LARGE_DONATION_WHATSAPP}?text=${encodeURIComponent(
    `Assalamu'alaikum Warahmatullahi Wabarakatuh,\n\nSaya ingin berdonasi sebesar ${formatCurrency(amount)}.\nMohon informasi lebih lanjut untuk proses donasi.\n\nTerima kasih.`
  )}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label="Tutup dialog"
        >
          <FontAwesomeIcon icon={faXmark} className="text-lg" />
        </button>

        <div className="p-6">
          {/* Icon */}
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <FontAwesomeIcon icon={faWhatsapp} className="text-3xl text-green-500" />
            </div>
          </div>

          {/* Title */}
          <h2 className="mb-4 text-center text-xl font-bold text-gray-900">
            Donasi Nominal Besar
          </h2>

          {/* Amount */}
          <div className="mb-6 text-center">
            <p className="text-sm text-gray-600">Nominal yang Anda masukkan:</p>
            <p className="text-2xl font-bold text-[#0B7932]">
              {formatCurrency(amount)}
            </p>
          </div>

          {/* Message */}
          <div className="mb-6 rounded-xl bg-gray-50 p-4">
            <p className="text-sm leading-relaxed text-gray-600">
              Terima kasih atas niat baik Anda.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Untuk donasi di atas Rp1.000.000 kami melakukan proses konfirmasi secara langsung agar donasi dapat diproses dengan aman, transparan, dan sesuai prosedur yayasan.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Silakan hubungi admin melalui nomor berikut:
            </p>
            <p className="mt-2 text-center font-semibold text-[#059035]">
              08xxxxxxxxxx
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg bg-green-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-600"
            >
              <FontAwesomeIcon icon={faWhatsapp} />
              Hubungi via WhatsApp
            </a>

            <button
              onClick={onClose}
              className="rounded-lg border border-gray-300 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
