'use client'

import { useState, useEffect, FormEvent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar, faPaperPlane, faCheck } from '@fortawesome/free-solid-svg-icons'
import {
  DonationFormData,
  DonationValidationErrors,
  QUICK_AMOUNTS,
  DONATION_LIMITS,
  LARGE_DONATION_WHATSAPP,
} from '@/types/donation'
import { formatCurrency } from '../../components/data'
import LargeDonationDialog from './large-donation-dialog'

interface DonationFormProps {
  campaignSlug: string
  campaignTitle: string
}

export default function DonationForm({ campaignSlug, campaignTitle }: DonationFormProps) {
  const [formData, setFormData] = useState<DonationFormData>({
    donorName: '',
    isAnonymous: false,
    whatsapp: '',
    email: '',
    amount: 0,
    prayer: '',
  })
  const [errors, setErrors] = useState<DonationValidationErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showLargeDialog, setShowLargeDialog] = useState(false)
  const [midtransLoaded, setMidtransLoaded] = useState(false)

  // Load Midtrans Snap script
  useEffect(() => {
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
    if (!clientKey) return

    const script = document.createElement('script')
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js'
    script.setAttribute('data-client-key', clientKey)
    script.onload = () => setMidtransLoaded(true)
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  // Client-side validation
  const validateForm = (): boolean => {
    const newErrors: DonationValidationErrors = {}

    if (!formData.donorName.trim() && !formData.isAnonymous) {
      newErrors.donorName = 'Nama wajib diisi'
    }

    const whatsappRegex = /^(\+62|62|0)[0-9]{9,12}$/
    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = 'Nomor WhatsApp wajib diisi'
    } else if (!whatsappRegex.test(formData.whatsapp.replace(/[\s-]/g, ''))) {
      newErrors.whatsapp = 'Format nomor WhatsApp tidak valid'
    }

    if (formData.email?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Format email tidak valid'
      }
    }

    if (formData.amount < DONATION_LIMITS.MIN) {
      newErrors.amount = `Donasi minimal ${formatCurrency(DONATION_LIMITS.MIN)}`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle quick amount selection
  const handleQuickAmount = (amount: number) => {
    setFormData((prev) => ({ ...prev, amount }))
    setErrors((prev) => ({ ...prev, amount: undefined }))
  }

  // Handle custom amount input
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    const amount = parseInt(value) || 0
    setFormData((prev) => ({ ...prev, amount }))
    setErrors((prev) => ({ ...prev, amount: undefined }))
  }

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    // Check for large donation (client-side check)
    if (formData.amount > DONATION_LIMITS.MAX) {
      setShowLargeDialog(true)
      return
    }

    await processDonation()
  }

  // Process donation with Midtrans
  const processDonation = async () => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/donasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignSlug,
          ...formData,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        setErrors({ amount: result.error || 'Gagal memproses donasi' })
        setIsSubmitting(false)
        return
      }

      // Open Midtrans Snap
      if (result.token && window.snap) {
        window.snap.pay(result.token, {
          onSuccess: () => {
            setSubmitted(true)
          },
          onPending: () => {
            setSubmitted(true)
          },
          onError: () => {
            setErrors({ amount: 'Pembayaran gagal' })
          },
          onClose: () => {
            // User closed Snap popup
          },
        })
      }
    } catch (error) {
      console.error('Error processing donation:', error)
      setErrors({ amount: 'Terjadi kesalahan sistem' })
    }

    setIsSubmitting(false)
  }

  // Reset form
  const resetForm = () => {
    setSubmitted(false)
    setFormData({
      donorName: '',
      isAnonymous: false,
      whatsapp: '',
      email: '',
      amount: 0,
      prayer: '',
    })
    setErrors({})
  }

  return (
    <>
      <section className="rounded-2xl bg-white p-6 shadow-lg" id="donasi-form">
        <div className="mb-6">
          <h2 className="mb-1 text-xl font-bold text-gray-900">Form Donasi</h2>
          <p className="text-sm text-gray-600">Lengkapi form di bawah untuk berdonasi</p>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <FontAwesomeIcon icon={faCheck} className="text-2xl text-green-600" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">
              Donasi sedang diproses!
            </h3>
            <p className="mb-6 text-sm text-gray-600">
              Silakan selesaikan pembayaran melalui popup Midtrans yang muncul.
            </p>
            <button
              onClick={resetForm}
              className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Donasi Lagi
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label htmlFor="donorName" className="mb-2 block text-sm font-medium text-gray-700">
                Nama Lengkap {!formData.isAnonymous && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                id="donorName"
                value={formData.donorName}
                onChange={(e) => setFormData((prev) => ({ ...prev, donorName: e.target.value }))}
                disabled={formData.isAnonymous}
                className={`w-full rounded-lg border px-4 py-3 text-sm transition focus:outline-none focus:ring-2 ${
                  errors.donorName
                    ? 'border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:border-[#059035] focus:ring-[#059035]/20 disabled:bg-gray-100 disabled:opacity-60'
                }`}
                placeholder="Masukkan nama lengkap Anda"
              />
              {errors.donorName && (
                <p className="mt-1 text-xs text-red-500">{errors.donorName}</p>
              )}
            </div>

            {/* Anonymous Toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={formData.isAnonymous}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, isAnonymous: !prev.isAnonymous }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.isAnonymous ? 'bg-[#059035]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.isAnonymous ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <label className="text-sm text-gray-700">
                Donasi secara anonim (nama tidak ditampilkan)
              </label>
            </div>

            {/* WhatsApp Field */}
            <div>
              <label htmlFor="whatsapp" className="mb-2 block text-sm font-medium text-gray-700">
                Nomor WhatsApp <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="whatsapp"
                value={formData.whatsapp}
                onChange={(e) => setFormData((prev) => ({ ...prev, whatsapp: e.target.value }))}
                className={`w-full rounded-lg border px-4 py-3 text-sm transition focus:outline-none focus:ring-2 ${
                  errors.whatsapp
                    ? 'border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:border-[#059035] focus:ring-[#059035]/20'
                }`}
                placeholder="08xxxxxxxxxx"
              />
              {errors.whatsapp && (
                <p className="mt-1 text-xs text-red-500">{errors.whatsapp}</p>
              )}
            </div>

            {/* Email Field (Optional) */}
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                Email <span className="text-gray-400">(opsional)</span>
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className={`w-full rounded-lg border px-4 py-3 text-sm transition focus:outline-none focus:ring-2 ${
                  errors.email
                    ? 'border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:border-[#059035] focus:ring-[#059035]/20'
                }`}
                placeholder="email@contoh.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Amount Selection */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Pilih Nominal <span className="text-red-500">*</span>
              </label>

              {/* Quick Amount Buttons */}
              <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {QUICK_AMOUNTS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => handleQuickAmount(item.value)}
                    className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                      formData.amount === item.value
                        ? 'border-[#059035] bg-[#059035]/10 text-[#059035]'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Custom Amount Input */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  Rp
                </span>
                <input
                  type="text"
                  value={formData.amount ? formData.amount.toLocaleString('id-ID') : ''}
                  onChange={handleAmountChange}
                  className={`w-full rounded-lg border py-3 pl-10 pr-4 text-sm transition focus:outline-none focus:ring-2 ${
                    errors.amount
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:border-[#059035] focus:ring-[#059035]/20'
                  }`}
                  placeholder="Masukkan nominal donasi"
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-xs text-red-500">{errors.amount}</p>
              )}
              {formData.amount > 0 && formData.amount < DONATION_LIMITS.MIN && (
                <p className="mt-1 text-xs text-amber-600">
                  Minimal donasi: {formatCurrency(DONATION_LIMITS.MIN)}
                </p>
              )}
            </div>

            {/* Prayer/Message Field (Optional) */}
            <div>
              <label htmlFor="prayer" className="mb-2 block text-sm font-medium text-gray-700">
                Doa / Pesan <span className="text-gray-400">(opsional)</span>
              </label>
              <textarea
                id="prayer"
                value={formData.prayer}
                onChange={(e) => setFormData((prev) => ({ ...prev, prayer: e.target.value }))}
                rows={3}
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm transition focus:border-[#059035] focus:outline-none focus:ring-2 focus:ring-[#059035]/20"
                placeholder="Tuliskan doa atau pesan kebaikan Anda..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                isSubmitting ||
                formData.amount < DONATION_LIMITS.MIN ||
                !formData.whatsapp
              }
              className="w-full rounded-lg bg-[#0B7932] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#059035] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Memproses...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <FontAwesomeIcon icon={faPaperPlane} />
                  Donasi Sekarang
                </span>
              )}
            </button>

            <p className="text-center text-xs text-gray-500">
              Pembayaran aman melalui Midtrans
            </p>
          </form>
        )}
      </section>

      {/* Large Donation Dialog */}
      <LargeDonationDialog
        isOpen={showLargeDialog}
        onClose={() => setShowLargeDialog(false)}
        amount={formData.amount}
      />
    </>
  )
}

// Extend window interface for Snap
declare global {
  interface Window {
    snap: {
      pay: (token: string, options: {
        onSuccess?: () => void
        onPending?: () => void
        onError?: () => void
        onClose?: () => void
      }) => void
    }
  }
}
