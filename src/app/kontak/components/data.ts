import { ContactInfo, SocialLink } from './types'

export const contactInfoData: ContactInfo[] = [
  {
    id: 'email',
    icon: 'faEnvelope',
    title: 'Email',
    value: 'yayasanalmuhajirin@gmail.com',
  },
  {
    id: 'phone',
    icon: 'faPhone',
    title: 'Nomor Telepon',
    value: '0341-123456',
  },
  {
    id: 'address',
    icon: 'faLocationDot',
    title: 'Alamat',
    value: 'Jalan Pondok Blimbing Indah Pandanwangi, Kec. Blimbing, Kota Malang, Jawa Timur 65126',
  },
]

export const socialLinksData: SocialLink[] = [
  {
    id: 'instagram',
    platform: 'Instagram',
    icon: 'faInstagram',
    description: 'Ikuti kami di Instagram untuk informasi terkini seputar kegiatan dan kegiatan Masjid Al-Muhajirin.',
    url: 'https://instagram.com/masjidal_muhajirin',
  },
  {
    id: 'youtube',
    platform: 'YouTube',
    icon: 'faYoutube',
    description: 'Tonton kajian dan dokumentasi kegiatan kami di channel YouTube resmi Masjid Al-Muhajirin.',
    url: 'https://youtube.com/@masjidal_muhajirin',
  },
]

export const mapEmbedUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3951.3!2d112.6!3d-7.9!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwNTQnMDAuMCJTIDExMsKwMzYnMDAuMCJF!5e0!3m2!1sen!2sid!4v1234567890'
