"use client"

import { useRef } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons"

export default function Dokumentasi() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef
      const scrollAmount = current.clientWidth / 2
      current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      })
    }
  }

  const images = [
    "/images/publikasi/default-publikasi.svg",
    "/images/publikasi/default-publikasi.svg",
    "/images/publikasi/default-publikasi.svg",
    "/images/publikasi/default-publikasi.svg",
    "/images/publikasi/default-publikasi.svg",
    "/images/publikasi/default-publikasi.svg",
  ]

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-[#008DD5] mb-2">Dokumentasi</h2>
      
      <div className="relative group">
        {/* Navigation Buttons */}
        <button 
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-[#008DD5] opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>

        <button 
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-[#008DD5] opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>

        {/* Carousel Container */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {images.map((src, index) => (
            <div 
              key={index} 
              className="min-w-[280px] sm:min-w-[300px] md:min-w-[320px] aspect-[4/3] rounded-xl overflow-hidden snap-center flex-shrink-0 bg-gray-200"
            >
              <img 
                src={src} 
                alt={`Dokumentasi ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-4">
          {images.map((_, index) => (
            <div 
              key={index}
              className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-[#008DD5]' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
