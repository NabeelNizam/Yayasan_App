import TentangKami from "../../components/sections/TentangKami"
import HeroCarousel from "../../components/sections/HeroCarousel"
import Publikasi from "../../components/sections/Publikasi"
import Kegiatan from "../../components/sections/Kegiatan"
import Donasi from "../../components/sections/Donasi"

export const revalidate = 300

export default function Home() {
  return (
    <main className="cursor-default">
      <h1 className="sr-only">Yayasan Al-Muhajirin</h1>
      <TentangKami />
      <HeroCarousel />
      <Publikasi />
      <Kegiatan />
      <Donasi />
    </main>
  )
}
