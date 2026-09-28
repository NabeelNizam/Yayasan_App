'use client'

import ErrorFallback from '@/components/ErrorFallback'

export default function KegiatanError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return <ErrorFallback title="Kegiatan sedang tidak tersedia" onRetry={retry} />
}