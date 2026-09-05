'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { useEffect } from 'react'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    
    if (!user || !profile) {
      router.replace('/login')
      return
    }

    if (!allowedRoles.includes(profile.role)) {
      router.replace('/access-denied')
      return
    }

    if (profile.role === 'teacher') {
      if (profile.teacher_status === 'rejected' || profile.teacher_status === 'suspended') {
        router.replace('/access-denied')
        return
      }
    }
  }, [user, profile, loading, allowedRoles, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user || !profile) return null
  if (!allowedRoles.includes(profile.role)) return null

  return children
}
