'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { CheckCircle, Lock } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function DemoBookingForm() {
  const { session } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    student_name: '',
    parent_name: '',
    mobile_number: '',
    whatsapp_number: '',
    class: '',
    school_name: '',
    subject_required: '',
    preferred_timing: '',
    area_location: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [subjects, setSubjects] = useState(['Mathematics', 'English', 'Hindi', 'EVS / Science', 'All Subjects'])

  useEffect(() => {
    async function fetchSubjects() {
      const { data } = await supabase.from('subjects').select('name').order('created_at', { ascending: true })
      if (data && data.length > 0) {
        setSubjects([...data.map(s => s.name), 'All Subjects'])
      }
    }
    fetchSubjects()
  }, [])
  const classes = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Trading', 'Google Advertising', 'Data Entry']

  const [alreadyBooked, setAlreadyBooked] = useState(false)

  useEffect(() => {
    if (session?.user?.id) {
      const booked = localStorage.getItem('demo_booked_' + session.user.id)
      if (booked) setAlreadyBooked(true)
    }
  }, [session])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Check if this mobile number already exists in demo_requests
    const { data: existing } = await supabase
      .from('demo_requests')
      .select('id')
      .eq('mobile_number', formData.mobile_number)
      .single()

    if (existing) {
      setLoading(false)
      if (session?.user?.id) localStorage.setItem('demo_booked_' + session.user.id, 'true')
      setAlreadyBooked(true)
      return
    }

    const isRegularClass = formData.class.toLowerCase().startsWith('class')
    const finalData = {
      ...formData,
      subject_required: isRegularClass ? formData.subject_required : formData.class
    }

    const { error } = await supabase.from('demo_requests').insert([finalData])

    setLoading(false)
    if (!error) {
      if (session?.user?.id) localStorage.setItem('demo_booked_' + session.user.id, 'true')
      setSuccess(true)
    } else {
      alert(error.message)
    }
  }

  if (!session) {
    return (
      <div className="text-center py-12 px-4 border border-white/10 rounded-xl bg-white/5 backdrop-blur-md">
        <Lock className="w-16 h-16 text-primary-500 mx-auto mb-4 opacity-80" />
        <h3 className="text-2xl font-semibold text-white mb-3">Registration Required</h3>
        <p className="text-slate-300 mb-8 max-w-md mx-auto">
          Please create a free student account first in order to book a demo class. It only takes a minute!
        </p>
        <button
          onClick={() => router.push('/login')}
          className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-bold transition-colors shadow-lg shadow-primary-500/30"
        >
          Register / Login to Book Demo
        </button>
      </div>
    )
  }

  if (alreadyBooked) {
    return (
      <div className="text-center py-12 px-4 border border-white/10 rounded-xl bg-white/5 backdrop-blur-md">
        <CheckCircle className="w-16 h-16 text-primary-500 mx-auto mb-4 opacity-80" />
        <h3 className="text-2xl font-semibold text-white mb-3">Demo Already Booked</h3>
        <p className="text-slate-300 max-w-md mx-auto">
          You have already requested a free demo class. Our team will contact you shortly to schedule it.
        </p>
      </div>
    )
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Thank You!</h3>
        <p className="text-slate-300">Our team will contact you shortly.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-1">
            Student Name *
          </label>
          <input
            type="text"
            required
            value={formData.student_name}
            onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
            className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Student's name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-1">
            Parent Name *
          </label>
          <input
            type="text"
            required
            value={formData.parent_name}
            onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
            className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Parent's name"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-1">
            Mobile Number *
          </label>
          <input
            type="tel"
            required
            value={formData.mobile_number}
            onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
            className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="+91 ..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-1">
            WhatsApp Number
          </label>
          <input
            type="tel"
            value={formData.whatsapp_number}
            onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
            className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="+91 ..."
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-1">
            Class *
          </label>
          <select
            required
            value={formData.class}
            onChange={(e) => setFormData({ ...formData, class: e.target.value })}
            className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Select Class</option>
            {classes.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-1">
            School Name
          </label>
          <input
            type="text"
            value={formData.school_name}
            onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
            className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="School name"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {formData.class && formData.class.toLowerCase().startsWith('class') && (
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Subject Required *
            </label>
            <select
              required
              value={formData.subject_required}
              onChange={(e) => setFormData({ ...formData, subject_required: e.target.value })}
              className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select Subject</option>
              {subjects.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}

        {(!formData.class || !formData.class.toLowerCase().startsWith('class')) && (
          <div className="hidden"></div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-1">
            Preferred Timing
          </label>
          <input
            type="text"
            value={formData.preferred_timing}
            onChange={(e) => setFormData({ ...formData, preferred_timing: e.target.value })}
            className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="e.g., Evening 4-6 PM"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-1">
          Area / Location *
        </label>
        <input
          type="text"
          required
          value={formData.area_location}
          onChange={(e) => setFormData({ ...formData, area_location: e.target.value })}
          className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Your area/locality"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? 'Booking...' : 'Book Free Demo Class'}
      </button>
    </form>
  )
}
