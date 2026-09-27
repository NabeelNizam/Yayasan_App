import '../globals.css'
import { Inter } from 'next/font/google'
import { Navbar, Footer } from '../../components/layout'
import LenisProvider from '../../providers/lenis-provider'
import AnimationProvider from '../../providers/animation-provider'

const inter = Inter({ subsets: ['latin'] })

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${inter.className} flex min-h-screen flex-col`}>
      <LenisProvider>
        <AnimationProvider>
          <Navbar />
          <main className="flex-1 pt-16">
            {children}
          </main>
          <Footer />
        </AnimationProvider>
      </LenisProvider>
    </div>
  )
}
