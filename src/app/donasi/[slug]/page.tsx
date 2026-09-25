import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { getCampaignBySlug, getDonorsByCampaign, getPrayersByCampaign } from '../components/data'
import {
  DonationHeader,
  DonationForm,
  DonorList,
  PrayerList,
} from './components'

interface DonationDetailPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ status?: string; order_id?: string }>
}

export default async function DonationDetailPage({
  params,
  searchParams,
}: DonationDetailPageProps) {
  const { slug } = await params
  const { status, order_id } = await searchParams

  const campaign = getCampaignBySlug(slug)

  if (!campaign) {
    notFound()
  }

  const donors = getDonorsByCampaign(slug)
  const prayers = getPrayersByCampaign(slug)

  // Payment status message
  const getStatusMessage = () => {
    switch (status) {
      case 'success':
        return {
          type: 'success' as const,
          title: 'Donasi Berhasil!',
          message: 'Terima kasih atas donasi Anda. Semoga Allah membalas kebaikan Anda.',
        }
      case 'pending':
        return {
          type: 'pending' as const,
          title: 'Menunggu Pembayaran',
          message: 'Silakan selesaikan pembayaran Anda.',
        }
      case 'failed':
        return {
          type: 'error' as const,
          title: 'Pembayaran Gagal',
          message: 'Mohon maaf, pembayaran Anda gagal. Silakan coba lagi.',
        }
      default:
        return null
    }
  }

  const statusMessage = getStatusMessage()

  return (
    <div className="min-h-screen pb-16">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-6xl px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/donasi" className="flex items-center gap-1 transition-colors hover:text-[#059035]">
            <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
            Kembali
          </Link>
          <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
          <Link href="/donasi" className="transition-colors hover:text-[#059035]">
            Donasi
          </Link>
          <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
          <span className="font-medium text-gray-700">{campaign.title}</span>
        </nav>
      </div>

      {/* Payment Status Banner */}
      {statusMessage && (
        <div className="mx-auto max-w-6xl px-4">
          <div
            className={`mb-6 flex items-center gap-4 rounded-xl p-4 ${
              statusMessage.type === 'success'
                ? 'bg-green-50 text-green-800'
                : statusMessage.type === 'pending'
                ? 'bg-amber-50 text-amber-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            <div>
              <h3 className="font-semibold">{statusMessage.title}</h3>
              <p className="text-sm">{statusMessage.message}</p>
              {order_id && (
                <p className="mt-1 text-xs opacity-75">
                  Order ID: {order_id}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Header & Info */}
          <div className="lg:col-span-2">
            <DonationHeader campaign={campaign} />
          </div>

          {/* Right Column - Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <DonationForm
                campaignSlug={slug}
                campaignTitle={campaign.title}
              />
            </div>
          </div>
        </div>

        {/* Donor & Prayer Lists */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <DonorList donors={donors} />
          <PrayerList prayers={prayers} />
        </div>
      </div>
    </div>
  )
}

export async function generateStaticParams() {
  return [
    { slug: 'renovasi-masjid' },
    { slug: 'beasiswa-tpq' },
    { slug: 'bantuan-bencana' },
    { slug: 'pengadaan-al-quran' },
    { slug: 'kontributor-yayasan' },
    { slug: 'sedekah-senior' },
  ]
}
