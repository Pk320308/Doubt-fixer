import { Phone, MessageCircle, MapPin, Mail } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Footer() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  return (
    <footer className="bg-slate-950/80 backdrop-blur-2xl border-t border-white/5 text-white relative z-10 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-primary-500/10 blur-[100px] pointer-events-none"></div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-8">
          <motion.div variants={itemVariants}>
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                <span className="text-white font-bold text-xl">DF</span>
              </div>
              <span className="ml-3 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Doubt Fixer</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Quality home tuition services for students from Class 1 to 8. Empowering the next generation through personalized learning.
            </p>
          </motion.div>
          <motion.div variants={itemVariants}>
            <h3 className="font-bold text-lg mb-6 text-white flex items-center gap-2">
              <span className="w-8 h-1 bg-primary-500 rounded-full"></span> Quick Links
            </h3>
            <ul className="space-y-4 text-slate-400">
              <li><a href="/#about" className="hover:text-primary-400 hover:translate-x-2 inline-block transition-all font-medium">About Us</a></li>
              <li><a href="/#demo" className="hover:text-primary-400 hover:translate-x-2 inline-block transition-all font-medium">Book Demo</a></li>
              <li><a href="/#teachers" className="hover:text-white hover:translate-x-2 inline-block transition-all font-medium">Join as Teacher</a></li>
              <li><a href="/#contact" className="hover:text-white hover:translate-x-2 inline-block transition-all font-medium">Contact</a></li>
            </ul>
          </motion.div>
          <motion.div variants={itemVariants}>
            <h3 className="font-bold text-lg mb-6 text-white flex items-center gap-2">
              <span className="w-8 h-1 bg-purple-500 rounded-full"></span> Contact Us
            </h3>
            <ul className="space-y-4 text-slate-400">
              <li>
                <a href="tel:+918604971873" className="hover:text-primary-400 transition-colors flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-lg border border-white/10"><Phone className="w-4 h-4 text-primary-400" /></div>
                  +91 8604971873
                </a>
              </li>
              <li>
                <a href="mailto:doubtfixxer9918@gmail.com" className="hover:text-primary-400 transition-colors flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-lg border border-white/10"><MessageCircle className="w-4 h-4 text-primary-400" /></div>
                  doubtfixxer9918@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg border border-white/10"><MapPin className="w-4 h-4 text-primary-400" /></div>
                Varanasi, Uttar Pradesh
              </li>
            </ul>
            
            <div className="mt-8 flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary-500/20 hover:border-primary-500/50 hover:text-primary-400 transition-all hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-pink-500/20 hover:border-pink-500/50 hover:text-pink-400 transition-all hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="mailto:doubtfixxer9918@gmail.com" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-500/20 hover:border-blue-500/50 hover:text-blue-400 transition-all hover:scale-110">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </motion.div>
        </div>
        <motion.div variants={itemVariants} className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-500 font-bold text-xl tracking-wider">Har Doubt Ka Solution!</p>
          <p className="text-slate-500 text-sm font-medium">
            &copy; {new Date().getFullYear()} DOUBT FIXER Home Tuition. All rights reserved.
          </p>
        </motion.div>
      </motion.div>
    </footer>
  )
}
