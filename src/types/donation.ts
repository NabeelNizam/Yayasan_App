// Donation campaign
export interface DonationCampaign {
  id: string
  slug: string
  title: string
  description: string
  shortDescription: string
  coverImage: string
  targetAmount: number
  collectedAmount: number
  donorCount: number
  endDate?: string
  isActive: boolean
}

// Donor information
export interface Donor {
  id: string
  name: string
  amount: number
  isAnonymous: boolean
  createdAt: string
}

// Prayer/message from donor
export interface Prayer {
  id: string
  donorName: string
  isAnonymous: boolean
  message: string
  createdAt: string
}

// Donation form data
export interface DonationFormData {
  donorName: string
  isAnonymous: boolean
  whatsapp: string
  email?: string
  amount: number
  prayer?: string
}

// Donation validation errors
export interface DonationValidationErrors {
  donorName?: string
  whatsapp?: string
  email?: string
  amount?: string
}

// Payment status
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'expired'

// Midtrans transaction result
export interface TransactionResult {
  status: PaymentStatus
  orderId: string
  amount: number
  transactionTime?: string
}

// Quick amount options
export const QUICK_AMOUNTS = [
  { label: 'Rp25.000', value: 25000 },
  { label: 'Rp50.000', value: 50000 },
  { label: 'Rp100.000', value: 100000 },
  { label: 'Rp250.000', value: 250000 },
  { label: 'Rp500.000', value: 500000 },
  { label: 'Rp1.000.000', value: 1000000 },
] as const

// Donation limits
export const DONATION_LIMITS = {
  MIN: 10000,
  MAX: 1000000,
} as const

// WhatsApp contact for large donations
export const LARGE_DONATION_WHATSAPP = '6281234567890'
