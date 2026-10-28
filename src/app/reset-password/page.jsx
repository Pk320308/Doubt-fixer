'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Lock, CheckCircle, Info, ArrowRight, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [hasValidSession, setHasValidSession] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  const router = useRouter()

  useEffect(() => {
    // Check if user arrived via recovery link or has an active recovery session
    const checkRecovery = async () => {
      // 1. Check if hash contains recovery token
      if (typeof window !== 'undefined' && window.location.hash.includes('type=recovery')) {
        setHasValidSession(true)
      }

      // 2. Check current session
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setHasValidSession(true)
        setUserEmail(session.user.email || '')
      }

      setCheckingSession(false)
    }

    checkRecovery()

    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session?.user) {
        setHasValidSession(true)
        if (session?.user?.email) setUserEmail(session.user.email)
        setCheckingSession(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    setError(null)

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      // 1. Update user password in Supabase
      const { error: updateErr } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateErr) throw updateErr

      // 2. Log reset in tracking table if userEmail is known
      if (userEmail) {
        try {
          await supabase.rpc('log_password_reset', { user_email: userEmail })
        } catch (logErr) {
          console.warn('Reset log warning:', logErr)
        }
      }

      // 3. Sign out of temporary recovery session so user logs in cleanly with new password
      await supabase.auth.signOut()

      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err) {
      setError(err.message || 'Failed to update password. Your reset link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden z-10">
      <div className="max-w-md w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="dash-card bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-[0_0_50px_rgba(59,130,246,0.1)] relative overflow-hidden"
        >
          {/* Ambient Glows */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="text-center mb-8 relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/30 border border-white/20">
              <span className="text-white font-black text-2xl tracking-tighter">DF</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Set New Password</h2>
            <p className="text-slate-400 font-medium text-sm">
              {success
                ? 'Your password has been changed successfully!'
                : userEmail
                ? `Enter a new password for ${userEmail}`
                : 'Enter your new password below to secure your account'}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-xl mb-6 text-sm flex items-start gap-2 animate-fade-in">
              <Info className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="text-center py-6 animate-fade-in">
              <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-400">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Password Updated!</h3>
              <p className="text-sm text-slate-300 mb-6">
                Your old password has been invalidated. Only your new password will work now. Redirecting you to the sign-in page...
              </p>
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-500 transition-colors cursor-pointer"
              >
                Go to Sign In Now
              </button>
            </div>
          ) : checkingSession ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              Verifying your reset link...
            </div>
          ) : !hasValidSession ? (
            <div className="text-center py-6 animate-fade-in">
              <p className="text-slate-300 text-sm mb-6">
                No active password reset request was found or your link has expired. Please request a new password reset link from the login page.
              </p>
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-500 transition-colors cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-5 relative z-10">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white placeholder-slate-600 transition-all outline-none"
                    placeholder="•••••••• (min 6 chars)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white placeholder-slate-600 transition-all outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-400">
                  Setting a new password will automatically invalidate your old password and sign you out across all sessions.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-3.5 rounded-xl font-bold hover:from-primary-500 hover:to-primary-400 transition-all disabled:opacity-50 shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 cursor-pointer mt-6"
              >
                {loading ? 'Updating Password...' : 'Save New Password'}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-white/10 relative z-10 text-center">
            <p className="text-sm text-slate-400 font-medium">
              Remember your password?{' '}
              <a href="/login" className="text-primary-400 hover:text-primary-300 hover:underline transition-colors font-bold">
                Sign In
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
