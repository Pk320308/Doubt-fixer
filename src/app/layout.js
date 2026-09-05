import { Inter } from 'next/font/google'
import './globals.css'
import ClientProviders from '@/components/ClientProviders'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Doubt Fixer - Home Tuition Bureau',
  description: 'Quality home tuition services for students from Class 1 to 8. Book free demo class today!',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={inter.className}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
