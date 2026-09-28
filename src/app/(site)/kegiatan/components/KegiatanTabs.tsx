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
} from "@fortawesome/free-solid-svg-icons"
import LembagaDirectory from "./LembagaDirectory"
import RecapCards from "./RecapCards"
import type { LembagaItem } from "@/features/lembaga/getList"
import type { RecapItem } from "@/features/recap/getList"

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

export default function KegiatanTabs({ lembaga, recap }: { lembaga: LembagaItem[]; recap: RecapItem[] }) {
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
                    {activeTab === "lembaga" && <LembagaDirectory items={lembaga} />}
                    {activeTab === "kajian" && <KajianList />}
                    {activeTab === "recap" && <RecapCards items={recap} />}
                </div>
            </div>
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
