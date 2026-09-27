'use client'

import { useState, FormEvent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar, faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { FeedbackFormData } from './types'

export default function FeedbackForm() {
  const [formData, setFormData] = useState<FeedbackFormData>({
    name: '',
    isAnonymous: false,
    rating: 0,
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    setSubmitted(true)

    // Reset form after showing success message
    setTimeout(() => {
      setSubmitted(false)
      setFormData({
        name: '',
        isAnonymous: false,
        rating: 0,
        message: '',
      })
    }, 3000)
  }

  const handleRating = (value: number) => {
    setFormData((prev) => ({ ...prev, rating: value }))
  }

  return (
    <section className="bg-gray-50 py-12" id="kritik-saran">
      <div className="mx-auto max-w-2xl px-4">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Kritik & Saran</h2>
          <p className="text-sm text-gray-600">
            Kirimkan kritik dan saran Anda untuk membantu kami meningkatkan kualitas layanan
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-lg sm:p-8">
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <FontAwesomeIcon icon={faPaperPlane} className="text-2xl text-green-600" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">Terima Kasih!</h3>
              <p className="text-gray-600">
                Kritik dan saran Anda telah kami terima. Terima kasih atas partisipasi Anda.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Field */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Nama
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  disabled={formData.isAnonymous}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition focus:border-[#059035] focus:outline-none focus:ring-2 focus:ring-[#059035]/20 disabled:bg-gray-100 disabled:opacity-60"
                  placeholder="Masukkan nama Anda"
                />
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
                  Kirim secara anonim
                </label>
              </div>

              {/* Rating Field */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Rating
                </label>
                <div className="flex gap-2" role="radiogroup" aria-label="Pilih rating">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={formData.rating === value}
                      onClick={() => handleRating(value)}
                      className="rounded p-1 transition hover:bg-gray-100"
                    >
                      <FontAwesomeIcon
                        icon={faStar}
                        className={`text-2xl transition-colors ${
                          value <= formData.rating
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Field */}
              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Pesan
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, message: e.target.value }))
                  }
                  rows={5}
                  required
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm transition focus:border-[#059035] focus:outline-none focus:ring-2 focus:ring-[#059035]/20"
                  placeholder="Tuliskan kritik dan saran Anda di sini..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || formData.rating === 0 || !formData.message}
                className="w-full rounded-lg bg-[#0B7932] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#059035] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
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
                    Mengirim...
                  </span>
                ) : (
                  'Kirim Kritik & Saran'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
