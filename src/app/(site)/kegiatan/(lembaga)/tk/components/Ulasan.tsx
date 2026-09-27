import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faStar as faStarSolid } from "@fortawesome/free-solid-svg-icons"
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons"

export default function Ulasan() {
  const reviews = [
    {
      name: "Budi Raharjo",
      rating: 5,
      text: "TK Al-Muhajirin adalah tempat yang sangat tepat untuk anak saya. Gurunya ramah-ramah dan fasilitasnya sangat memadai. Anak saya sangat senang belajar disini.",
    },
    {
      name: "Sinta Wijaya",
      rating: 5,
      text: "Saya sangat merekomendasikan TK Al-Muhajirin. Anak saya mengalami perkembangan yang sangat pesat. Terima kasih Ibu Guru!",
    },
    {
      name: "Andini",
      rating: 4,
      text: "Fasilitasnya lengkap, tempatnya bersih. Anak-anak dibimbing dengan penuh kasih sayang. Semoga semakin sukses ke depannya.",
    },
    {
      name: "Imron",
      rating: 4,
      text: "Pendidikannya sangat bagus, guru-gurunya profesional. Fasilitas permainannya juga banyak dan aman untuk anak-anak.",
    },
  ]

  const renderStars = (rating: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FontAwesomeIcon 
          key={i} 
          icon={i <= rating ? faStarSolid : faStarRegular} 
          className="text-yellow-400 text-sm"
        />
      )
    }
    return stars
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#008DD5] mb-1">Ulasan</h2>
          <div className="flex items-center gap-2">
            <span className="font-bold text-yellow-500 text-lg">4.9/5</span>
            <span className="text-gray-500 text-sm">(120)</span>
          </div>
        </div>
        <button className="bg-green-100 text-green-700 font-semibold px-4 py-2 rounded-full text-sm hover:bg-green-200 transition-colors w-fit">
          Tinggalkan Ulasan 🌟
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map((review, index) => (
          <div key={index} className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col gap-3">
            <h3 className="font-bold text-gray-800">{review.name}</h3>
            <div className="flex gap-1">
              {renderStars(review.rating)}
            </div>
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
              &ldquo;{review.text}&rdquo;
            </p>
            <button className="text-blue-500 text-sm font-semibold mt-auto self-start hover:underline">
              Selengkapnya
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-4">
        <button className="bg-[#008DD5] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#007cbd] transition-colors">
          Muat Lebih
        </button>
        <button className="text-[#008DD5] font-semibold hover:underline">
          Lihat Semua Ulasan &gt;
        </button>
      </div>
    </div>
  )
}
