'use client'

import Image, { type ImageProps } from 'next/image'
import { useState } from 'react'

const PLACEHOLDER = '/logo.svg'

type Props = Omit<ImageProps, 'onError'> & { fallbackSrc?: string }

/**
 * next/image wrapper that swaps to a placeholder when the source fails to
 * load, so a missing/broken media URL never breaks the page (Plan 2 Task 8).
 * Works for plain URLs and Payload-hosted media (remotePatterns).
 */
export default function MediaImage({ src, fallbackSrc = PLACEHOLDER, alt, ...rest }: Props) {
  const [failed, setFailed] = useState(false)
  const resolved = failed ? fallbackSrc : src

  return (
    <Image
      {...rest}
      src={resolved}
      alt={alt}
      onError={() => setFailed(true)}
    />
  )
}
