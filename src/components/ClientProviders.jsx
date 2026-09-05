'use client'

import { useEffect } from 'react'
import { AuthProvider } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import InteractiveParticleBackground from '@/components/InteractiveParticleBackground'

function HealthPing() {
  useEffect(() => {
    const ping = async () => {
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        if (url) {
          try {
            await fetch(`${url}/functions/v1/health`, { method: 'GET' })
          } catch {
            // Silently fail
          }
        }
        try {
          await supabase.rpc('health_check')
        } catch {
          // Silently fail
        }
      } catch {
        // Silently fail
      }
    }
    ping()
    const interval = setInterval(ping, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])
  return null
}

export default function ClientProviders({ children }) {
  return (
    <AuthProvider>
      <HealthPing />
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-black text-slate-100 relative">
        <InteractiveParticleBackground />
        <Header />
        <main className="flex-grow z-10">{children}</main>
        <Footer />
      </div>
    </AuthProvider>
  )
}
