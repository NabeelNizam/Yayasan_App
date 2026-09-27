"use client"

import Image from "next/image"
import Card from "./components/Card"

export default function TentangKamiPage() {
    return (
        <>
            <Image
                src="/publikasi.svg"
                alt=""
                width={1600}
                height={400}
                className="absolute top-0 z-0 -translate-y-2"
            />

            <section className="relative cursor-default">
                <div className="relative z-10 flex min-h-[300px] -mt-4 mb-8 flex-col items-center justify-center px-4">
                    <h1 className="mb-8 text-center text-5xl font-bold uppercase text-[#0B7932]">
                        PUBLIKASI DAN DOKUMENTASI
                    </h1>

                    <p className="text-center">
                        Dokumentasi kegiatan dan momen berharga di Yayasan Masjid Al-Muhajirin
                    </p>
                </div>

                <div className="relative z-10 mx-auto mb-12 mt-8 grid max-w-6xl grid-cols-1 gap-6 px-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Card />
                </div>
            </section>
        </>
    )
}