import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShieldHalved, faInfoCircle } from '@fortawesome/free-solid-svg-icons'

export default function Disclaimer() {
  return (
    <section className="py-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-start gap-4 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100">
            <FontAwesomeIcon icon={faShieldHalved} className="text-lg text-amber-600" />
          </div>
          <div>
            <h3 className="mb-1 text-sm font-semibold text-amber-800">
              Disclaimer Penting
            </h3>
            <p className="text-sm leading-relaxed text-amber-700">
              Seluruh donasi yang kami terima akan digunakan solely untuk keperluan kemanusiaan dan sosial yang sah, sesuai dengan tujuan yayasan. Kami tidak pernah menggunakan dana donasi untuk aktivitas pencucian uang, terorisme, atau kegiatan ilegal lainnya. Setiap transaksi diproses secara transparan dan dapat dipertanggungjawabkan.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
