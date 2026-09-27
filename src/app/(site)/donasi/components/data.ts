import { DonationCampaign, Donor, Prayer } from '@/types/donation'

export const donationCampaignsData: DonationCampaign[] = [
  {
    id: 'camp-1',
    slug: 'renovasi-masjid',
    title: 'Renovasi Masjid Al-Muhajirin',
    description: 'Bantu kami memperbaiki dan merenovasi masjid agar bisa melayani lebih banyak Jamaah. Dana ini akan digunakan untuk perbaikan struktur, penambahan fasilitas, dan peningkatkan kenyamanan beribadah.',
    shortDescription: 'Perbaikan struktur masjid dan penambahan fasilitas untuk kenyamanan beribadah.',
    coverImage: '/images/donasi/renovasi-masjid.jpg',
    targetAmount: 500000000,
    collectedAmount: 345000000,
    donorCount: 234,
    isActive: true,
  },
  {
    id: 'camp-2',
    slug: 'beasiswa-tpq',
    title: 'Beasiswa Santri TPQ',
    description: 'Dukung pendidikan anak-anak kita di Taman Pendidikan Al-Quran. Beasiswa ini mencakup biaya operasional, buku pelajaran, dan honour guru-guru yang mendidik dengan penuh kesabaran.',
    shortDescription: 'Mendukung pendidikan anak-anak di Taman Pendidikan Al-Quran.',
    coverImage: '/images/donasi/beasiswa-tpq.jpg',
    targetAmount: 100000000,
    collectedAmount: 67500000,
    donorCount: 156,
    isActive: true,
  },
  {
    id: 'camp-3',
    slug: 'bantuan-bencana',
    title: 'Bantuan Korban Bencana',
    description: 'Mari bersama membantu saudara-saudara kita yang tertimpa bencana. Dana yang terkumpul akan digunakan untuk membantu korban bencana alam berupa kebutuhan pokok, tempat tinggal sementara, dan pembiayaan pemulihan.',
    shortDescription: 'Membantu korban bencana alam untuk kebutuhan pokok dan pemulihan.',
    coverImage: '/images/donasi/bantuan-bencana.jpg',
    targetAmount: 200000000,
    collectedAmount: 89000000,
    donorCount: 189,
    isActive: true,
  },
  {
    id: 'camp-4',
    slug: 'pengadaan-al-quran',
    title: 'Pengadaan Al-Quran',
    description: 'Sedekah Al-Quran untuk saudara-saudara kita yang belum memiliki Kitab Suci. Setiap donasi akan digunakan untuk mencetak dan membagikan Al-Quran kepada mereka yang membutuhkan.',
    shortDescription: 'Membagikan Kitab Suci Al-Quran kepada yang membutuhkan.',
    coverImage: '/images/donasi/al-quran.jpg',
    targetAmount: 50000000,
    collectedAmount: 32000000,
    donorCount: 98,
    isActive: true,
  },
  {
    id: 'camp-5',
    slug: 'kontributor-yayasan',
    title: ' Kontributor Yayasan',
    description: 'Jadilah bagian dari keberlangsungan yayasan dengan menjadi kontributor bulanan. Dana ini akan digunakan untuk operasional harian yayasan dalam melayani masyarakat.',
    shortDescription: 'Mendukung operasional harian yayasan secara berkelanjutan.',
    coverImage: '/images/donasi/kontributor.jpg',
    targetAmount: 120000000,
    collectedAmount: 45000000,
    donorCount: 67,
    isActive: true,
  },
  {
    id: 'camp-6',
    slug: 'sedekah-senior',
    title: 'Sedekah Senior',
    description: 'Mari menyantuni para lansia dan fakir miskin di sekitar lingkungan masjid. Bantuan ini digunakan untuk memenuhi kebutuhan pokok dan kesehatan mereka.',
    shortDescription: 'Menyantuni lansia dan fakir miskin di sekitar lingkungan masjid.',
    coverImage: '/images/donasi/senior.jpg',
    targetAmount: 75000000,
    collectedAmount: 58000000,
    donorCount: 142,
    isActive: true,
  },
]

export const mockDonors: Record<string, Donor[]> = {
  'renovasi-masjid': [
    { id: 'd1', name: 'Ahmad Fauzi', amount: 500000, isAnonymous: false, createdAt: '2025-01-15T10:30:00Z' },
    { id: 'd2', name: 'Hamba Allah', amount: 1000000, isAnonymous: true, createdAt: '2025-01-15T09:15:00Z' },
    { id: 'd3', name: 'Siti Aminah', amount: 250000, isAnonymous: false, createdAt: '2025-01-14T16:45:00Z' },
    { id: 'd4', name: 'Budi Santoso', amount: 750000, isAnonymous: false, createdAt: '2025-01-14T14:20:00Z' },
    { id: 'd5', name: 'Hamba Allah', amount: 50000, isAnonymous: true, createdAt: '2025-01-14T11:00:00Z' },
    { id: 'd6', name: 'Rudi Hermawan', amount: 100000, isAnonymous: false, createdAt: '2025-01-13T20:30:00Z' },
    { id: 'd7', name: 'Dewi Lestari', amount: 300000, isAnonymous: false, createdAt: '2025-01-13T18:15:00Z' },
  ],
  'beasiswa-tpq': [
    { id: 'd8', name: 'Hamba Allah', amount: 200000, isAnonymous: true, createdAt: '2025-01-15T08:00:00Z' },
    { id: 'd9', name: 'Hasan Basri', amount: 500000, isAnonymous: false, createdAt: '2025-01-14T15:30:00Z' },
    { id: 'd10', name: 'Fatimah Az-Zahra', amount: 150000, isAnonymous: false, createdAt: '2025-01-14T12:00:00Z' },
    { id: 'd11', name: 'Hamba Allah', amount: 75000, isAnonymous: true, createdAt: '2025-01-13T10:45:00Z' },
    { id: 'd12', name: 'Muhammad Rizki', amount: 100000, isAnonymous: false, createdAt: '2025-01-12T19:30:00Z' },
  ],
  'bantuan-bencana': [
    { id: 'd13', name: 'Umar Abdullah', amount: 1000000, isAnonymous: false, createdAt: '2025-01-15T07:30:00Z' },
    { id: 'd14', name: 'Hamba Allah', amount: 500000, isAnonymous: true, createdAt: '2025-01-14T22:00:00Z' },
    { id: 'd15', name: 'Aisyah Binti', amount: 250000, isAnonymous: false, createdAt: '2025-01-14T19:45:00Z' },
    { id: 'd16', name: 'Hamba Allah', amount: 100000, isAnonymous: true, createdAt: '2025-01-13T14:00:00Z' },
    { id: 'd17', name: 'Andi Wijaya', amount: 750000, isAnonymous: false, createdAt: '2025-01-13T11:30:00Z' },
    { id: 'd18', name: 'Siti Rahayu', amount: 200000, isAnonymous: false, createdAt: '2025-01-12T16:45:00Z' },
  ],
}

export const mockPrayers: Record<string, Prayer[]> = {
  'renovasi-masjid': [
    {
      id: 'p1',
      donorName: 'Ahmad Fauzi',
      isAnonymous: false,
      message: 'Semoga Allah SWT memudahkan proses renovasi masjid ini. Aamiin.',
      createdAt: '2025-01-15T10:35:00Z',
    },
    {
      id: 'p2',
      donorName: 'Hamba Allah',
      isAnonymous: true,
      message: 'Semoga donasi ini bermanfaat dan menjadi ladang pahala. Aamiin YRA.',
      createdAt: '2025-01-15T09:20:00Z',
    },
    {
      id: 'p3',
      donorName: 'Siti Aminah',
      isAnonymous: false,
      message: 'Semoga Allah membalas kebaikan para donatur dengan pahala yang berlipat ganda.',
      createdAt: '2025-01-14T16:50:00Z',
    },
    {
      id: 'p4',
      donorName: 'Budi Santoso',
      isAnonymous: false,
      message: 'Masjid adalah rumah Allah. Mari kita rawat bersama. Aamiin.',
      createdAt: '2025-01-14T14:25:00Z',
    },
    {
      id: 'p5',
      donorName: 'Hamba Allah',
      isAnonymous: true,
      message: 'Semoga bermanfaat untuk umat. Aamiin.',
      createdAt: '2025-01-14T11:05:00Z',
    },
  ],
  'beasiswa-tpq': [
    {
      id: 'p6',
      donorName: 'Hamba Allah',
      isAnonymous: true,
      message: 'Semoga anak-anak kita menjadi generasi Qurani. Aamiin.',
      createdAt: '2025-01-15T08:05:00Z',
    },
    {
      id: 'p7',
      donorName: 'Hasan Basri',
      isAnonymous: false,
      message: 'Mendukung pendidikan Al-Quran adalah investasi akhirat. Semoga bermanfaat.',
      createdAt: '2025-01-14T15:35:00Z',
    },
    {
      id: 'p8',
      donorName: 'Fatimah Az-Zahra',
      isAnonymous: false,
      message: 'Semoga guru-guru TPQ senantiasa diberikan kesehatan dan kesabaran.',
      createdAt: '2025-01-14T12:05:00Z',
    },
  ],
  'bantuan-bencana': [
    {
      id: 'p9',
      donorName: 'Umar Abdullah',
      isAnonymous: false,
      message: 'Semoga saudara-saudara kita yang tertimpa bencana diberi ketabahan dan kekuatan.',
      createdAt: '2025-01-15T07:35:00Z',
    },
    {
      id: 'p10',
      donorName: 'Hamba Allah',
      isAnonymous: true,
      message: 'Semoga bantuan ini bisa meringankan beban mereka. Aamiin.',
      createdAt: '2025-01-14T22:05:00Z',
    },
    {
      id: 'p11',
      donorName: 'Aisyah Binti',
      isAnonymous: false,
      message: 'Semoga Allah selalu melindungi mereka dari segala bencana.',
      createdAt: '2025-01-14T19:50:00Z',
    },
  ],
}

/**
 * Islamic quotes for donation page
 */
export const islamicQuotes = [
  {
    quote: 'Sedekah tidak mengurangi harta',
    source: 'HR. Muslim',
    description: 'Jika kamu berinfak, maka hartamu tidak akan berkurang, melainkan akan bertambah.',
  },
  {
    quote: 'Tangan di atas lebih baik dari tangan di bawah',
    source: 'HR. Bukhari & Muslim',
    description: 'Memberi lebih mulia daripada menerima. Jadilah orang yang memberi.',
  },
  {
    quote: 'Barangsiapa yang memberikan rekomendasi kebaikan, maka ia akan mendapatkan pahala',
    source: 'HR. Muslim',
    description: 'Setiap kebaikan yang kamu anjurkan, kamu akan mendapatkan pahalanya.',
  },
]

/**
 * Get campaign by slug
 */
export function getCampaignBySlug(slug: string): DonationCampaign | undefined {
  return donationCampaignsData.find(c => c.slug === slug)
}

/**
 * Get donors for a campaign
 */
export function getDonorsByCampaign(campaignSlug: string): Donor[] {
  return mockDonors[campaignSlug] || []
}

/**
 * Get prayers for a campaign
 */
export function getPrayersByCampaign(campaignSlug: string): Prayer[] {
  return mockPrayers[campaignSlug] || []
}

/**
 * Format currency to Indonesian Rupiah
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(collected: number, target: number): number {
  if (target === 0) return 0
  return Math.min(Math.round((collected / target) * 100), 100)
}

/**
 * Get relative time string
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Baru saja'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} hari lalu`

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
