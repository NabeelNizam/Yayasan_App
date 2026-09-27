import Image from 'next/image'

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-b-3xl bg-gradient-to-br from-[#0B7932] to-[#059035] pb-20 pt-16">
      {/* Decorative circles */}
      <div className="absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/4 rounded-full bg-white/10" />
      <div className="absolute -bottom-8 left-1/4 h-40 w-40 rounded-full bg-white/5" />
      <div className="absolute right-1/4 bottom-4 h-20 w-20 rounded-full bg-white/10" />

      <div className="relative z-10 mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
          {/* Text content */}
          <div className="flex-1 text-center lg:text-left">
            <p className="mb-2 text-sm font-medium uppercase tracking-wider text-white/70">
              Donasi & Infaq
            </p>
            <h1 className="mb-4 text-4xl font-bold text-white lg:text-5xl">
              Donasi Sekarang
            </h1>
            <p className="mx-auto max-w-xl text-lg leading-relaxed text-white/90 lg:mx-0">
              Hapusaluahkan sebagian harta kalian di jalan Allah. Setiap donasi Anda akan membawa manfaat besar bagi sesama.
            </p>
          </div>

          {/* Decorative illustration */}
          <div className="hidden flex-shrink-0 lg:block">
            <div className="relative h-64 w-64">
              <Image
                src="/images/gambar-masjid.svg"
                alt="Ilustrasi Sedekah"
                width={256}
                height={256}
                className="h-auto w-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
