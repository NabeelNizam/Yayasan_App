import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuoteLeft } from '@fortawesome/free-solid-svg-icons'
import { islamicQuotes } from './data'

export default function Quote() {
  // Use first quote
  const quote = islamicQuotes[0]

  return (
    <section className="py-12">
      <div className="mx-auto max-w-3xl px-4">
        <div className="relative rounded-2xl bg-gradient-to-br from-[#059035]/5 to-[#0B7932]/5 p-8 text-center">
          <FontAwesomeIcon
            icon={faQuoteLeft}
            className="mb-4 text-4xl text-[#059035]/30"
          />

          <blockquote className="mb-4 text-xl font-medium italic leading-relaxed text-gray-800">
            &ldquo;{quote.quote}&rdquo;
          </blockquote>

          <p className="mb-2 text-sm text-gray-600">
            {quote.description}
          </p>

          <cite className="text-sm font-semibold text-[#059035]">
            — {quote.source}
          </cite>
        </div>
      </div>
    </section>
  )
}
