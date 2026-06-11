"use client"

import DonasiCard from "../sections/DonasiCard"

export default function Donasi() {
    return (
        <section className="flex flex-col items-center justify-center gap-16 p-8 md:flex-row">

            {/* Kiri - Teks */}
            <div className="flex flex-col items-center gap-4 text-center">
                <h1 className="max-w-[600px] text-3xl font-bold">
                    Mari Bergandengan Tangan, <br />Tebar Kebaikan Bersama.
                </h1>

                <p className="max-w-[700px]">
                    Ada banyak saudara kita yang menanti uluran tangan. Bersama Yayasan Masjid
                    Al-Muhajirin, mari jadikan rezeki sebagai jalan keberkahan untuk sesama.
                </p>

                <a
                    href="#"
                    className="flex h-16 w-56 items-center justify-center gap-x-4 rounded border border-[#0B7932] bg-[#0B7932] font-bold text-white shadow-md hover:bg-green-800"
                >
                    Donasi Sekarang
                </a>
            </div>

            {/* Kanan - Card */}
            <DonasiCard />
        </section>
    )
}