import './globals.css'
import { Inter } from 'next/font/google'
import { Navbar, Footer } from '../components/layout'
import LenisProvider from '../providers/lenis-provider'
import AnimationProvider from '../providers/animation-provider'

import '@fortawesome/fontawesome-svg-core/styles.css'
import { config, library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'

config.autoAddCss = false
library.add(fas, fab)

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  icons: {
    icon: "/logo.svg",
  },
  title: 'Yayasan Masjid Al-Muhajirin',
  description: 'Website resmi Yayasan Masjid Al-Muhajirin',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <LenisProvider>
          <AnimationProvider>
            <Navbar />
            <main className="flex-1 pt-16">
              {children}
            </main>
            <Footer />
          </AnimationProvider>
        </LenisProvider>
      </body>
    </html>
  )
}