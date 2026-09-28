export default function Visi({ visi }: { visi?: string }) {
  const text =
    visi ||
    'Menjadi lembaga yang memberi manfaat luas bagi umat melalui dakwah, pendidikan, dan kepedulian sosial.'
  return (
    <section>
      <h1 className="mt-32 flex flex-col items-center justify-center text-3xl font-bold text-black">
        Visi
        <div className="mt-2 h-1 w-10 rounded-full bg-[#0B7932]"></div>
      </h1>
      <div className="mx-auto mb-12 mt-12 flex max-w-xl items-center justify-center rounded-lg bg-[#059035] p-8">
        <p className="text-center text-lg leading-relaxed text-white">{text}</p>
      </div>
    </section>
  )
}
