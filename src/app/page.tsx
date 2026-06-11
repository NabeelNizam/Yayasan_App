import "./globals.css"
import TentangKami from "../components/sections/TentangKami"
import HeroCarousel from "../components/sections/HeroCarousel"
import Publikasi from "../components/sections/Publikasi"
import Kegiatan from "../components/sections/Kegiatan"
import Donasi from "../components/sections/Donasi"

export default function Home() {
  return (
    <main className="cursor-default">
      <TentangKami />
      <HeroCarousel />
      <Publikasi />
      <Kegiatan />
      <Donasi />
    </main>
  )
}