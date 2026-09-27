"use client"

import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronUp, faChevronDown, faTrophy, faCalendarAlt } from "@fortawesome/free-solid-svg-icons"

export default function Prestasi() {
  const [isOpen, setIsOpen] = useState(true)

  const prestasiList = [
    {
      title: "Juara 1 Lomba Mewarnai",
      event: "Lomba Mewarnai se-Kecamatan Lowokwaru 2023",
      date: "12 Mei 2023",
    },
    {
      title: "Juara 2 Lomba Tari Daerah",
      event: "Festival Anak Shaleh Kota Malang 2023",
      date: "15 Juni 2023",
    },
    {
      title: "Juara 3 Storytelling",
      event: "Lomba Bahasa Inggris Anak TK 2023",
      date: "20 Juli 2023",
    },
    {
      title: "Juara 1 Lomba Menyanyi",
      event: "Porseni TK tingkat Kota Malang 2023",
      date: "10 Agustus 2023",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-[#008DD5] mb-2">Prestasi</h2>
      
      <div className="border rounded-xl overflow-hidden">
        {/* Accordion Header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between bg-[#008DD5] p-4 text-white hover:bg-[#007cbd] transition-colors"
        >
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faTrophy} className="text-xl" />
            <span className="font-semibold text-lg">20 Total Prestasi yang Diraih</span>
          </div>
          <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} />
        </button>

        {/* Accordion Content */}
        {isOpen && (
          <div className="bg-white divide-y">
            {prestasiList.map((item, index) => (
              <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                <h3 className="font-bold text-gray-800 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{item.event}</p>
                <div className="flex items-center gap-2 text-xs text-[#008DD5]">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  <span>{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
