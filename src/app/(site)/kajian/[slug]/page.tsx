import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faFilePdf } from '@fortawesome/free-solid-svg-icons'
import { requireBySlug } from '@/features/data/getBySlug'
import { getKajianBySlug, type KajianDetail } from '@/features/kajian/getBySlug'

export const revalidate = 300

function youtubeEmbedUrl(id: string): string {
  return `https://www.youtube.com/embed/${encodeURIComponent(id)}`
}

export default async function KajianDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const detail = await requireBySlug<KajianDetail>(
    async () => {
      const item = await getKajianBySlug(slug)
      return item ? [item] : []
    },
    slug,
  ).catch(() => {
    notFound()
  })
  if (!detail) return null

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/kegiatan"
        className="mb-6 inline-flex items-center gap-2 text-sm text-[#0B7932] hover:underline"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
        Kembali
      </Link>

      <h1 className="mb-6 text-3xl font-bold text-gray-900">{detail.title}</h1>

      {detail.type === 'video' && detail.youtubeId ? (
        <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
          <iframe
            src={youtubeEmbedUrl(detail.youtubeId)}
            title={detail.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      ) : null}

      {detail.type === 'kitab' && detail.pdfUrl ? (
        <a
          href={detail.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-[#0B7932] px-5 py-3 text-sm font-semibold text-white hover:bg-[#09662a]"
        >
          <FontAwesomeIcon icon={faFilePdf} />
          Unduh / Buka Kitab (PDF)
        </a>
      ) : null}

      {detail.type === 'artikel' && detail.html ? (
        <div
          className="prose prose-green max-w-none leading-relaxed text-gray-700"
          dangerouslySetInnerHTML={{ __html: detail.html }}
        />
      ) : null}
    </article>
  )
}
