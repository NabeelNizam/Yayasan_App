import Hero from "./components/Hero"
import Profil from "./components/Profil"
import Prestasi from "./components/Prestasi"
import Fasilitas from "./components/Fasilitas"
import Program from "./components/Program"
import Dokumentasi from "./components/Dokumentasi"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"

export default function TKPage() {
  return (
    <main className="min-h-screen bg-white -mt-16">
      <Navbar />
      <Hero />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-24">
        <div id="profil"><Profil /></div>
        <div id="prestasi"><Prestasi /></div>
        <div id="fasilitas"><Fasilitas /></div>
        <div id="program"><Program /></div>
        <div id="galeri"><Dokumentasi /></div>
      </div>
      <Footer />
    </main>
  )
}
