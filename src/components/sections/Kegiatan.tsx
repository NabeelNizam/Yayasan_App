"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRight } from "@fortawesome/free-solid-svg-icons"

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

      {/* Cards */}
      <div className="mb-12 flex flex-wrap justify-center gap-10 px-4">
        
        {/* Card 1 */}
        <div className="flex max-w-[400px] flex-col items-center space-y-3 rounded-xl bg-white px-5 py-6 shadow-lg transition-all duration-300 ease-out hover:shadow-2xl hover:scale-105">
          <h2 className="text-center text-lg font-bold">
            Lembaga & Organisasi
          </h2>
          <p className="px-2 text-center text-sm leading-relaxed text-gray-600">
            Pengelolaan berbagai lembaga & organisasi
            di bawah naungan Yayasan Al Muhajirin
          </p>
          <img
            src="images/kegiatan/icon/organisasi.svg"
            alt="Lembaga & Organisasi"
            className="h-24 w-auto"
          />
          <a
            href="#"
            className="flex items-center justify-center rounded bg-[#0B7932] px-4 py-2 text-sm font-bold text-white hover:bg-green-800"
          >
            Lihat Selengkapnya
            <FontAwesomeIcon icon={faArrowRight} className="ml-2 text-xs" />
          </a>
        </div>

        {/* Card 2 */}
        <div className="flex max-w-[400px] flex-col items-center space-y-3 rounded-xl bg-white px-5 py-6 shadow-lg transition-all duration-300 ease-out hover:shadow-2xl hover:scale-105">
          <h2 className="text-center text-lg font-bold">
            Kajian Islami
          </h2>
          <p className="px-2 text-center text-sm leading-relaxed text-gray-600">
            Pusat pembelajaran dan kajian Islam melalui berbagai media
            dan format yang mudah diakses
          </p>
          <img
            src="images/kegiatan/icon/kajian.svg"
            alt="Kajian Islami"
            className="h-24 w-auto"
          />
          <a
            href="#"
            className="flex items-center justify-center rounded bg-[#0B7932] px-4 py-2 text-sm font-bold text-white hover:bg-green-800"
          >
            Mulai Belajar
            <FontAwesomeIcon icon={faArrowRight} className="ml-2 text-xs" />
          </a>
        </div>

        {/* Card 3 */}
        <div className="flex max-w-[400px] flex-col items-center space-y-3 rounded-xl bg-white px-5 py-6 shadow-lg transition-all duration-300 ease-out hover:shadow-2xl hover:scale-105">
          <h2 className="text-center text-lg font-bold">
            PHBI
          </h2>
          <p className="px-2 text-center text-sm leading-relaxed text-gray-600">
            Dokumentasi lengkap perayaan Hari Besar Islam
            yang diselenggarakan oleh yayasan
          </p>
          <img
            src="images/kegiatan/icon/phbi.svg"
            alt="PHBI"
            className="h-24 w-auto"
          />
          <a
            href="#"
            className="flex items-center justify-center rounded bg-[#0B7932] px-4 py-2 text-sm font-bold text-white hover:bg-green-800"
          >
            Lihat Selengkapnya
            <FontAwesomeIcon icon={faArrowRight} className="ml-2 text-xs" />
          </a>
        </div>

      </div>
    </section>
  )
}