import { DonationFormData, DonationCampaign, DONATION_LIMITS } from '@/types/donation'
import crypto from 'crypto'

// Environment variables (set these in .env.local)
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || ''
const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY || ''
const MIDTRANS_ENV = process.env.MIDTRANS_ENV || 'sandbox'

// Base URL for callbacks
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

/**
 * Generate order ID for Midtrans transaction
 */
function generateOrderId(): string {
  const timestamp = Date.now()
  const random = crypto.randomBytes(4).toString('hex')
  return `DON-${timestamp}-${random}`
}

/**
 * Validate donation amount on server side
 * This is a critical security check - never trust client validation
 */
export function validateDonationAmount(amount: number): { valid: boolean; error?: string } {
  if (!amount || typeof amount !== 'number') {
    return { valid: false, error: 'Jumlah donasi tidak valid' }
  }

  if (amount < DONATION_LIMITS.MIN) {
    return { valid: false, error: `Donasi minimal Rp${DONATION_LIMITS.MIN.toLocaleString('id-ID')}` }
  }

  if (amount > DONATION_LIMITS.MAX) {
    return { valid: false, error: `Donasi maksimal Rp${DONATION_LIMITS.MAX.toLocaleString('id-ID')}` }
  }

  return { valid: true }
}

/**
 * Validate donation form data on server side
 */
export function validateDonationForm(data: DonationFormData): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  // Name validation
  if (!data.donorName?.trim()) {
    errors.donorName = 'Nama wajib diisi'
  } else if (data.donorName.length < 3) {
    errors.donorName = 'Nama minimal 3 karakter'
  }

  // WhatsApp validation (Indonesian format)
  const whatsappRegex = /^(\+62|62|0)[0-9]{9,12}$/
  if (!data.whatsapp?.trim()) {
    errors.whatsapp = 'Nomor WhatsApp wajib diisi'
  } else if (!whatsappRegex.test(data.whatsapp.replace(/[\s-]/g, ''))) {
    errors.whatsapp = 'Format nomor WhatsApp tidak valid'
  }

  // Email validation (optional)
  if (data.email?.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      errors.email = 'Format email tidak valid'
    }
  }

  // Amount validation
  const amountValidation = validateDonationAmount(data.amount)
  if (!amountValidation.valid) {
    errors.amount = amountValidation.error || 'Jumlah donasi tidak valid'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Create Midtrans Snap token for payment
 * This function should only be called from an API route (server-side)
 */
export async function createSnapToken(
  donationData: DonationFormData,
  campaign: DonationCampaign
): Promise<{ success: boolean; token?: string; error?: string }> {
  // Validate amount server-side
  const amountValidation = validateDonationAmount(donationData.amount)
  if (!amountValidation.valid) {
    return { success: false, error: amountValidation.error }
  }

  // Check if server key is configured
  if (!MIDTRANS_SERVER_KEY) {
    console.error('Midtrans Server Key is not configured')
    return { success: false, error: 'Konfigurasi pembayaran tidak tersedia' }
  }

  try {
    const orderId = generateOrderId()
    const grossAmount = donationData.amount

    // Prepare transaction details
    const transactionDetails = {
      order_id: orderId,
      gross_amount: grossAmount,
    }

    // Prepare customer details
    const customerDetails = {
      first_name: donationData.isAnonymous ? 'Hamba Allah' : donationData.donorName,
      phone: donationData.whatsapp,
      email: donationData.email || '',
    }

    // Prepare item details
    const itemDetails = [
      {
        id: campaign.id,
        price: grossAmount,
        quantity: 1,
        name: campaign.title.substring(0, 50),
      },
    ]

    // Build Snap request
    const snapRequest = {
      transaction_details: transactionDetails,
      customer_details: customerDetails,
      item_details: itemDetails,
      callbacks: {
        finish: `${BASE_URL}/donasi/${campaign.slug}?status=success&order_id=${orderId}`,
        error: `${BASE_URL}/donasi/${campaign.slug}?status=failed&order_id=${orderId}`,
        close: `${BASE_URL}/donasi/${campaign.slug}`,
      },
    }

    // Get Midtrans API URL based on environment
    const midtransApiUrl = MIDTRANS_ENV === 'production'
      ? 'https://api.midtrans.com'
      : 'https://app.sandbox.midtrans.com'

    // Make request to Midtrans Snap API
    const authHeader = Buffer.from(MIDTRANS_SERVER_KEY + ':').toString('base64')

    const response = await fetch(`${midtransApiUrl}/snap/v1/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authHeader}`,
      },
      body: JSON.stringify(snapRequest),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Midtrans API error:', errorData)
      return { success: false, error: 'Gagal membuat transaksi pembayaran' }
    }

    const snapToken = await response.json()

    return {
      success: true,
      token: snapToken.token,
    }
  } catch (error) {
    console.error('Error creating Snap token:', error)
    return { success: false, error: 'Terjadi kesalahan saat memproses pembayaran' }
  }
}

/**
 * Verify Midtrans notification callback
 * This validates that the callback is actually from Midtrans
 */
export async function verifyMidtransNotification(
  notificationBody: Record<string, string>
): Promise<{ valid: boolean; status?: string; orderId?: string; amount?: number }> {
  if (!MIDTRANS_SERVER_KEY) {
    return { valid: false }
  }

  try {
    const midtransApiUrl = MIDTRANS_ENV === 'production'
      ? 'https://api.midtrans.com'
      : 'https://app.sandbox.midtrans.com'

    const authHeader = Buffer.from(MIDTRANS_SERVER_KEY + ':').toString('base64')

    const response = await fetch(`${midtransApiUrl}/v2/${notificationBody.order_id}/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authHeader}`,
      },
    })

    if (!response.ok) {
      return { valid: false }
    }

    const statusResponse = await response.json()

    return {
      valid: true,
      status: statusResponse.transaction_status,
      orderId: statusResponse.order_id,
      amount: statusResponse.gross_amount,
    }
  } catch (error) {
    console.error('Error verifying Midtrans notification:', error)
    return { valid: false }
  }
}

/**
 * Get Midtrans client key for frontend
 */
export function getMidtransClientKey(): string {
  return MIDTRANS_CLIENT_KEY
}

/**
 * Check if Midtrans is configured
 */
export function isMidtransConfigured(): boolean {
  return Boolean(MIDTRANS_SERVER_KEY && MIDTRANS_CLIENT_KEY)
}
