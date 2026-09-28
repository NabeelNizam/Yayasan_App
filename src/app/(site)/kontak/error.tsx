'use client'

import ErrorFallback from '@/components/ErrorFallback'

export default function KontakError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return <ErrorFallback title="Kontak sedang tidak tersedia" onRetry={retry} />
}