import type { ReactNode } from 'react'

export default function ContentCard({
  title,
  description,
  meta,
  footer,
  children,
}: {
  title: string
  description?: string
  meta?: ReactNode
  footer?: ReactNode
  children?: ReactNode
}) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {children}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-2 text-lg font-bold text-gray-900 line-clamp-2">{title}</h3>
        {description ? (
          <p className="mb-4 flex-grow text-sm leading-relaxed text-gray-600 line-clamp-3">
            {description}
          </p>
        ) : null}
        {meta ? <div className="mb-3 text-xs text-gray-500">{meta}</div> : null}
        {footer ? <div className="mt-auto border-t border-gray-100 pt-4">{footer}</div> : null}
      </div>
    </article>
  )
}
