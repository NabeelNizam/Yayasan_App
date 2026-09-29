import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Legacy donation endpoint. Online payment is on hold (PaymentsProvider =
 * manual); the supported path is the `submitDonation` Server Action. This
 * route stays as an explicit 501 so no caller silently bypasses that path
 * (it previously used hardcoded campaign data and a direct Midtrans SDK call).
 */
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: 'Donasi online belum tersedia. Gunakan formulir donasi atau hubungi pengurus via WhatsApp.',
    },
    { status: 501 },
  )
}
