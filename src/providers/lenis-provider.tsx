"use client"

import { ReactLenis, useLenis } from "lenis/react"
import { usePathname } from "next/navigation"
import { useEffect, ReactNode } from "react"

export default function LenisProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const lenis = useLenis()

  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true })
    }
  }, [pathname, lenis])

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        duration: 1.3,
        smoothWheel: true,
        syncTouch: false,
        autoRaf: true,
      }}
    >
      {children}
    </ReactLenis>
  )
}
