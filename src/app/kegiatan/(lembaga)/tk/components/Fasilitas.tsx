import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChalkboardTeacher, faChild, faBookOpen, faShower, faNotesMedical } from "@fortawesome/free-solid-svg-icons"

export default function Fasilitas() {
  const fasilitas = [
    {
      title: "Ruang Kelas Nyaman",
      desc: "Ruang belajar dengan pendingin ruangan dan luas",
      icon: faChalkboardTeacher,
      color: "text-blue-500"
    },
    {
      title: "Playground",
      desc: "Taman bermain anak-anak yang luas dan aman",
      icon: faChild,
      color: "text-orange-500"
    },
    {
      title: "Perpustakaan Mini",
      desc: "Koleksi buku cerita anak-anak dan buku edukasi",
      icon: faBookOpen,
      color: "text-red-500"
    },
    {
      title: "Kamar Mandi Bersih",
      desc: "Kamar mandi yang bersih dan aman untuk anak-anak",
      icon: faShower,
      color: "text-cyan-500"
    },
    {
      title: "UKS",
      desc: "Unit Kesehatan Sekolah siap tanggap darurat ringan",
      icon: faNotesMedical,
      color: "text-red-600"
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-[#008DD5] mb-2">Fasilitas</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {fasilitas.map((item, index) => (
          <div 
            key={index}
            className="flex flex-col items-center justify-center p-8 bg-white border rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center gap-4"
          >
            <FontAwesomeIcon icon={item.icon} className={`text-6xl ${item.color}`} />
            <div>
              <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
