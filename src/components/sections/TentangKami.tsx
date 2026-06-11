export default function TentangKami() {
    return (
        <section className="relative overflow-hidden min-h-screen flex items-center justify-center">
            <img
                src="/images/tentangKami/masjid.svg"
                alt="Ilustrasi masjid"
                className="absolute inset-0 w-full h-full object-cover z-0"
            />
            <div className="absolute inset-0 bg-white/70 z-0"></div>

            <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center max-w-4xl">

                <img
                    src="/images/tentangKami/logo.svg"
                    alt="Logo Masjid Al-Muhajirin"
                    className="w-full max-w-xs h-32 pb-4"
                />

                <h1 className="uppercase font-bold text-4xl md:text-5xl text-black mb-6">
                    Selamat datang di{" "}
                    <span className="text-[#0B7932]">Masjid Al - Muhajirin</span>
                </h1>

                <p className="max-w-2xl mb-10 text-gray-700">
                    Yayasan Masjid Al-Muhajirin hadir sebagai wadah pembinaan iman,
                    dakwah, dan pelayanan umat secara menyeluruh.
                </p>

                <div className="flex flex-wrap justify-center gap-6">
                    <a
                        href="#kontak"
                        className="w-56 h-14 flex items-center justify-center border border-[#0B7932] rounded bg-white/30 backdrop-blur text-[#0B7932] font-bold transition hover:shadow-lg"
                    >
                        Hubungi Kami
                    </a>

                    <a
                        href="/tentang-kami"
                        className="w-56 h-14 flex items-center justify-center gap-x-3 bg-[#0B7932] text-white rounded border border-[#0B7932] font-bold shadow transition hover:bg-green-800 hover:shadow-lg"
                    >
                        Tentang Kami
                        <img
                            src="/images/tentangKami/Right circle.svg"
                            alt="Ikon panah"
                            className="h-6 w-auto"
                        />
                    </a>
                </div>

            </div>
        </section>
    )
}