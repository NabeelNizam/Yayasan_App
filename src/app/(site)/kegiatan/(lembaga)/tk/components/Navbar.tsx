import Link from "next/link"

export default function Navbar() {
  const links = [
    { name: "PROFIL LEMBAGA", href: "#profil" },
    { name: "FASILITAS", href: "#fasilitas" },
    { name: "PRESTASI", href: "#prestasi" },
    { name: "PROGRAM", href: "#program" },
    { name: "GALERI", href: "#galeri" },
    { name: "KONTAK", href: "#kontak" },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/kegiatan/tk" className="flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-full bg-green-100 flex items-center justify-center">
                {/* Use generic icon for now if logo is not available */}
                <span className="text-xl font-bold text-green-700">TK</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold leading-tight text-[#0B7932]">TK Al-Muhajirin</span>
                <span className="text-xs text-gray-500">Bermain & Belajar</span>
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-6">
              {links.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm font-semibold text-gray-600 hover:text-[#0B7932] transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
