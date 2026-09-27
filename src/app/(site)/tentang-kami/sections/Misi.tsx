export default function Misi() {
    return (
        <section className="w-full py-20 px-6">
            <div className="max-w-6xl mx-auto">

                <div className="flex flex-col items-center justify-center mb-12">
                    <h1 className="font-bold text-black text-3xl md:text-4xl">
                        Misi
                    </h1>
                    <div className="w-16 h-1 bg-[#0B7932] mt-3 rounded-full" />
                </div>


                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">

                    <div className="relative flex flex-col items-center justify-center bg-green-700 p-6 rounded-xl shadow-lg text-white w-full max-w-[220px]">
                        <div className="absolute -top-5 flex items-center justify-center w-12 h-12 bg-yellow-400 rounded-full text-black font-bold text-lg shadow-md">
                            1
                        </div>
                        <p className="mt-10 text-center text-sm leading-relaxed">
                            Menyelenggarakan kegiatan dakwah dan kajian keislaman secara rutin
                            untuk meningkatkan pemahaman dan keimanan jamaah.
                        </p>
                    </div>

                    <div className="relative flex flex-col items-center justify-center bg-green-700 p-6 rounded-xl shadow-lg text-white w-full max-w-[220px]">
                        <div className="absolute -top-5 flex items-center justify-center w-12 h-12 bg-yellow-400 rounded-full text-black font-bold text-lg shadow-md">
                            2
                        </div>
                        <p className="mt-10 text-center text-sm leading-relaxed">
                            Mengembangkan program pendidikan Islam bagi anak-anak, remaja,
                            dan masyarakat umum.
                        </p>
                    </div>

                    <div className="relative flex flex-col items-center justify-center bg-green-700 p-6 rounded-xl shadow-lg text-white w-full max-w-[220px]">
                        <div className="absolute -top-5 flex items-center justify-center w-12 h-12 bg-yellow-400 rounded-full text-black font-bold text-lg shadow-md">
                            3
                        </div>
                        <p className="mt-10 text-center text-sm leading-relaxed">
                            Melaksanakan kegiatan sosial seperti santunan, bantuan kemanusiaan,
                            dan pelayanan masyarakat.
                        </p>
                    </div>

                    <div className="relative flex flex-col items-center justify-center bg-green-700 p-6 rounded-xl shadow-lg text-white w-full max-w-[220px]">
                        <div className="absolute -top-5 flex items-center justify-center w-12 h-12 bg-yellow-400 rounded-full text-black font-bold text-lg shadow-md">
                            4
                        </div>
                        <p className="mt-10 text-center text-sm leading-relaxed">
                            Membangun lingkungan yang religius, harmonis, dan mempererat
                            ukhuwah Islamiyah antar jamaah.
                        </p>
                    </div>

                </div>
            </div>
        </section>
    )
}