'use client'

import ErrorFallback from '@/components/ErrorFallback'

export default function PublikasiError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return <ErrorFallback title="Publikasi sedang tidak tersedia" onRetry={retry} />
}