'use client'

import ErrorFallback from '@/components/ErrorFallback'

export default function DonasiError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return <ErrorFallback title="Donasi sedang tidak tersedia" onRetry={retry} />
}