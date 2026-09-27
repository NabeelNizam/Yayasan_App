import Image from "next/image"

export default function Hero() {
    return (
        <section className="relative w-full h-[400px]">

            <Image
                src="/images/tentang-kami.svg"
                alt=""
                fill
                priority
                className="object-cover"
            />

            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
                <h1 className="uppercase font-bold text-5xl text-[#0B7932] mb-4">
                    <span className="text-black">PROFIL YAYASAN</span> <br /> MASJID AL-MUHAJIRN
                </h1>
            </div>

        </section>
    )
}