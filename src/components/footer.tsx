"use client"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faLocationDot,
    faPhone,
    faEnvelope,
    faGlobe,
} from '@fortawesome/free-solid-svg-icons'
import {
    faInstagram,
    faYoutube,
} from '@fortawesome/free-brands-svg-icons'

export default function Footer() {
    return (
        <footer className="bg-[#003414] w-full py-10 px-6 mt-24 cursor-default relative z-50">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 justify-items-center text-sm">

                <div>
                    <p className="font-bold text-[#FFD700] mb-3">
                        YAYASAN MASJID AL-MUHAJIRIN
                    </p>
                    <p className="text-white leading-6">
                        Yayasan Masjid Al-Muhajirin hadir sebagai wadah pembinaan iman, dakwah, dan pelayanan umat secara menyeluruh.
                    </p>
                </div>

                <div>
                    <p className="font-bold text-[#FFD700] mb-3">
                        Layanan
                    </p>
                    <ul className="space-y-2 text-white">
                        <li><a href="#">Beranda</a></li>
                        <li><a href="#">Tentang Kami</a></li>
                        <li><a href="#">Kajian</a></li>
                        <li><a href="#">Publikasi</a></li>
                        <li><a href="#">Donasi</a></li>
                        <li><a href="#">Kontak</a></li>
                    </ul>
                </div>

                <div>
                    <p className="font-bold text-[#FFD700] mb-3">
                        Kontak
                    </p>
                    <ul className="space-y-2 text-white">
                        <li className="flex items-start gap-2">
                            <FontAwesomeIcon icon={faLocationDot} className="mt-1" />
                            <span>Jalan Pondok Blimbing Indah Pandanwangi, Kec. Blimbing, Kota Malang, Jawa Timur 65126</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faPhone} />
                            <span>0341-(12345)</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faEnvelope} />
                            <span>yayasan@gmail.com</span>
                        </li>
                    </ul>
                </div>

                <div>
                    <p className="font-bold text-[#FFD700] mb-3 mr-12">
                        Media Sosial
                    </p>
                    <div className="flex flex-row gap-3 text-white">
                        <a href="#">
                            <FontAwesomeIcon icon={faInstagram} className="bg-[#0B7932] p-2 rounded-full" />
                        </a>
                        <a href="#">
                            <FontAwesomeIcon icon={faGlobe} className="bg-[#0B7932] p-2 rounded-full" />
                        </a>
                        <a href="#">
                            <FontAwesomeIcon icon={faYoutube} className="bg-[#0B7932] p-2 rounded-full" />
                        </a>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-600 mt-10 pt-4 text-center text-white text-xs">
                © 2025 Yayasan Masjid Al-Muhajirin.
            </div>
        </footer>
    )
}