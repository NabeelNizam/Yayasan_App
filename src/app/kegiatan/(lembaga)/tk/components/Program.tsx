import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPuzzlePiece, faBookQuran, faHandsPraying, faFont, faPalette } from "@fortawesome/free-solid-svg-icons"

export default function Program() {
  const programs = [
    {
      title: "Pembelajaran Calistung (Baca, Tulis, Hitung)",
      icon: faPuzzlePiece,
      color: "text-blue-500"
    },
    {
      title: "Pengenalan Huruf Hijaiyah",
      icon: faBookQuran,
      color: "text-green-600"
    },
    {
      title: "Hafalan Doa dan Surat Pendek",
      icon: faHandsPraying,
      color: "text-cyan-500"
    },
    {
      title: "Pembelajaran Bahasa Inggris Dasar",
      icon: faFont,
      color: "text-orange-500"
    },
    {
      title: "Kegiatan Seni dan Kreativitas",
      icon: faPalette,
      color: "text-red-400"
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-[#008DD5] mb-2">Program dan Kegiatan</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {programs.map((item, index) => (
          <div 
            key={index}
            className="flex flex-col items-center justify-center p-8 bg-white border rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center gap-6"
          >
            <FontAwesomeIcon icon={item.icon} className={`text-6xl ${item.color}`} />
            <h3 className="font-bold text-gray-800">{item.title}</h3>
          </div>
        ))}
      </div>
    </div>
  )
}
