"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faBuildingColumns,
    faBookOpen,
    faCalendarDays,
    faChevronRight,
    faArrowRight,
    faUsers,
} from "@fortawesome/free-solid-svg-icons"

const TABS = [
    {
        key: "lembaga",
        label: "Lembaga",
        fullLabel: "Lembaga & Organisasi",
        icon: faBuildingColumns,
    },
    {
        key: "kajian",
        label: "Kajian",
        fullLabel: "Kajian Islami",
        icon: faBookOpen,
    },
    {
        key: "recap",
        label: "Recap",
        fullLabel: "Recap Kegiatan",
        icon: faCalendarDays,
    },
] as const

type TabKey = typeof TABS[number]["key"]

export default function KegiatanPage() {
    const [activeTab, setActiveTab] = useState<TabKey>("lembaga")

    const activeTabData = TABS.find((t) => t.key === activeTab)!

    return (
        <div className="font-sans">
            <Image
                src="/img/kegiatan-kami.svg"
                alt=""
                width={1600}
                height={400}
                className="absolute top-0 z-0 w-full -translate-y-2"
                priority
            />

            <div
                className="relative z-10 overflow-hidden rounded-b-2xl w-full"
                style={{ background: "#0B7932" }}
            >
                <div className="px-6 pt-8 pb-6 text-center">
                    <p className="mb-2 text-[11px] uppercase tracking-widest text-white/60">
                        Yayasan Masjid Al-Muhajirin
                    </p>

                    <h1 className="mb-1 text-2xl font-semibold text-white">
                        Publikasi &amp; Dokumentasi
                    </h1>

                    <p className="text-sm text-white/50">
                        Perkaya ilmu dan iman Anda bersama kami! Kami menghadirkan kajian-kajian mendalam yang mudah diakses, <br /> agar Anda bisa terus menuntut ilmu di mana pun dan kapan pun.
                    </p>
                </div>

                <nav
                    className="grid grid-cols-3 overflow-hidden border-t border-white/10"
                    role="tablist"
                    aria-label="Kategori konten"
                >
                    {TABS.map(({ key, label, icon }) => {
                        const isActive = activeTab === key

                        return (
                            <button
                                key={key}
                                role="tab"
                                aria-selected={isActive}
                                aria-controls={`panel-${key}`}
                                onClick={() => setActiveTab(key)}
                                className={`flex flex-col items-center justify-center gap-2 px-2 py-4 transition-all duration-300
${isActive
                                        ? "bg-[#E8F2EC] text-[#0B7932] shadow-[0_-2px_18px_rgba(0,0,0,0.08)]"
                                        : "bg-transparent text-white/65 hover:bg-white/10 hover:text-white"
                                    }`}
                            >
                                <FontAwesomeIcon icon={icon} className="text-lg" />

                                <span className="text-[11px] font-medium tracking-wide">
                                    {label}
                                </span>
                            </button>
                        )
                    })}
                </nav>
            </div>

            <div className="mx-4 mt-6 rounded-2xl bg-[#EDF5F0] p-6">
                <div className="mb-4 flex items-center gap-2 px-1 text-xs text-gray-400">
                    <span>Beranda</span>

                    <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />

                    <span className="font-medium text-gray-600">
                        {activeTabData.fullLabel}
                    </span>
                </div>

                <div
                    id={`panel-${activeTab}`}
                    role="tabpanel"
                    key={activeTab}
                >
                    {activeTab === "lembaga" && <LembagaList />}
                    {activeTab === "kajian" && <KajianList />}
                    {activeTab === "recap" && <RecapList />}
                </div>
            </div>
        </div>
    )
}

function LembagaList() {
    const organizations: any[] = [
        {
            slug: "tk",
            name: "TK Al-Muhajirin",
            category: "Pendidikan",
            hero: {
                backgroundImage: "/images/publikasi/default-publikasi.svg",
                subtitle: "Taman Kanak-Kanak dengan pendidikan karakter berlandaskan nilai-nilai Islam.",
            },
            profile: {
                image: "/images/kegiatan/icon/kajian.svg",
            },
            statistics: [
                { value: 120 } // Example 120+ Pengunjung
            ],
            activities: [1, 2, 3, 4, 5] // 5 programs
        },
        {
            slug: "takmir",
            name: "Takmir Masjid",
            category: "Operasional",
            hero: {
                backgroundImage: "/images/publikasi/default-publikasi.svg",
                subtitle: "Kegiatan operasional, kajian rutin, dan pemeliharaan Masjid Al-Muhajirin.",
            },
            profile: {
                image: "/images/kegiatan/icon/organisasi.svg",
            },
            statistics: [
                { value: 500 }
            ],
            activities: [1, 2, 3] // 3 programs
        }
    ]

    if (organizations.length === 0) {
        return (
            <div className="flex h-32 items-center justify-center text-sm text-gray-500">
                Belum ada data lembaga saat ini.
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 py-4">
            {organizations.map((org: any) => (
                <Link
                    key={org.slug}
                    href={`/kegiatan/${org.slug}`}
                    className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
                >
                    {/* Cover Banner */}
                    <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                        <Image
                            src={org.hero.backgroundImage || "/img/kegiatan-kami.svg"}
                            alt={`Banner ${org.name}`}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                    </div>

                    {/* Profile Photo */}
                    <div className="relative z-10 -mt-10 flex justify-center px-6">
                        <div className="flex h-[80px] w-[80px] items-center justify-center rounded-full border-4 border-white bg-white shadow-sm transition-transform duration-300 group-hover:scale-105">
                            <Image
                                src={org.profile?.image || "/logo.svg"}
                                alt={`Logo ${org.name}`}
                                width={80}
                                height={80}
                                className="h-full w-full rounded-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col items-center text-center px-6 pb-6 pt-3">
                        <h3 className="mb-1 text-xl font-bold text-gray-900">{org.name}</h3>
                        
                        <div className="mb-3">
                            <span className="inline-flex rounded-full bg-[#0B7932]/10 px-2.5 py-0.5 text-xs font-medium text-[#0B7932]">
                                {org.category}
                            </span>
                        </div>

                        <p className="mb-5 flex-1 text-sm leading-relaxed text-gray-600 line-clamp-2">
                            {org.hero.subtitle}
                        </p>

                        {/* Statistics Row */}
                        <div className="mb-6 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
                            {org.statistics && org.statistics.length > 0 && (
                                <div className="flex items-center gap-1.5">
                                    <FontAwesomeIcon icon={faUsers} className="text-[#0B7932]/70 text-xs" />
                                    <span>{org.statistics[0].value.toLocaleString()}+ Pengunjung</span>
                                </div>
                            )}
                            {org.activities && (
                                <div className="flex items-center gap-1.5">
                                    <FontAwesomeIcon icon={faBookOpen} className="text-[#0B7932]/70 text-xs" />
                                    <span>{org.activities.length} Program</span>
                                </div>
                            )}
                        </div>

                        {/* CTA Button */}
                        <div 
                            className="mt-auto inline-flex w-max items-center justify-center gap-2 rounded-lg bg-[#0B7932]/10 px-5 py-2.5 text-sm font-semibold text-[#0B7932] transition-all duration-300 group-hover:bg-[#0B7932] group-hover:text-white"
                        >
                            <span>Lihat Detail</span>
                            <FontAwesomeIcon 
                                icon={faArrowRight} 
                                className="text-xs transition-transform duration-300 group-hover:translate-x-1" 
                            />
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    )
}

const kajianData = [
    {
        id: "video",
        title: "Video",
        description: "Saksikan video kajian sesuai topik yang Anda suka, lalu tonton kapan pun Anda mau.",
        image: "/images/kegiatan/icon/kajian.svg", // Placeholder SVG
        ctaText: "Tonton Video",
        ctaHref: "#",
    },
    {
        id: "artikel",
        title: "Artikel",
        description: "Perkaya wawasan Anda dengan beragam artikel kajian inspiratif.",
        image: "/images/kegiatan/icon/organisasi.svg", // Placeholder SVG
        ctaText: "Baca Artikel",
        ctaHref: "#",
    },
    {
        id: "kitab",
        title: "Kitab",
        description: "Unduh dan pelajari langsung materi-materi kajian dari sumbernya.",
        image: "/images/kegiatan/icon/phbi.svg", // Placeholder SVG
        ctaText: "Jelajahi Kitab",
        ctaHref: "#",
    }
]

function KajianList() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
            {kajianData.map((item) => (
                <div
                    key={item.id}
                    className="flex w-full max-w-[380px] mx-auto flex-col items-center justify-between rounded-3xl bg-[#059035] px-8 py-12 shadow-lg transition-transform duration-300 hover:-translate-y-2 min-h-[500px]"
                >
                    <div className="flex flex-col items-center">
                        {/* Illustration */}
                        <div className="mb-10 flex h-40 w-full items-center justify-center">
                            {/* We use generic SVGs for now, user needs to replace these with actual illustrations */}
                            <Image
                                src={item.image}
                                alt={`Ilustrasi ${item.title}`}
                                width={180}
                                height={180}
                                className="h-full w-full object-contain drop-shadow-xl"
                            />
                        </div>

                        {/* Text Content */}
                        <h2 className="mb-4 text-center text-2xl font-bold text-white">
                            {item.title}
                        </h2>
                        
                        <p className="mb-10 text-center text-sm leading-relaxed text-white/90 px-2">
                            {item.description}
                        </p>
                    </div>

                    {/* CTA Button */}
                    <Link
                        href={item.ctaHref}
                        className="group inline-flex w-max items-center justify-center gap-2 rounded-xl bg-white px-7 py-3 text-sm font-bold text-[#059035] shadow-sm transition-all duration-300 hover:bg-gray-50 hover:shadow-md"
                    >
                        {item.ctaText}
                        <FontAwesomeIcon
                            icon={faArrowRight}
                            className="text-xs transition-transform duration-300 group-hover:translate-x-1"
                        />
                    </Link>
                </div>
            ))}
        </div>
    )
}

const recapData = [
    {
        id: "idul-adha-2024",
        title: "Idul Adha 1445 H Tahun 2024",
        date: "10 Juni 2024",
        description: "Perayaan Idul Adha 1445 H dengan pelaksanaan sholat eid, penyembelihan hewan qurban, dan pembagian daging qurban kepada jamaah dan masyarakat sekitar.",
        image: "/images/carousel/gambar1.jpg",
        link: "#"
    },
    {
        id: "ramadhan-2024",
        title: "Semarak Ramadhan 1445 H",
        date: "11 Maret 2024",
        description: "Kegiatan selama bulan suci Ramadhan meliputi sholat tarawih berjamaah, kajian menjelang berbuka, dan pembagian takjil gratis setiap hari.",
        image: "/images/carousel/gambar2.jpg",
        link: "#"
    }
]

function RecapList() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
            {recapData.map((item) => (
                <div 
                    key={item.id} 
                    className="flex flex-col rounded-2xl bg-white p-4 border border-gray-100 shadow-sm transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-md"
                >
                    {/* Image */}
                    <div className="relative mb-4 w-full aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
                        <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform duration-500 hover:scale-105"
                        />
                    </div>

                    {/* Title */}
                    <h3 className="mb-3 text-lg font-bold text-[#0B7932] leading-snug line-clamp-2">
                        {item.title}
                    </h3>

                    {/* Date */}
                    <div className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-gray-700">
                        <FontAwesomeIcon icon={faCalendarDays} className="text-[#0B7932]" />
                        <span>{item.date}</span>
                    </div>

                    {/* Description */}
                    <p className="mb-6 flex-1 text-sm leading-relaxed text-gray-600 line-clamp-3">
                        {item.description}
                    </p>

                    {/* Button */}
                    <Link
                        href={item.link}
                        className="group mt-auto inline-flex w-max items-center justify-center gap-2 rounded-full border border-[#0B7932] px-5 py-2 text-xs font-semibold text-[#0B7932] transition-colors duration-300 hover:bg-[#0B7932] hover:text-white"
                    >
                        <span>Selengkapnya</span>
                        <div className="flex items-center justify-center rounded-full border border-current p-0.5 w-4 h-4">
                            <FontAwesomeIcon
                                icon={faArrowRight}
                                className="text-[8px] transition-transform duration-300 group-hover:translate-x-0.5"
                            />
                        </div>
                    </Link>
                </div>
            ))}
        </div>
    )
}