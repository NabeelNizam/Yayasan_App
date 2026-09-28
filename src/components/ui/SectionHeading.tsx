export default function SectionHeading({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <div className="mb-8 text-center">
      <h2 className="mb-2 text-2xl font-bold text-gray-900">{title}</h2>
      <div className="mx-auto mb-3 h-1 w-16 rounded-full bg-[#0B7932]" />
      {subtitle ? <p className="text-sm text-gray-600">{subtitle}</p> : null}
    </div>
  )
}
