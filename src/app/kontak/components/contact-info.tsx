import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faPhone, faLocationDot } from '@fortawesome/free-solid-svg-icons'
import { ContactInfo } from './types'

interface ContactInfoCardProps {
  item: ContactInfo
}

const iconMap: Record<string, typeof faEnvelope> = {
  faEnvelope,
  faPhone,
  faLocationDot,
}

function ContactInfoCard({ item }: ContactInfoCardProps) {
  const Icon = iconMap[item.icon]

  return (
    <div className="flex h-full flex-col items-center rounded-xl bg-white p-6 text-center shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#059035]/10">
        <FontAwesomeIcon icon={Icon} className="text-2xl text-[#059035]" />
      </div>
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
        {item.title}
      </h3>
      <p className="text-sm font-medium text-gray-900">{item.value}</p>
    </div>
  )
}

interface ContactInfoSectionProps {
  items: ContactInfo[]
}

export default function ContactInfoSection({ items }: ContactInfoSectionProps) {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ContactInfoCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}
