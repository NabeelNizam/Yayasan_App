'use client'

import ErrorFallback from '@/components/ErrorFallback'

export default function TestThrowError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return <ErrorFallback title="Data sedang diperbarui" onRetry={retry} />
}
