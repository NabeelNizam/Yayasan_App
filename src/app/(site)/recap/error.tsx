'use client'

import ErrorFallback from '@/components/ErrorFallback'

export default function RecapError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return <ErrorFallback title="Rekap PHBI sedang tidak tersedia" onRetry={retry} />
}