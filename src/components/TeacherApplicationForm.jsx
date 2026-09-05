'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { CheckCircle } from 'lucide-react'

export default function TeacherApplicationForm() {
  const [formData, setFormData] = useState({
    full_name: '',
    mobile_number: '',
    email: '',
    qualification: '',
    subjects: [],
    experience: '',
    area_location: '',
    resume_url: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [subjects, setSubjects] = useState(['Mathematics', 'English', 'Hindi', 'EVS / Science'])

  useEffect(() => {
    async function fetchSubjects() {
      const { data } = await supabase.from('subjects').select('name').order('created_at', { ascending: true })
      if (data && data.length > 0) {
        setSubjects(data.map(s => s.name))
      }
    }
    fetchSubjects()
  }, [])

  const handleSubjectToggle = (subject) => {
    const current = formData.subjects
    if (current.includes(subject)) {
      setFormData({ ...formData, subjects: current.filter((s) => s !== subject) })
    } else {
      setFormData({ ...formData, subjects: [...current, subject] })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.subjects.length === 0) {
      alert('Please select at least one subject')
      return
    }

    setLoading(true)
    const { error } = await supabase.from('teacher_applications').insert([formData])
    setLoading(false)

    if (!error) {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Application Submitted!</h3>
        <p className="text-slate-300">Your application is under review. We will contact you soon.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-200 mb-1">
          Full Name *
        </label>
        <input
          type="text"
          required
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Your full name"
        />
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
            Email *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="your@email.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-1">
          Qualification *
        </label>
        <input
          type="text"
          required
          value={formData.qualification}
          onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
          className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="e.g., B.Ed, M.Sc, B.Tech"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-2">
          Subjects * (Select at least one)
        </label>
        <div className="flex flex-wrap gap-2">
          {subjects.map((subject) => (
            <button
              key={subject}
              type="button"
              onClick={() => handleSubjectToggle(subject)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${formData.subjects.includes(subject)
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-black hover:bg-gray-200'
                }`}
            >
              {subject}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-1">
          Experience
        </label>
        <input
          type="text"
          value={formData.experience}
          onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
          className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="e.g., 2 years teaching experience"
        />
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

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-1">
          Resume / Portfolio URL (Optional)
        </label>
        <input
          type="url"
          value={formData.resume_url}
          onChange={(e) => setFormData({ ...formData, resume_url: e.target.value })}
          className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="https://drive.google.com/..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Apply Now'}
      </button>
    </form>
  )
}
