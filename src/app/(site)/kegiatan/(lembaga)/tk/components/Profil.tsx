export default function Profil() {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-[#008DD5] mb-4">Profil Lembaga</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
          {/* Placeholder for the group photo */}
          <div className="absolute inset-0 bg-gray-200">
            <img 
              src="/images/kegiatan/icon/organisasi.svg" 
              alt="Profil TK"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="text-sm text-gray-700 leading-relaxed space-y-4">
          <p>
            TK Al-Muhajirin adalah lembaga pendidikan pra-sekolah di bawah naungan Yayasan Al-Muhajirin.
            Kami berkomitmen memberikan pendidikan usia dini yang berkualitas, mengintegrasikan nilai-nilai
            agama Islam dengan kurikulum modern. Dengan fasilitas yang lengkap dan tenaga pengajar yang
            berpengalaman, kami siap membantu buah hati Anda tumbuh menjadi generasi cerdas, beriman, dan
            berakhlak mulia. Kami senantiasa berupaya menciptakan lingkungan bermain dan belajar yang
            aman, nyaman, dan menyenangkan bagi setiap anak.
          </p>
        </div>
      </div>
    </div>
  )
}
