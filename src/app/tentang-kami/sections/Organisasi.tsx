import Image from "next/image"
import Link from "next/link"

export default function LembagaOrganisasi() {
  return (
    <section className="w-full py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center justify-center mb-12">
          <h1 className="font-bold text-black text-3xl md:text-4xl text-center">
            Lembaga dan Organisasi Kami
          </h1>
          <div className="w-56 h-1 bg-[#0B7932] mt-3 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 place-items-center">
          <div className="flex flex-col items-center bg-white p-6 rounded-xl shadow-xl text-black w-full max-w-72 border border-gray-200 space-y-3 transition duration-300 hover:scale-105">
            <Image
              src="/images/fotbar.svg"
              alt="Takmir Masjid"
              width={128}
              height={128}
              className="w-32 h-32 rounded-full object-cover shadow-md mb-4"
            />

            <h3 className="text-lg font-bold mb-2">
              Takmir Masjid
            </h3>

            <p className="text-center text-sm leading-relaxed mb-4 text-gray-600">
              Pengelola dan pengurus masjid yang bertanggung jawab atas kegiatan
              ibadah dan pemeliharaan masjid.
            </p>

            <Link
              href="#"
              className="px-4 py-2 rounded bg-[#0B7932] text-white text-sm font-bold hover:bg-green-800 transition"
            >
              Lihat Selengkapnya
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}