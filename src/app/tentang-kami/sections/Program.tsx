import Image from "next/image"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faBookOpen,
    faUsers,
    faHeart,
    faChild,
    faHandHoldingHeart,
    faCalendarDays,
} from "@fortawesome/free-solid-svg-icons"

export default function ProgramUnggulan() {
    const programs = [
        {
            title: "Kajian Subuh Rutin",
            schedule: "Setiap hari, 05.30 - 06.30 WIB",
            desc: "Kajian keislaman setelah shalat Subuh dengan materi tafsir, hadits, fiqih, dan akhlak.",
            image: "/images/publikasi/publikasi1.png",
            icon: faBookOpen,
        },
        {
            title: "TPQ Anak",
            schedule: "Senin - Jumat",
            desc: "Pembelajaran membaca Al-Qur’an, hafalan surat pendek, doa harian, dan adab Islami.",
            image: "/images/publikasi/publikasi1.png",
            icon: faChild,
        },
        {
            title: "Santunan Sosial",
            schedule: "Program berkala",
            desc: "Kegiatan kepedulian sosial untuk membantu anak yatim, dhuafa, dan masyarakat sekitar.",
            image: "/images/publikasi/publikasi1.png",
            icon: faHandHoldingHeart,
        },
        {
            title: "Majelis Taklim",
            schedule: "Setiap pekan",
            desc: "Pembinaan keislaman untuk jamaah melalui kajian tematik dan diskusi keagamaan.",
            image: "/images/publikasi/publikasi1.png",
            icon: faUsers,
        },
        {
            title: "Kegiatan Ramadhan",
            schedule: "Bulan Ramadhan",
            desc: "Program ibadah dan sosial seperti buka bersama, tarawih, tadarus, dan zakat fitrah.",
            image: "/images/publikasi/publikasi1.png",
            icon: faHeart,
        },
    ]

    return (
        <section className="w-full py-24 px-6 bg-gradient-to-b from-white to-green-50">
            <div className="max-w-7xl mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-14">
                    <h1 className="font-bold text-3xl md:text-5xl text-gray-900 mb-5">
                        Program Unggulan <br />Masjid Al-Muhajirin
                    </h1>

                    <div className="w-24 h-1 bg-[#0B7932] mx-auto rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {programs.map((program, index) => (
                        <div
                            key={index}
                            className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-green-100 hover:shadow-xl transition-all duration-300"
                        >
                            <div className="relative h-56 overflow-hidden">
                                <Image
                                    src={program.image}
                                    alt={program.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />

                                <div className="absolute top-4 left-4 flex items-center justify-center w-12 h-12 bg-[#0B7932] text-white rounded-2xl shadow-lg">
                                    <FontAwesomeIcon icon={program.icon} />
                                </div>
                            </div>

                            <div className="p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-3">
                                    {program.title}
                                </h2>

                                <p className="text-gray-600 text-sm leading-relaxed mb-5">
                                    {program.desc}
                                </p>

                                <div className="flex items-center gap-2 text-sm text-[#0B7932] font-semibold">
                                    <FontAwesomeIcon icon={faCalendarDays} />
                                    <span>{program.schedule}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}