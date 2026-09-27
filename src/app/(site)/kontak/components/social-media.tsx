import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInstagram, faYoutube, IconDefinition } from '@fortawesome/free-brands-svg-icons'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { SocialLink } from './types'

interface SocialCardProps {
  item: SocialLink
}

const iconMap: Record<string, IconDefinition> = {
  faInstagram,
  faYoutube,
}

function SocialCard({ item }: SocialCardProps) {
  const Icon = iconMap[item.icon]

  return (
    <div className="flex h-full flex-col items-center rounded-xl bg-white p-6 text-center shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:items-start sm:text-left">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#0B7932] to-[#059035]">
        <FontAwesomeIcon icon={Icon} className="text-3xl text-white" />
      </div>

      <h3 className="mb-2 text-xl font-bold text-gray-900">{item.platform}</h3>

      <p className="mb-6 flex-grow text-sm leading-relaxed text-gray-600">
        {item.description}
      </p>

      <Link
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-lg bg-[#0B7932] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#059035]"
      >
        Kunjungi
        <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
      </Link>
    </div>
  )
}

interface SocialMediaSectionProps {
  items: SocialLink[]
}

export default function SocialMediaSection({ items }: SocialMediaSectionProps) {
  return (
    <section className="bg-gray-50 py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Media Sosial</h2>
          <p className="text-sm text-gray-600">Ikuti kami di media sosial untuk informasi terkini</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {items.map((item) => (
            <SocialCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}
