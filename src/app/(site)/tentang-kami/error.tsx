'use client'

import ErrorFallback from '@/components/ErrorFallback'

export default function TentangkamiError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return <ErrorFallback title="Tentang Kami sedang tidak tersedia" onRetry={retry} />
}