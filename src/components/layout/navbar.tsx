"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons"

export default function Navbar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // List of paths where the main Navbar should be hidden
  const disabledPaths = ["/404", "/kegiatan/tk", "/kegiatan/takmir"]

  // In Next.js App Router, 404 pages might not have a specific pathname like /404, 
  // but if the user specifically asked for /404, we'll include it.
  if (disabledPaths.includes(pathname)) {
    return null
  }

  const linkClass = (path: string) =>
    pathname === path ? "text-[#0B7932] font-bold" : "text-black"

  const mobileLinkClass = (path: string) =>
    pathname === path ? "text-[#0B7932] font-bold block py-2" : "text-gray-700 block py-2 hover:text-[#0B7932]"

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  return (
    <nav className="fixed top-0 left-0 z-50 w-full bg-white shadow-md">
      <div className="mx-auto flex items-center justify-between px-6 lg:px-8 py-3">
        {/* Logo Section */}
        <div className="flex cursor-default items-center gap-4 lg:pl-10">
          <Link href="/" className="flex items-center gap-2 sm:gap-4">
            <img
              className="h-10 w-auto sm:h-12"
              src="/logo.svg"
              alt="logo yayasan"
            />
            <div className="leading-tight uppercase hidden sm:block">
              <p className="text-sm font-bold text-[#0B7932] sm:text-base">Masjid Al - Muhajirin</p>
              <p className="text-[10px] sm:text-sm">PBI Araya Malang</p>
            </div>
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden items-center gap-10 lg:pr-10 text-sm font-medium uppercase tracking-wide lg:flex">
          <Link href="/" className={linkClass("/")}>Beranda</Link>
          <Link href="/tentang-kami" className={linkClass("/tentang-kami")}>Tentang Kami</Link>
          <Link href="/publikasi" className={linkClass("/publikasi")}>Publikasi</Link>
          <Link href="/kegiatan" className={linkClass("/kegiatan")}>Kegiatan</Link>
          <Link href="/donasi" className={linkClass("/donasi")}>Donasi</Link>
          <Link href="/kontak" className={linkClass("/kontak")}>Kontak</Link>
        </div>

        {/* Mobile Hamburger Icon */}
        <div className="flex lg:hidden">
          <button 
            onClick={toggleMenu} 
            className="text-2xl text-[#0B7932] focus:outline-none"
            aria-label="Toggle menu"
          >
            <FontAwesomeIcon icon={isMobileMenuOpen ? faXmark : faBars} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white shadow-lg border-t border-gray-100 py-4 px-6">
          <div className="flex flex-col space-y-2 text-sm uppercase tracking-wide">
            <Link href="/" className={mobileLinkClass("/")} onClick={toggleMenu}>Beranda</Link>
            <Link href="/tentang-kami" className={mobileLinkClass("/tentang-kami")} onClick={toggleMenu}>Tentang Kami</Link>
            <Link href="/publikasi" className={mobileLinkClass("/publikasi")} onClick={toggleMenu}>Publikasi</Link>
            <Link href="/kegiatan" className={mobileLinkClass("/kegiatan")} onClick={toggleMenu}>Kegiatan</Link>
            <Link href="/donasi" className={mobileLinkClass("/donasi")} onClick={toggleMenu}>Donasi</Link>
            <Link href="/kontak" className={mobileLinkClass("/kontak")} onClick={toggleMenu}>Kontak</Link>
          </div>
        </div>
      )}
    </nav>
  )
}
