'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { Info, Lock, Mail, User, Phone, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoginPage() {
  const [tab, setTab] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [info, setInfo] = useState(null)

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

          <div className="text-center mb-10 relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/30 border border-white/20">
              <span className="text-white font-black text-2xl tracking-tighter">DF</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome to Doubt Fixer</h2>
            <p className="text-slate-400 font-medium">
              {tab === 'login' ? 'Sign in to continue your journey' : 'Create an account to get started'}
            </p>
          </div>

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

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6 animate-fade-in">
              {error}
            </div>
          )}

          {info && (
            <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-2 animate-fade-in">
              <Info className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{info}</span>
            </div>
          )}

          <div className="relative z-10 min-h-[300px]">
            <AnimatePresence mode="wait">
              {tab === 'login' ? (
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
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
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
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-3.5 rounded-xl font-bold hover:from-primary-500 hover:to-primary-400 transition-all disabled:opacity-50 shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 group mt-8"
                  >
                    {loading ? 'Authenticating...' : 'Sign In'}
                    {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                  </button>
                </motion.form>
              ) : (
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
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-3.5 rounded-xl font-bold hover:from-primary-500 hover:to-primary-400 transition-all disabled:opacity-50 shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 group mt-6"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                    {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                  </button>
                </motion.form>
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
