import { NextRequest, NextResponse } from 'next/server'
import { createSnapToken, validateDonationForm } from '@/lib/midtrans'
import { DonationFormData, DonationCampaign } from '@/types/donation'
import { donationCampaignsData } from '@/app/donasi/components/data'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { campaignSlug, ...donationData } = body as {
      campaignSlug: string
    } & DonationFormData

    // Find the campaign
    const campaign = donationCampaignsData.find(c => c.slug === campaignSlug)
    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Kampanye tidak ditemukan' },
        { status: 404 }
      )
    }

    // Validate form data server-side
    const validation = validateDonationForm(donationData as DonationFormData)
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: 'Data tidak valid', errors: validation.errors },
        { status: 400 }
      )
    }

    // Create Snap token
    const result = await createSnapToken(donationData as DonationFormData, campaign)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      token: result.token,
    })
  } catch (error) {
    console.error('Error creating donation:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    )
  }
}
