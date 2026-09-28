const DEFAULT_MISI = [
  'Menyelenggarakan kegiatan dakwah dan kajian keislaman secara rutin untuk meningkatkan pemahaman dan keimanan jamaah.',
  'Mengembangkan program pendidikan Islam bagi anak-anak, remaja, dan masyarakat umum.',
  'Melaksanakan kegiatan sosial seperti santunan, bantuan kemanusiaan, dan pelayanan masyarakat.',
  'Membangun lingkungan yang religius, harmonis, dan mempererat ukhuwah Islamiyah antar jamaah.',
]

export default function Misi({ misi }: { misi?: string[] }) {
  const items = misi && misi.length > 0 ? misi : DEFAULT_MISI
  return (
    <section className="w-full px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold text-black md:text-4xl">Misi</h1>
          <div className="mt-3 h-1 w-16 rounded-full bg-[#0B7932]" />
        </div>

        <div className="grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map((teks, i) => (
            <div
              key={i}
              className="relative flex w-full max-w-[220px] flex-col items-center justify-center rounded-xl bg-green-700 p-6 text-white shadow-lg"
            >
              <div className="absolute -top-5 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400 text-lg font-bold text-black shadow-md">
                {i + 1}
              </div>
              <p className="mt-10 text-center text-sm leading-relaxed">{teks}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
