export default function Hero() {
  return (
    <div className="relative w-full h-[500px] flex items-center justify-center overflow-hidden">
      {/* Background Image - using a placeholder color for now if image is missing */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/publikasi/default-publikasi.svg')", // Fallback
          backgroundColor: "#1B4D3E"
        }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Content */}
      <div className="relative z-10 text-center text-white px-4">
        <h2 className="text-xl md:text-2xl font-medium tracking-wider mb-4 opacity-90">
          MASJID AL-MUHAJIRIN
          <br />
          PONDOK BLIMBING INDAH
        </h2>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-wide mb-6">
          TAMAN KANAK-KANAK AL-MUHAJIRIN PBI
        </h1>
        <p className="text-lg opacity-90">
          Taman Kanak-Kanak Al-Muhajirin PBI Malang
        </p>
      </div>
    </div>
  )
}
