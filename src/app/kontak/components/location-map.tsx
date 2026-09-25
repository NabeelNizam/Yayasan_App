import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLocationDot, faClock } from '@fortawesome/free-solid-svg-icons'

interface LocationMapSectionProps {
  mapEmbedUrl: string
}

export default function LocationMapSection({ mapEmbedUrl }: LocationMapSectionProps) {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Lokasi Kami</h2>
          <p className="text-sm text-gray-600">Kunjungi kami di lokasi berikut</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl shadow-lg">
              <iframe
                src={mapEmbedUrl}
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi Masjid Al-Muhajirin di Google Maps"
                className="w-full"
              />
            </div>
          </div>

          {/* Address Info */}
          <div className="flex flex-col gap-6">
            <div className="rounded-xl bg-white p-6 shadow-md">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#059035]/10">
                  <FontAwesomeIcon icon={faLocationDot} className="text-lg text-[#059035]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Alamat</h3>
              </div>
              <p className="text-sm leading-relaxed text-gray-600">
                Jalan Pondok Blimbing Indah Pandanwangi, Kec. Blimbing, Kota Malang, Jawa Timur 65126
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-md">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#059035]/10">
                  <FontAwesomeIcon icon={faClock} className="text-lg text-[#059035]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Jam Operasional</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex justify-between">
                  <span>Senin - Jumat</span>
                  <span className="font-medium">04.30 - 22.00 WIB</span>
                </p>
                <p className="flex justify-between">
                  <span>Sabtu - Minggu</span>
                  <span className="font-medium">04.00 - 22.00 WIB</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
