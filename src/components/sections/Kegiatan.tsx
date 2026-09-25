"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRight } from "@fortawesome/free-solid-svg-icons"
import Link from "next/link"

interface InstitutionCard {
  title: string
  description: string
  logoImage: string
  ctaLabel: string
  ctaHref: string
}

const institutions: InstitutionCard[] = [
  {
    title: "Takmir Masjid",
    description: "Kegiatan operasional, kajian rutin, dan pemeliharaan Masjid Al-Muhajirin",
    logoImage: "/images/kegiatan/icon/organisasi.svg",
    ctaLabel: "Lihat Selengkapnya",
    ctaHref: "/kegiatan/takmir",
  },
  {
    title: "TK Al-Muhajirin",
    description: "Taman Kanak-Kanak dengan pendidikan karakter berlandaskan nilai-nilai Islam",
    logoImage: "/images/kegiatan/icon/kajian.svg",
    ctaLabel: "Lihat Selengkapnya",
    ctaHref: "/kegiatan/tk",
  },
  {
    title: "Lembaga & Organisasi",
    description:
      "Pengelolaan dan koordinasi berbagai unit lembaga & organisasi di bawah naungan Yayasan Al Muhajirin",
    logoImage: "/images/kegiatan/icon/organisasi.svg",
    ctaLabel: "Lihat Selengkapnya",
    ctaHref: "#",
  },
  {
    title: "Kajian Islami",
    description:
      "Pusat pembelajaran dan kajian Islam melalui berbagai media dan format yang mudah diakses",
    logoImage: "/images/kegiatan/icon/kajian.svg",
    ctaLabel: "Mulai Belajar",
    ctaHref: "#",
  },
  {
    title: "Recap PHBI",
    description:
      "Dokumentasi lengkap perayaan Hari Besar Islam yang diselenggarakan oleh yayasan",
    logoImage: "/images/kegiatan/icon/phbi.svg",
    ctaLabel: "Lihat Selengkapnya",
    ctaHref: "#",
  },
]

function InstitutionProfileCard({ card }: { card: InstitutionCard }) {
  return (
    <div
      className="flex w-full max-w-[380px] flex-col items-center overflow-hidden rounded-2xl bg-white px-8 py-10 shadow-lg"
    >
      {/* Title */}
      <h2 className="mb-4 text-center text-xl font-bold text-gray-900">
        {card.title}
      </h2>

      {/* Description */}
      <p className="mb-8 text-center text-sm leading-relaxed text-gray-600 line-clamp-3 min-h-[60px]">
        {card.description}
      </p>

      {/* Large Illustration */}
      <div className="mb-10 flex h-40 w-full items-center justify-center">
        <img
          src={card.logoImage}
          alt={`Ilustrasi ${card.title}`}
          className="h-full w-full object-contain"
        />
      </div>

      {/* CTA Button */}
      <Link
        href={card.ctaHref}
        className="group mt-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#0B7932] px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#09662a]"
      >
        {card.ctaLabel}
        <FontAwesomeIcon
          icon={faArrowRight}
          className="text-sm transition-transform duration-300 group-hover:translate-x-1"
        />
      </Link>
    </div>
  )
}

export default function Kegiatan() {
  return (
    <section className="flex w-full flex-col bg-[#059035]">
      {/* Judul */}
      <div className="mx-auto max-w-[900px] px-4 py-12 text-center text-white">
        <h1 className="mb-4 text-3xl font-bold">
          Seluruh Kegiatan Kami, Untuk Kemaslahatan Umat
        </h1>
        <p className="leading-relaxed">
          Yayasan Masjid Al-Muhajirin terus bergerak aktif dalam menebar manfaat.
          Melalui berbagai kegiatan keagamaan, sosial, dan pendidikan,
          kami hadir sebagai jembatan bagi Anda untuk berpartisipasi dan berkontribusi.
        </p>
      </div>

      {/* Institution Profile Cards */}
      <div className="mx-auto mb-16 grid max-w-[1200px] grid-cols-1 gap-6 px-4 md:grid-cols-2 lg:grid-cols-3">
        {institutions.map((card) => (
          <InstitutionProfileCard key={card.title} card={card} />
        ))}
      </div>
    </section>
  )
}