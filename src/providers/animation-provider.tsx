"use client"

import { LazyMotion, domMax } from "framer-motion"
import { ReactNode } from "react"

export default function AnimationProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domMax} strict>
      {children}
    </LazyMotion>
  )
}
