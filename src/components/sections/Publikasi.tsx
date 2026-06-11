"use client"

import Card from "../sections/Card"

export default function Publikasi() {
    return (
        <section className="overflow-hidden min-h-screen flex flex-col items-center justify-center">
            <div className="max-w-[800px] text-center mb-8">
                <h1 className="text-3xl font-bold mb-4">Kegiatan Kami, Untuk Umat dan Akhirat</h1>
                <p>Setiap kegiatan yang kami lakukan adalah wujud kepedulian dan amanah dari umat.
                    Semuanya kami jalankan demi kebermanfaatan hidup di dunia dan pahala yang terus mengalir hingga akhirat.
                </p>
            </div>

            <div className="max-w-[300px]">
                <Card />
            </div>

            <a href="#" className="w-56 h-16 flex items-center justify-center gap-x-4 mt-12
                      bg-[#0B7932] text-white rounded border border-[#0B7932] font-bold
                      shadow-md transition-all duration-300 ease-out
                      hover:bg-green-800 hover:shadow-xl hover:scale-105">
                Lihat Lebih Banyak
                <img src="images/tentangKami/Right circle.svg" alt="" className="h-8 w-auto"/>
            </a>
        </section>
    )

}