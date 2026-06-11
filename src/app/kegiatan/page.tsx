"use client"

import { useState } from "react"
import Image from "next/image"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faBuildingColumns,
    faBookOpen,
    faCalendarDays,
    faChevronRight,
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
        fullLabel: "Kajian",
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
                    <EmptyState tab={activeTab} />
                </div>
            </div>
        </div>
    )
}

function EmptyState({ tab }: { tab: TabKey }) {
    const DATA = {
        lembaga: {
            icon: faBuildingColumns,
            title: "Lembaga & Organisasi",
            desc: "Informasi struktur lembaga dan organisasi akan ditampilkan di sini.",
        },
        kajian: {
            icon: faBookOpen,
            title: "Kajian",
            desc: "Dokumentasi dan rekaman kajian ilmu agama akan tampil di sini.",
        },
        recap: {
            icon: faCalendarDays,
            title: "Recap Kegiatan",
            desc: "Rangkuman foto dan video kegiatan yang telah berlangsung.",
        },
    }

    return (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="mb-1 flex h-14 w-14 items-center justify-center rounded-full border border-gray-200 bg-gray-100">
                <FontAwesomeIcon
                    icon={DATA[tab].icon}
                    className="text-xl text-gray-500"
                />
            </div>

            <h3 className="text-base font-medium text-gray-800">
                {DATA[tab].title}
            </h3>

            <p className="max-w-xs text-sm leading-relaxed text-gray-500">
                {DATA[tab].desc}
            </p>
        </div>
    )
}