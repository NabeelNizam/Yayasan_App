'use client'

import ErrorFallback from '@/components/ErrorFallback'

export default function KajianError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return <ErrorFallback title="Kajian sedang tidak tersedia" onRetry={retry} />
}