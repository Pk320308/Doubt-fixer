'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Phone, MessageCircle, User } from 'lucide-react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useAuth } from '@/lib/auth'

function TiltProfileCard({ children }) {
  const tiltX = useMotionValue(0)
  const tiltY = useMotionValue(0)
  
  const dragX = useMotionValue(0)
  const dragY = useMotionValue(0)

  // Spring physics configuration for tilt
  const mouseXSpring = useSpring(tiltX, { stiffness: 400, damping: 25 })
  const mouseYSpring = useSpring(tiltY, { stiffness: 400, damping: 25 })

  // Map mouse position to rotation angles (max 15 degrees)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"])

  // Lanyard string end points
  const lanyardX2 = useTransform(dragX, v => `calc(50vw + ${v}px)`)
  const lanyardY2 = useTransform(dragY, v => `calc(50vh + ${v - 190}px)`)

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    tiltX.set(xPct)
    tiltY.set(yPct)
  }

  const handleMouseLeave = () => {
    tiltX.set(0)
    tiltY.set(0)
  }

  return (
    <>
      {/* Lanyard String connected to top */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none z-[40]">
        <motion.line 
          x1="50vw" y1="-20px" 
          x2={lanyardX2} y2={lanyardY2} 
          stroke="#1e293b" strokeWidth="16" strokeLinecap="round" 
        />
        <motion.line 
          x1="50vw" y1="-20px" 
          x2={lanyardX2} y2={lanyardY2} 
          stroke="#0f172a" strokeWidth="12" strokeLinecap="round" 
        />
      </svg>

      <div style={{ perspective: 1200 }} className="flex items-center justify-center w-full max-w-sm pt-12 relative z-[50]">
        <motion.div
          drag
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0.6}
          whileDrag={{ cursor: "grabbing", scale: 1.05 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          style={{
            x: dragX,
            y: dragY,
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
            cursor: "grab"
          }}
          className="w-full relative z-10"
        >
          {/* Lanyard Top Clip */}
          <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 w-8 h-8 bg-slate-900 rounded-t-lg z-0 border-t border-l border-r border-white/20 shadow-inner"></div>
        {/* Background Card with ID Card styling */}
        <div 
          style={{ transform: "translateZ(0px)" }} 
          className="absolute inset-0 bg-[#161b33] rounded-[30px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden border-t border-white/10"
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent"></div>
        </div>

        {/* Parallax Content Container */}
        <div style={{ transform: "translateZ(40px)", transformStyle: "preserve-3d" }} className="relative z-10 p-6 sm:p-8 w-full h-full">
          {/* Clip Hole */}
          <div className="w-12 h-2 bg-slate-950 absolute top-4 left-1/2 -translate-x-1/2 rounded-full shadow-inner opacity-80"></div>
          
          <div className="mt-4">
            {children}
          </div>
        </div>
      </motion.div>
    </div>
    </>
  )
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const { user, profile, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    setIsMenuOpen(false)
  }

  return (
    <>
      <header className="bg-transparent shadow-sm sticky top-0 z-50 animate-fade-in-down">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center hover-scale">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">DF</span>
            </div>
            <span className="ml-2 text-lg font-semibold text-white hidden sm:block">
              Doubt Fixer
            </span>
          </Link>

          {!user && (
            <nav className="hidden md:flex items-center space-x-8">
              <a href="/#" className="text-slate-300 hover:text-primary-500 font-medium transition-colors animate-fade-in delay-100">Home</a>
              <a href="/#about" className="text-slate-300 hover:text-primary-500 font-medium transition-colors animate-fade-in delay-200">About</a>
              <a href="/#subjects" className="text-slate-300 hover:text-primary-500 font-medium transition-colors animate-fade-in delay-300">Subjects</a>
              <a href="/#demo" className="text-slate-300 hover:text-primary-500 font-medium transition-colors animate-fade-in delay-400">Book Demo</a>
              <a href="/#teachers" className="text-slate-300 hover:text-primary-500 font-medium transition-colors animate-fade-in delay-500">Join Us</a>
              <a href="/#contact" className="text-slate-300 hover:text-primary-500 font-medium transition-colors animate-fade-in delay-600">Contact</a>
            </nav>
          )}

          <div className="hidden md:flex items-center space-x-6">
            {user && profile ? (
              <>
                <Link href="/" className="text-slate-300 hover:text-primary-500 font-medium transition-colors animate-fade-in delay-100">Home</Link>
                {profile.role === 'student' && (
                  <Link href="/student" className="text-slate-300 hover:text-primary-500 font-medium transition-colors animate-fade-in delay-200">Dashboard</Link>
                )}
                {profile.role === 'teacher' && (
                  <Link href="/teacher" className="text-slate-300 hover:text-primary-500 font-medium transition-colors animate-fade-in delay-200">Dashboard</Link>
                )}
                {profile.role === 'admin' && (
                  <Link href="/admin" className="text-slate-300 hover:text-primary-500 font-medium transition-colors animate-fade-in delay-200">Admin</Link>
                )}
                <button onClick={handleSignOut} className="text-slate-300 hover:text-red-400 font-medium transition-colors mr-2 animate-fade-in delay-300">Sign Out</button>
                <button 
                  onClick={() => setIsProfileModalOpen(true)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 rounded-full cursor-pointer shadow-sm animate-fade-in delay-400"
                >
                  <User className="w-4 h-4 text-primary-400" />
                  <span className="text-sm font-semibold text-white">{profile.full_name}</span>
                </button>
              </>
            ) : (
              <Link href="/login" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors animate-fade-in delay-100">Login</Link>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white/10 backdrop-blur-md border border-white/10 border-t animate-fade-in-down">
          <div className="px-4 py-3 space-y-2">
            {!user && (
              <>
                <a href="/#" className="block py-2 text-slate-300" onClick={() => setIsMenuOpen(false)}>Home</a>
                <a href="/#about" className="block py-2 text-slate-300" onClick={() => setIsMenuOpen(false)}>About</a>
                <a href="/#subjects" className="block py-2 text-slate-300" onClick={() => setIsMenuOpen(false)}>Subjects</a>
                <a href="/#demo" className="block py-2 text-slate-300" onClick={() => setIsMenuOpen(false)}>Book Demo</a>
                <a href="/#teachers" className="block py-2 text-slate-300" onClick={() => setIsMenuOpen(false)}>Join Us</a>
                <a href="/#contact" className="block py-2 text-slate-300" onClick={() => setIsMenuOpen(false)}>Contact</a>
              </>
            )}
            {user && profile ? (
              <>
                <button 
                  onClick={() => { setIsProfileModalOpen(true); setIsMenuOpen(false); }}
                  className="flex w-full text-left items-center gap-2 px-2 py-2 mb-2 border-b border-white/10 hover:bg-white/5 rounded-lg"
                >
                  <User className="w-5 h-5 text-primary-400" />
                  <span className="font-medium text-white">{profile.full_name}</span>
                </button>
                <Link href="/" className="block py-2 text-slate-300" onClick={() => setIsMenuOpen(false)}>Home</Link>
                {profile.role === 'student' && (
                  <Link href="/student" className="block py-2 text-slate-300" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                )}
                {profile.role === 'teacher' && (
                  <Link href="/teacher" className="block py-2 text-slate-300" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                )}
                {profile.role === 'admin' && (
                  <Link href="/admin" className="block py-2 text-slate-300" onClick={() => setIsMenuOpen(false)}>Admin</Link>
                )}
                <button onClick={handleSignOut} className="block w-full text-left py-2 text-slate-300">Sign Out</button>
              </>
            ) : (
              <Link href="/login" className="block py-2 text-primary-600 font-medium" onClick={() => setIsMenuOpen(false)}>Login</Link>
            )}
          </div>
        </div>
      )}
      </header>

      <a href="https://wa.me/918604971873" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors z-50 fab-bounce" aria-label="WhatsApp chat">
        <MessageCircle className="w-6 h-6" />
      </a>

      <a href="tel:+918604971873" className="fixed bottom-6 left-6 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-colors z-50 fab-bounce" aria-label="Call us">
        <Phone className="w-6 h-6" />
      </a>

      {isProfileModalOpen && profile && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 animate-backdrop-in">
          {/* Background overlay that handles click-to-close */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsProfileModalOpen(false)}
          ></div>
          
          {/* Card Container (Sibling to backdrop, so clicks/drags here never bubble to the backdrop) */}
          <div className="relative z-10 w-full flex justify-center pointer-events-none">
            <div className="pointer-events-auto">
              <TiltProfileCard>
            <div className="flex justify-between items-start mb-8 px-2" style={{ transform: "translateZ(20px)" }}>
              <div className="flex flex-col gap-2">
                <span className="text-primary-400 font-black tracking-widest text-sm uppercase">Doubt Fixer</span>
                <button 
                  onClick={() => setIsProfileModalOpen(false)}
                  className="bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider flex items-center justify-center gap-1 w-fit transition-colors"
                >
                  <X className="w-3 h-3" /> CLOSE
                </button>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-[10px] font-bold text-white tracking-widest">ONLINE</span>
              </div>
            </div>

            <div className="flex flex-col items-center mb-8 relative z-10" style={{ transform: "translateZ(40px)" }}>
              <div className="w-28 h-28 bg-[#1f2947] rounded-full flex items-center justify-center mb-4 border-[3px] border-[#2a365c] shadow-xl relative">
                <User className="w-14 h-14 text-slate-400" />
                <div className="absolute bottom-0 right-0 bg-primary-500 p-2 rounded-full border-2 border-[#161b33]">
                  <div className="w-3 h-3 bg-white rounded-sm"></div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white text-center tracking-wide">{profile.full_name}</h2>
              <p className="text-primary-400 font-bold text-[11px] tracking-[0.2em] mt-1 uppercase">
                {profile.role}
              </p>
              
              <div className="mt-2 bg-white/5 border border-white/10 rounded-full px-4 py-1">
                <p className="text-[10px] font-bold text-slate-300 tracking-widest uppercase">ID: {profile.id.substring(0, 6).toUpperCase()}</p>
              </div>
            </div>

            <div className="relative z-10" style={{ transform: "translateZ(20px)" }}>
              <div className="h-[1px] w-full bg-white/10 mb-6"></div>
              
              <div className="grid grid-cols-2 gap-y-6 gap-x-4 px-2">
                <div>
                  <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mb-1">Email Address</p>
                  <p className="text-white text-xs font-medium truncate">{profile.email}</p>
                </div>
                
                <div className="text-right">
                  <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mb-1">Joined Date</p>
                  <p className="text-white text-xs font-medium">
                    {new Date(profile.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </p>
                </div>
                
                <div>
                  <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mb-1">Phone / Contact</p>
                  <p className="text-white text-xs font-medium">{profile.phone || 'N/A'}</p>
                </div>
                
                <div className="text-right">
                  <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mb-1">Status</p>
                  <p className="text-green-400 text-xs font-bold uppercase">Active</p>
                </div>
              </div>
            </div>
          </TiltProfileCard>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
