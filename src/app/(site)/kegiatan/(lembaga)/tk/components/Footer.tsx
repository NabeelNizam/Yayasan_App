import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faLocationDot, faEnvelope, faPhone, faClock } from "@fortawesome/free-solid-svg-icons"
import { faInstagram } from "@fortawesome/free-brands-svg-icons"

export default function Footer() {
  return (
    <footer id="kontak" className="w-full">
      {/* Detail Kontak & Hubungi Kami Sections */}
      <div className="bg-[#008DD5] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* Detail Kontak */}
            <div>
              <h3 className="font-bold text-xl mb-4 text-[#FFD700]">Detail Kontak</h3>
              <div className="flex items-start gap-3">
                <FontAwesomeIcon icon={faLocationDot} className="mt-1 flex-shrink-0" />
                <p className="leading-relaxed">
                  Jl. Pondok Blimbing Indah Pandanwangi, Kec. Blimbing, Kota Malang, Jawa Timur 65126
                </p>
              </div>
            </div>

            {/* Hubungi Kami */}
            <div>
              <h3 className="font-bold text-xl mb-4 text-[#FFD700]">Hubungi Kami</h3>
              <p className="mb-6 opacity-90">
                Silahkan hubungi kami melalui media dibawah untuk info lebih lanjut.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faEnvelope} className="w-5" />
                  <span>tkalmuhajirin@gmail.com</span>
                </li>
                <li className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faInstagram} className="w-5" />
                  <span>@tk.almuhajirin</span>
                </li>
                <li className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faPhone} className="w-5" />
                  <span>+628123456789</span>
                </li>
                <li className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faClock} className="w-5" />
                  <span>Senin - Jumat: 07.30 - 10.30 WIB</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-[#005e8e] py-4 text-center text-white text-sm">
        © 2025 Yayasan Masjid Al-Muhajirin.
      </div>
    </footer>
  )
}
