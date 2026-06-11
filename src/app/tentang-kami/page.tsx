"use client"

import Image from "next/image"
import Hero from "./sections/Hero"
import Detail from "./sections/Detail"
import Quotes from "./sections/Quotes"
import Visi from "./sections/Visi"
import Misi from "./sections/Misi"
import Program from "./sections/Program"
import Organisasi from "./sections/Organisasi"

export default function TentangKami() {
  return (
    <section>
        <Hero />
        <Detail />
        <Quotes />
        <Visi />
        <Misi />
        <Program/>
        <Organisasi />
    </section>
  )
}