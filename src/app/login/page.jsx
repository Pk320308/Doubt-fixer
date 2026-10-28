'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Info, Lock, Mail, User, Phone, ArrowRight, KeyRound, CheckCircle, ArrowLeft, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoginPage() {
  const [tab, setTab] = useState('login') // 'login', 'register', or 'forgot'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [info, setInfo] = useState(null)

  // Reset Password States
  const [resetStep, setResetStep] = useState('request') // 'request' or 'verify'
  const [resetEmail, setResetEmail] = useState('')
  const [resetOtp, setResetOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)

  const { signIn, signUp } = useAuth()
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)

    const { error, message, role } = await signIn(email, password)

    setLoading(false)
    if (error) {
      setError(error.message)
    } else if (message) {
      setInfo(message)
    } else {
      if (role === 'admin') {
        router.push('/admin')
      } else if (role === 'teacher') {
        router.push('/teacher')
      } else if (role === 'student') {
        router.push('/student')
      } else {
        router.push('/')
      }
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)

    const { error } = await signUp(email, password, fullName, phone, 'student')

    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setInfo('Registration successful! Please check your email to verify your account.')
      setEmail('')
      setPassword('')
      setFullName('')
      setPhone('')
    }
  }

  // Step 1: Check Monthly Limit & Request OTP via Supabase
  const handleRequestOtp = async (e) => {
    e.preventDefault()
    setError(null)
    setInfo(null)

    if (!resetEmail || !resetEmail.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }

    setResetLoading(true)
    try {
      // 1. Check rate limit (Max 2 times per calendar month)
      const { data: limitCheck, error: limitErr } = await supabase.rpc('check_password_reset_limit', {
        user_email: resetEmail.trim()
      })

      if (limitCheck && limitCheck.allowed === false) {
        throw new Error(limitCheck.message || 'You have exceeded the monthly limit of 2 password resets.')
      }

      // 2. Trigger Supabase Password Recovery OTP Email
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(resetEmail.trim())
      if (resetErr) throw resetErr

      setInfo(`An OTP verification code has been sent to ${resetEmail.trim()}. Please check your Gmail inbox (and Spam folder).`)
      setResetStep('verify')
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.')
    } finally {
      setResetLoading(false)
    }
  }

  // Step 2: Verify OTP and Set New Password (Revoking Old Password)
  const handleVerifyAndResetPassword = async (e) => {
    e.preventDefault()
    setError(null)
    setInfo(null)

    if (!resetOtp.trim()) {
      setError('Please enter the 6-digit OTP code received on your email.')
      return
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.')
      return
    }

    setResetLoading(true)
    try {
      // 1. Verify OTP with Supabase
      const { data: verifyData, error: verifyErr } = await supabase.auth.verifyOtp({
        email: resetEmail.trim(),
        token: resetOtp.trim(),
        type: 'recovery'
      })

      if (verifyErr) {
        throw new Error('Invalid or expired OTP code: ' + verifyErr.message)
      }

      // 2. Update to the new password (Supabase permanently invalidates the old password hash)
      const { error: updateErr } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateErr) throw updateErr

      // 3. Log the successful reset to enforce the 2/month limit
      try {
        await supabase.rpc('log_password_reset', { user_email: resetEmail.trim() })
      } catch (logErr) {
        console.warn('Logging reset warning:', logErr)
      }

      // 4. Sign out the recovery session so user can log in with new credentials
      await supabase.auth.signOut()

      setInfo('Password reset successful! Your old password has been replaced. Please sign in with your new password.')
      setTab('login')
      setEmail(resetEmail.trim())
      setPassword('')
      setResetOtp('')
      setNewPassword('')
      setConfirmPassword('')
      setResetStep('request')
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please check your OTP and try again.')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden z-10">
      
      <div className="max-w-md w-full relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="dash-card bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-[0_0_50px_rgba(59,130,246,0.1)] relative overflow-hidden"
        >
          {/* Decorative Glows */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="text-center mb-8 relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/30 border border-white/20">
              <span className="text-white font-black text-2xl tracking-tighter">DF</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
              {tab === 'forgot' ? 'Reset Password' : 'Welcome to Doubt Fixer'}
            </h2>
            <p className="text-slate-400 font-medium text-sm">
              {tab === 'login' && 'Sign in to continue your journey'}
              {tab === 'register' && 'Create an account to get started'}
              {tab === 'forgot' && (resetStep === 'request' ? 'Enter your email to receive an OTP' : 'Enter the 6-digit OTP code sent to your Gmail')}
            </p>
          </div>

          {/* Navigation Pill Tabs */}
          {tab !== 'forgot' ? (
            <div className="flex bg-slate-950/50 rounded-xl p-1 mb-8 border border-white/5 relative z-10 shadow-inner">
              <button
                type="button"
                onClick={() => { setTab('login'); setError(null); setInfo(null); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  tab === 'login'
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => { setTab('register'); setError(null); setInfo(null); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  tab === 'register'
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Register
              </button>
            </div>
          ) : (
            <div className="mb-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => { setTab('login'); setError(null); setInfo(null); setResetStep('request'); }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors p-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </button>
              <span className="text-xs text-primary-400 bg-primary-500/10 px-2.5 py-1 rounded-full border border-primary-500/20 font-medium">
                Limit: 2 resets/month
              </span>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-xl mb-6 text-sm animate-fade-in flex items-start gap-2">
              <Info className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {info && (
            <div className="bg-primary-500/10 border border-primary-500/20 text-primary-200 px-4 py-3 rounded-xl mb-6 text-sm flex items-start gap-2 animate-fade-in">
              <CheckCircle className="w-5 h-5 shrink-0 text-primary-400 mt-0.5" />
              <span>{info}</span>
            </div>
          )}

          <div className="relative z-10 min-h-[260px]">
            <AnimatePresence mode="wait">
              {tab === 'login' && (
                <motion.form 
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleLogin} 
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-500" />
                      </div>
                      <input
                        type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white placeholder-slate-600 transition-all outline-none"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setTab('forgot')
                          setResetEmail(email || '')
                          setResetStep('request')
                          setError(null)
                          setInfo(null)
                        }}
                        className="text-xs font-semibold text-primary-400 hover:text-primary-300 hover:underline transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-500" />
                      </div>
                      <input
                        type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white placeholder-slate-600 transition-all outline-none"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button
                    type="submit" disabled={loading}
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-3.5 rounded-xl font-bold hover:from-primary-500 hover:to-primary-400 transition-all disabled:opacity-50 shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 group mt-8 cursor-pointer"
                  >
                    {loading ? 'Authenticating...' : 'Sign In'}
                    {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                  </button>
                </motion.form>
              )}

              {tab === 'register' && (
                <motion.form 
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleRegister} 
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-500" />
                      </div>
                      <input
                        type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white placeholder-slate-600 transition-all outline-none"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-500" />
                      </div>
                      <input
                        type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white placeholder-slate-600 transition-all outline-none"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phone</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-slate-500" />
                      </div>
                      <input
                        type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white placeholder-slate-600 transition-all outline-none"
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-500" />
                      </div>
                      <input
                        type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white placeholder-slate-600 transition-all outline-none"
                        placeholder="•••••••• (min 6 chars)"
                      />
                    </div>
                  </div>

                  <button
                    type="submit" disabled={loading}
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-3.5 rounded-xl font-bold hover:from-primary-500 hover:to-primary-400 transition-all disabled:opacity-50 shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 group mt-6 cursor-pointer"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                    {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                  </button>
                </motion.form>
              )}

              {tab === 'forgot' && (
                <motion.div
                  key="forgot"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  {resetStep === 'request' ? (
                    <form onSubmit={handleRequestOtp} className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Registered Email Address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-slate-500" />
                          </div>
                          <input
                            type="email"
                            required
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white placeholder-slate-600 transition-all outline-none"
                            placeholder="your@email.com"
                          />
                        </div>
                        <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-primary-400 shrink-0" />
                          We will send a 6-digit recovery OTP directly to this Gmail.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={resetLoading}
                        className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-3.5 rounded-xl font-bold hover:from-primary-500 hover:to-primary-400 transition-all disabled:opacity-50 shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 cursor-pointer mt-6"
                      >
                        {resetLoading ? 'Checking & Sending OTP...' : 'Send OTP to Email'}
                        {!resetLoading && <ArrowRight className="w-5 h-5" />}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyAndResetPassword} className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                            6-Digit OTP Code
                          </label>
                          <button
                            type="button"
                            onClick={() => { setResetStep('request'); setError(null); }}
                            className="text-[11px] text-primary-400 hover:underline"
                          >
                            Change Email
                          </button>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <KeyRound className="h-5 w-5 text-primary-400" />
                          </div>
                          <input
                            type="text"
                            required
                            maxLength={8}
                            value={resetOtp}
                            onChange={(e) => setResetOtp(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-950/50 border border-primary-500/30 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white placeholder-slate-500 font-mono text-lg tracking-widest transition-all outline-none"
                            placeholder="123456"
                          />
                        </div>
                      </div>

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

                      <button
                        type="submit"
                        disabled={resetLoading}
                        className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-3.5 rounded-xl font-bold hover:from-green-500 hover:to-green-400 transition-all disabled:opacity-50 shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 cursor-pointer mt-6"
                      >
                        {resetLoading ? 'Verifying & Updating...' : 'Set New Password'}
                        {!resetLoading && <CheckCircle className="w-5 h-5" />}
                      </button>
                    </form>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 relative z-10 text-center">
            <p className="text-sm text-slate-400 font-medium">
              Need help? Contact us at{' '}
              <a href="mailto:doubtfixxer9918@gmail.com" className="text-primary-400 hover:text-primary-300 hover:underline transition-colors font-bold">
                doubtfixxer9918@gmail.com
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
