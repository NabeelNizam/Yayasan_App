"use client"

import Image from "next/image"

export default function DonasiCard() {
    return (
        <div className="flex w-[300px] flex-col overflow-hidden rounded-lg shadow-2xl">

            {/* Gambar */}
            <div className="relative h-48 w-full">
                <Image
                    src="/images/publikasi/publikasi1.png"
                    alt="Donasi"
                    fill
                    sizes="300px"
                    className="object-cover"
                />
            </div>

            {/* Konten */}
            <div className="flex flex-1 flex-col justify-between bg-white p-4">
                <div>
                    <h2 className="text-xl font-bold">Buka Bersama</h2>

                    <div className="mb-1 text-lg font-medium text-[#0B7932]">
                        Rp 123.123.123
                    </div>

                    {/* Progress */}
                    <div className="flex items-center space-x-2">
                        <div className="relative h-6 w-full rounded-full bg-gray-200">
                            <div
                                className="h-6 rounded-full bg-[#0B7932]"
                                style={{ width: "45%" }}
                            ></div>
                        </div>

                        <span className="text-sm font-semibold text-[#0B7932]">
                            45%
                        </span>
                    </div>

                    {/* Keterangan */}
                    <div className="mt-2 text-sm text-black">
                        Terkumpul Rp 123.123.123
                    </div>
                </div>
            </div>
        </div>
    )

}