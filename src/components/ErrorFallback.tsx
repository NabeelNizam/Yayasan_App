'use client'

/**
 * Shared client fallback rendered by per-segment error boundaries.
 * Keeps the failure local: only the affected segment degrades.
 */
export default function ErrorFallback({
  title,
  onRetry,
}: {
  title: string
  onRetry: () => void
}) {
  return (
    <section className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <h2 className="mb-3 text-xl font-bold text-gray-900">{title}</h2>
      <p className="mb-6 text-gray-600">
        Data sedang diperbarui. Silakan coba beberapa saat lagi.
      </p>
      <button
        onClick={() => onRetry()}
        className="inline-flex items-center justify-center rounded-lg bg-[#0B7932] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#09662a]"
      >
        Coba lagi
      </button>
    </section>
  )
}
