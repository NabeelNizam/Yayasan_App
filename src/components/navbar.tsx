"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const pathname = usePathname()

  const linkClass = (path: string) =>
    pathname === path ? "text-[#0B7932] font-bold" : "text-black"

  return (
    <nav className="fixed top-0 left-0 z-50 w-full bg-white shadow-md">
      <div className="mx-auto flex items-center justify-between px-6 py-3">
        <div className="flex cursor-default items-center gap-4 pl-12">
          <Link href="/" className="flex items-center gap-4">
            <img
              className="h-12 w-auto"
              src="/logo.svg"
              alt="logo yayasan"
            />
            <div className="leading-tight uppercase">
              <p className="font-bold text-[#0B7932]">Masjid Al - Muhajirin</p>
              <p className="text-sm">PBI Araya Malang</p>
            </div>
          </Link>
        </div>

        <div className="hidden items-center gap-12 pr-12 text-sm font-medium uppercase tracking-wide lg:flex">
          <Link href="/" className={linkClass("/")}>Beranda</Link>
          <Link href="/tentang-kami" className={linkClass("/tentang-kami")}>Tentang Kami</Link>
          <Link href="/publikasi" className={linkClass("/publikasi")}>Publikasi</Link>
          <Link href="/kegiatan" className={linkClass("/kegiatan")}>Kegiatan</Link>
          <Link href="/donasi" className={linkClass("/donasi")}>Donasi</Link>
          <Link href="/kontak" className={linkClass("/kontak")}>Kontak</Link>
        </div>
      </div>
    </nav>
  )
}