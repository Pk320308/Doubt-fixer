'use client'
import Link from 'next/link'
import { XCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth'

export default function AccessDenied() {
  const { profile } = useAuth()

  const getRoleMessage = () => {
    if (!profile) return 'Please login to access this page.'

    if (profile.role === 'teacher') {
      if (profile.teacher_status === 'pending') {
        return 'Your account is under admin review. You will be notified once approved.'
      }
      if (profile.teacher_status === 'rejected') {
        return 'Your application was not approved. Please contact support for more information.'
      }
      if (profile.teacher_status === 'suspended') {
        return 'Your account has been temporarily suspended. Please contact support for assistance.'
      }
    }

    return 'You do not have permission to access this page.'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full text-center">
        <div className="glass-card animate-scale-in p-8">
          <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6 animate-bounce-in" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4 animate-fade-in-up delay-200">Access Denied</h2>
          <p className="text-gray-600 mb-8 animate-fade-in delay-400">{getRoleMessage()}</p>
          <div className="space-y-3 animate-fade-in-up delay-600">
            <Link
              href="/"
              className="block w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Go to Home
            </Link>
            {profile && profile.role === 'student' && (
              <Link
                href="/student"
                className="block w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Go to My Dashboard
              </Link>
            )}
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need help? Contact{' '}
              <a href="mailto:doubtfixxer9918@gmail.com" className="text-primary-600 hover:underline">
                doubtfixxer9918@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
