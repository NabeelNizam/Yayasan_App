import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#0B7932]">
        404
      </p>
      <h1 className="mb-4 text-3xl font-bold text-gray-900">
        Halaman tidak ditemukan
      </h1>
      <p className="mb-8 max-w-md text-gray-600">
        Halaman yang Anda cari mungkin sudah dipindahkan atau tidak pernah ada.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-lg bg-[#0B7932] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#09662a]"
      >
        Kembali ke Beranda
      </Link>
    </section>
  )
}
