'use client'
import { useState, useEffect } from 'react'
import {
  Users,
  Award,
  ClipboardCheck,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Star,
  CheckCircle,
  GraduationCap,
  FileText,
  Clock,
  UserCheck,
  TrendingUp,
  MousePointer2,
  Keyboard,
  Tags,
  Check
} from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { supabase } from '@/lib/supabase'
import DemoBookingForm from '@/components/DemoBookingForm'
import TeacherApplicationForm from '@/components/TeacherApplicationForm'

const googleReviewQR = '/google-review-qr.jpeg'

export default function HomePage() {
  const [testimonials, setTestimonials] = useState([])
  const [subjects, setSubjects] = useState([])

  useEffect(() => {
    async function fetchTestimonials() {
      const { data } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(6)

      if (data) {
        setTestimonials(data)
      }
    }

    async function fetchSubjects() {
      const { data } = await supabase
        .from('subjects')
        .select('*')
        .order('created_at', { ascending: true })

      if (data) {
        setSubjects(data)
      }
    }

    fetchTestimonials()
    fetchSubjects()
  }, [])

  const defaultTestimonials = [
    {
      id: '1',
      name: 'Priya Sharma',
      role: 'Parent',
      content: 'Excellent tutoring service. My daughter improved significantly in Mathematics. Highly recommended!',
      rating: 5,
      created_at: '',
    },
    {
      id: '2',
      name: 'Rahul Verma',
      role: 'Student, Class 7',
      content: 'Teachers are very supportive and explain concepts clearly. My grades have improved a lot.',
      rating: 5,
      created_at: '',
    },
    {
      id: '3',
      name: 'Mrs. Gupta',
      role: 'Parent',
      content: 'The personal attention my son receives is outstanding. Weekly tests help track his progress.',
      rating: 4,
      created_at: '',
    },
  ]

  const defaultSubjects = [
    {
      id: '1',
      name: 'Mathematics',
      description: 'Build strong foundation in numbers, algebra, geometry and problem solving.',
      icon: 'BookOpen',
      created_at: ''
    },
    {
      id: '2',
      name: 'English',
      description: 'Master grammar, vocabulary, reading comprehension and writing skills.',
      icon: 'FileText',
      created_at: ''
    },
    {
      id: '3',
      name: 'Hindi',
      description: 'Learn Hindi literature, grammar, writing and comprehension.',
      icon: 'BookOpen',
      created_at: ''
    },
    {
      id: '4',
      name: 'EVS / Science',
      description: 'Discover environment, science concepts and develop analytical thinking.',
      icon: 'MapPin',
      created_at: ''
    }
  ]

  const displayTestimonials = testimonials.length > 0 ? testimonials : defaultTestimonials
  const displaySubjects = subjects.length > 0 ? subjects : defaultSubjects

  const delays = ['delay-0', 'delay-100', 'delay-200', 'delay-300', 'delay-400', 'delay-500', 'delay-600', 'delay-700', 'delay-800', 'delay-1000']

  return (
    <div className="bg-transparent">
      {/* Hero Section */}
      <section className="relative bg-transparent text-white pt-10">
        <div className="absolute inset-0 bg-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 animate-fade-in-down gradient-text">
              DOUBT FIXER
            </h1>
            <h2 className="text-xl md:text-2xl font-medium mb-6 animate-fade-in-up delay-200">
              Home Tuition Bureau
            </h2>
            <p className="text-lg md:text-xl mb-8 text-primary-100 animate-fade-in-up delay-400">
              Learn Better • Score Higher • Grow Smarter
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12 animate-fade-in-up delay-600">
              <a
                href="#demo"
                className="bg-white/5 backdrop-blur-sm0 text-white border-2 border-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-400 transition-colors"
              >
                Free Demo Class
              </a>
              <a
                href="#teachers"
                className="bg-white/5 backdrop-blur-sm0 text-white border-2 border-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-400 transition-colors"
              >
                Apply as Teacher
              </a>
              <a
                href="tel:+918604971873"
                className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Call Now
              </a>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm md:text-base animate-fade-in delay-800">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Free Demo Class</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Personal Attention</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Qualified Teachers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Weekly Tests</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Homework Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-left">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                About Us
              </h2>
              <p className="text-lg text-slate-300 leading-relaxed">
                DOUBT FIXER HOME TUITION BUREAU provides quality home tuition services
                for students from Class 1 to 8. Our goal is to strengthen concepts,
                improve academic performance, and build confidence in every student.
              </p>
              <p className="text-lg text-slate-300 leading-relaxed mt-4">
                We believe in personalized learning that caters to each student's
                unique needs. Our qualified teachers ensure that every concept is
                clearly understood through interactive teaching methods.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 animate-fade-in-right">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 text-center glass-card hover-lift animate-fade-in-up delay-0">
                <Users className="w-10 h-10 text-primary-600 mx-auto mb-3" />
                <h3 className="font-semibold text-white">500+</h3>
                <p className="text-slate-300 text-sm">Students</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 text-center glass-card hover-lift animate-fade-in-up delay-200">
                <GraduationCap className="w-10 h-10 text-primary-600 mx-auto mb-3" />
                <h3 className="font-semibold text-white">50+</h3>
                <p className="text-slate-300 text-sm">Teachers</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 text-center glass-card hover-lift animate-fade-in-up delay-400">
                <Award className="w-10 h-10 text-primary-600 mx-auto mb-3" />
                <h3 className="font-semibold text-white">95%</h3>
                <p className="text-slate-300 text-sm">Success Rate</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 text-center glass-card hover-lift animate-fade-in-up delay-600">
                <Clock className="w-10 h-10 text-primary-600 mx-auto mb-3" />
                <h3 className="font-semibold text-white">5+</h3>
                <p className="text-slate-300 text-sm">Years Experience</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Courses Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 relative z-10">
            <div className="inline-flex items-center gap-2 bg-amber-500 text-white px-4 py-1.5 rounded-full font-bold text-sm mb-4 shadow-lg animate-pulse">
              <Tags className="w-4 h-4" />
              LAUNCH OFFER: FIRST 50 STUDENTS 30% OFF + FREE DEMO CLASS
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight animate-fade-in-up">
              NEW COURSES <span className="text-primary-400">NOW AVAILABLE!</span>
            </h2>
            <div className="flex items-center justify-center gap-4 text-slate-300 max-w-2xl mx-auto font-medium text-lg">
              <span className="hidden sm:block h-px bg-slate-600 flex-1"></span>
              <p>SKILL TODAY, SECURE TOMORROW</p>
              <span className="hidden sm:block h-px bg-slate-600 flex-1"></span>
            </div>
            <p className="text-slate-400 mt-2">Practical Knowledge. Real Skills. Better Opportunities.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Trading Course */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-green-500/30 overflow-hidden flex flex-col hover:-translate-y-2 transition-transform duration-300 glass-card animate-slide-up delay-200">
              <div className="bg-gradient-to-br from-green-900/80 to-green-800/60 p-6 text-center border-b border-green-500/20">
                <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-green-400">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">TRADING</h3>
                <p className="text-green-300 text-sm font-medium">Learn | Practice | Earn</p>
              </div>
              <div className="p-6 flex-grow">
                <ul className="space-y-3">
                  {[
                    'Stock Market Basics', 'Technical & Fundamental Analysis', 'Chart Reading',
                    'Risk Management', 'Live Market Practice', 'Trading Psychology',
                    'Strategies for Beginners', 'Practical Case Studies'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                      <Check className="w-5 h-5 text-green-500 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-green-600/20 p-4 border-t border-green-500/20 text-center">
                <p className="text-green-100 text-sm font-medium">Gain financial knowledge and learn to trade with confidence.</p>
              </div>
            </div>

            {/* Google Advertising */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-blue-500/30 overflow-hidden flex flex-col hover:-translate-y-2 transition-transform duration-300 glass-card animate-slide-up delay-400">
              <div className="bg-gradient-to-br from-blue-900/80 to-blue-800/60 p-6 text-center border-b border-blue-500/20">
                <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-400">
                  <MousePointer2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">GOOGLE ADVERTISING</h3>
                <p className="text-blue-300 text-sm font-medium">Promote | Reach | Grow</p>
              </div>
              <div className="p-6 flex-grow">
                <ul className="space-y-3">
                  {[
                    'Google Ads Basics', 'Campaign Setup & Optimization', 'Keyword Research',
                    'Ad Copy Writing', 'Performance Tracking', 'Conversions & ROI',
                    'Display & YouTube Ads', 'Real Campaign Practice'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                      <Check className="w-5 h-5 text-blue-500 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-blue-600/20 p-4 border-t border-blue-500/20 text-center">
                <p className="text-blue-100 text-sm font-medium">Learn digital advertising and grow businesses online.</p>
              </div>
            </div>

            {/* Data Entry */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-purple-500/30 overflow-hidden flex flex-col hover:-translate-y-2 transition-transform duration-300 glass-card animate-slide-up delay-600">
              <div className="bg-gradient-to-br from-purple-900/80 to-purple-800/60 p-6 text-center border-b border-purple-500/20">
                <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-purple-400">
                  <Keyboard className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">DATA ENTRY</h3>
                <p className="text-purple-300 text-sm font-medium">Learn | Work | Excel</p>
              </div>
              <div className="p-6 flex-grow">
                <ul className="space-y-3">
                  {[
                    'Typing Speed Improvement', 'MS Word / Excel Basics', 'Data Entry Techniques',
                    'Online Data Management', 'Data Cleaning', 'Excel Formulas (Basic)',
                    'Accuracy & Productivity Tips', 'Real Time Practice'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                      <Check className="w-5 h-5 text-purple-500 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-purple-600/20 p-4 border-t border-purple-500/20 text-center">
                <p className="text-purple-100 text-sm font-medium">Build accuracy, speed and become a data entry professional.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section id="subjects" className="py-16 md:py-24 bg-white/10 backdrop-blur-md border border-white/10/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Courses & Subjects We Teach
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Comprehensive coaching for all major subjects from Class 1 to 8
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displaySubjects.map((subject, index) => {
              const IconComponent = LucideIcons[subject.icon] || LucideIcons.BookOpen

              // Colors for styling iteration
              const colorClasses = [
                'text-blue-600 bg-blue-100',
                'text-green-600 bg-green-100',
                'text-orange-600 bg-orange-100',
                'text-purple-600 bg-purple-100'
              ]
              const color = colorClasses[index % colorClasses.length]
              const [textColor, bgColor] = color.split(' ')
              const delayClass = delays[index % delays.length]

              return (
                <div key={subject.id} className={`bg-transparent rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-white/10 glass-card hover-lift animate-fade-in-up ${delayClass}`}>
                  <div className={`w-14 h-14 ${bgColor} rounded-lg flex items-center justify-center mb-4`}>
                    <IconComponent className={`w-7 h-7 ${textColor}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{subject.name}</h3>
                  <p className="text-slate-300">
                    {subject.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose Us
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              We focus on quality education with personalized attention
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: GraduationCap, title: 'Free Demo Class', desc: 'Experience our teaching quality before enrollment' },
              { icon: UserCheck, title: 'Experienced Teachers', desc: 'Qualified educators with proven track records' },
              { icon: ClipboardCheck, title: 'Weekly Tests', desc: 'Regular assessment to track progress' },
              { icon: FileText, title: 'Homework Assistance', desc: 'Complete guidance with school assignments' },
              { icon: Users, title: 'Personal Attention', desc: 'One-on-one focus on individual needs' },
              { icon: Award, title: 'Progress Monitoring', desc: 'Regular feedback to parents' },
            ].map((item, index) => {
              const delayClass = delays[index % delays.length]
              return (
                <div key={index} className={`flex gap-4 p-6 bg-white/10 backdrop-blur-md border border-white/10/5 backdrop-blur-sm rounded-xl glass-card hover-glow animate-fade-in-up ${delayClass}`}>
                  <div className="w-12 h-12 bg-primary-900/50 rounded-lg flex items-center justify-center shrink-0">
                    <item.icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                    <p className="text-slate-300 text-sm">{item.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Demo Booking Section */}
      <section id="demo" className="py-16 md:py-24 bg-white/5 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 animate-fade-in-up">
              Book Free Demo Class
            </h2>
            <p className="text-slate-300">
              Fill the form below and our team will contact you
            </p>
          </div>

          <div className="bg-transparent rounded-2xl shadow-lg p-6 md:p-10 animate-scale-in delay-300">
            <DemoBookingForm />
          </div>
        </div>
      </section>

      {/* Teachers Required Section */}
      <section id="teachers" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="animate-fade-in-left">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Join Our Teaching Team
              </h2>
              <p className="text-slate-300 mb-8">
                We are looking for passionate educators who want to make a difference
                in students' lives.
              </p>

              <h3 className="text-xl font-semibold text-white mb-4">Requirements:</h3>
              <ul className="space-y-3 mb-8">
                {[
                  'Good Subject Knowledge',
                  'Good Communication Skills',
                  'Responsible Behaviour',
                  'Teaching Experience Preferred',
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-slate-300">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <h3 className="text-xl font-semibold text-white mb-4">Subjects:</h3>
              <div className="flex flex-wrap gap-2">
                {['Mathematics', 'English', 'Hindi', 'EVS / Science'].map((subject, index) => (
                  <span
                    key={index}
                    className="bg-primary-900/50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/10/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 animate-fade-in-right delay-300">
              <h3 className="text-xl font-semibold text-white mb-6">Apply Now</h3>
              <TeacherApplicationForm />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 md:py-24 bg-white/10 backdrop-blur-md border border-white/10/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What Parents & Students Say
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Hear from our satisfied parents and students
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayTestimonials.map((testimonial, index) => {
              const delayClass = delays[index % delays.length]
              return (
                <div
                  key={testimonial.id}
                  className={`bg-transparent rounded-xl p-6 shadow-sm glass-card hover-lift animate-fade-in-up ${delayClass}`}
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating || 5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <p className="text-slate-300 mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-slate-400">{testimonial.role}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-16 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 max-w-3xl mx-auto text-center relative overflow-hidden animate-scale-in">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-blue-500/20 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 rounded-full bg-red-500/20 blur-3xl"></div>

            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Loved our service?</h3>
            <p className="text-slate-300 mb-8 max-w-xl mx-auto relative z-10">
              Scan the QR code below to leave us a review on Google! Your feedback helps us improve and helps other students find the right guidance.
            </p>

            <div className="bg-white p-4 rounded-xl inline-block shadow-lg mx-auto mb-8 relative z-10 hover:scale-105 transition-transform duration-300">
              <img src={googleReviewQR} alt="Google Review QR Code" className="w-48 h-48 md:w-56 md:h-56 object-contain" />
            </div>

            <div className="relative z-10">
              <a href="https://local.google.com/place?placeid=ChIJH4x8BjMtjjkRk_zTe6_DEvs&utm_medium=noren&utm_source=gbp&utm_campaign=2026" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-gray-900 font-semibold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 border border-gray-200">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                Rate us on Google
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Contact Us
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Have questions? We are here to help.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <div className="space-y-6">
                <div className="flex items-start gap-4 animate-fade-in-left delay-0">
                  <div className="w-12 h-12 bg-primary-900/50 rounded-lg flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Phone</h3>
                    <a href="tel:+918604971873" className="text-slate-300 hover:text-primary-600">
                      +91 8604971873
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 animate-fade-in-left delay-100">
                  <div className="w-12 h-12 bg-primary-900/50 rounded-lg flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Email</h3>
                    <a href="mailto:doubtfixxer9918@gmail.com" className="text-slate-300 hover:text-primary-600">
                      doubtfixxer9918@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 animate-fade-in-left delay-200">
                  <div className="w-12 h-12 bg-primary-900/50 rounded-lg flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Location</h3>
                    <p className="text-slate-300">Varanasi, Uttar Pradesh</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 animate-fade-in-left delay-300">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                    <MessageCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">WhatsApp</h3>
                    <a
                      href="https://wa.me/918604971873"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-300 hover:text-green-600"
                    >
                      Chat with us
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-8 animate-fade-in-left delay-400">
                <h3 className="font-semibold text-white mb-4">Our Location</h3>
                <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d230661.87597536478!2d82.89823690409013!3d25.320518819560913!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x398e2da7e9b3b2b1%3A0xc2d8e9b3b0b3b2b1!2sVaranasi%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Doubt Fixer Location"
                  ></iframe>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/10/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 animate-fade-in-right delay-300">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('contact_submissions').insert([formData])

    setLoading(false)
    if (!error) {
      setSuccess(true)
      setFormData({ name: '', email: '', phone: '', message: '' })
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Thank You!</h3>
        <p className="text-slate-300">We will get back to you shortly.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-200 mb-1">Name</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Your name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-1">Email</label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="your@email.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-1">Phone</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="+91 ..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-1">Message</label>
        <textarea
          required
          rows={4}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="How can we help you?"
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  )
}
