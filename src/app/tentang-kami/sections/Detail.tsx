import Image from "next/image"

export default function Detail() {
    return (
        <section className="w-full py-20 px-6 bg-white">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col items-center justify-center mb-14">
                    <h1 className="font-bold text-black text-3xl md:text-4xl">
                        Tentang Kami
                    </h1>
                    <div className="w-32 h-1 bg-[#0B7932] mt-3 rounded-full" />
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-12">
                    <div className="w-full md:w-1/3">
                        <Image
                            src="/images/gambar-masjid.svg"
                            alt="Gambar Masjid Al-Muhajirin"
                            width={500}
                            height={400}
                            className="w-full h-auto
                            eager"
                        />
                    </div>

                    <div className="w-full md:w-2/3">
                        <p className="text-justify leading-relaxed text-gray-700">
                            Yayasan Masjid Al-Muhajirin merupakan lembaga keagamaan dan sosial
                            yang berkomitmen untuk menjadi pusat pembinaan umat, dakwah,
                            pendidikan, dan pelayanan masyarakat. Dengan berlandaskan nilai-nilai
                            Islam, yayasan ini hadir untuk memperkuat ukhuwah Islamiyah,
                            meningkatkan kualitas ibadah, serta memberikan manfaat nyata bagi
                            jamaah dan lingkungan sekitar.
                        </p>

                        <p className="text-justify leading-relaxed text-gray-700 mt-4">
                            Melalui berbagai kegiatan seperti kajian rutin, pendidikan
                            keislaman, santunan sosial, pembinaan generasi muda, dan program
                            kemasyarakatan lainnya, Yayasan Masjid Al-Muhajirin terus berupaya
                            menciptakan lingkungan yang religius, harmonis, dan peduli terhadap
                            sesama.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}