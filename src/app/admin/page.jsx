'use client'

import React, { useState, useEffect } from 'react'
import {
  Users,
  MessageSquare,
  CheckCircle,
  XCircle,
  Eye,
  Star,
  UserPlus,
  Trash2,
  FileText,
  BookOpen,
  GraduationCap,
  Bell,
  ChevronRight
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function AdminPanel() {
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState('demos')
  const [demos, setDemos] = useState([])
  const [teacherApps, setTeacherApps] = useState([])
  const [users, setUsers] = useState([])
  const [materials, setMaterials] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [contacts, setContacts] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [subjects, setSubjects] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [expandedGroups, setExpandedGroups] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [rpcError, setRpcError] = useState(null)

  // New subject states
  const [newSubjectName, setNewSubjectName] = useState('')
  const [newSubjectDesc, setNewSubjectDesc] = useState('')
  const [newSubjectIcon, setNewSubjectIcon] = useState('BookOpen')
  const [creatingSubject, setCreatingSubject] = useState(false)

  // New teacher form states
  const [newTeacherEmail, setNewTeacherEmail] = useState('')
  const [newTeacherPassword, setNewTeacherPassword] = useState('')
  const [newTeacherName, setNewTeacherName] = useState('')
  const [newTeacherPhone, setNewTeacherPhone] = useState('')
  const [creatingTeacher, setCreatingTeacher] = useState(false)
  const [teacherError, setTeacherError] = useState(null)
  const [teacherSuccess, setTeacherSuccess] = useState(null)

  // Announcement form states
  const [annTitle, setAnnTitle] = useState('')
  const [annMessage, setAnnMessage] = useState('')
  const [annTarget, setAnnTarget] = useState('all')
  const [sendingAnn, setSendingAnn] = useState(false)

  useEffect(() => {
    fetchData()
  }, [activeTab])

  async function fetchData() {
    setLoading(true)
    if (activeTab === 'demos') {
      const { data } = await supabase
        .from('demo_requests')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) setDemos(data)
    } else if (activeTab === 'teacher_apps') {
      const { data } = await supabase
        .from('teacher_applications')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) setTeacherApps(data)
    } else if (activeTab === 'students' || activeTab === 'teachers') {
      const { data, error } = await supabase.rpc('get_all_users')
      if (error) {
        setRpcError(error.message)
      } else if (data) {
        setUsers(data)
        setRpcError(null)
      }
    } else if (activeTab === 'materials') {
      const { data: mats } = await supabase.from('materials').select('*').order('created_at', { ascending: false })
      if (mats) setMaterials(mats)

      const { data: usersData, error } = await supabase.rpc('get_all_users')
      if (error) {
        setRpcError(error.message)
      } else if (usersData) {
        setUsers(usersData)
        setRpcError(null)
      }
    } else if (activeTab === 'contacts') {
      const { data } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) setContacts(data)
    } else if (activeTab === 'testimonials') {
      const { data } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) setTestimonials(data)
    } else if (activeTab === 'subjects') {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('created_at', { ascending: true })
      if (error) {
        setRpcError(error.message)
      } else if (data) {
        setSubjects(data)
        setRpcError(null)
      }
    } else if (activeTab === 'enrollments') {
      const { data, error } = await supabase.rpc('get_all_enrollments')
      if (error) {
        setRpcError(error.message)
      } else if (data) {
        setEnrollments(data)
        setRpcError(null)
      }
    } else if (activeTab === 'announcements') {
      const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })
      if (error) {
        setRpcError(error.message)
      } else if (data) {
        setAnnouncements(data)
        setRpcError(null)
      }
      // Also fetch users for teacher names
      const { data: usersData } = await supabase.rpc('get_all_users')
      if (usersData) setUsers(usersData)
    }
    setLoading(false)
  }

  async function deleteUser(id) {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      const { error } = await supabase.rpc('delete_user_by_admin', { target_user_id: id })
      if (!error) {
        setUsers(users.filter((u) => u.id !== id))
      } else {
        alert('Failed to delete user. Make sure you ran the SQL script.')
      }
    }
  }

  async function deleteContact(id) {
    if (confirm('Are you sure you want to delete this contact message?')) {
      const { error } = await supabase.rpc('delete_contact_submission', { target_id: id })
      if (!error) {
        setContacts(contacts.filter((c) => c.id !== id))
      } else {
        alert('Failed to delete message. Make sure you ran the SQL script.')
      }
    }
  }

  async function updateDemoStatus(id, status) {
    const { error } = await supabase
      .from('demo_requests')
      .update({ status })
      .eq('id', id)

    if (!error) {
      setDemos(demos.map((d) => (d.id === id ? { ...d, status } : d)))
    }
  }

  async function deleteTeacherApp(id) {
    if (!confirm('Are you sure you want to delete this application?')) return
    const { error } = await supabase.from('teacher_applications').delete().eq('id', id)
    if (error) alert(error.message)
    else setTeacherApps(teacherApps.filter(t => t.id !== id))
  }

  async function deleteDemo(id) {
    if (!confirm('Are you sure you want to delete this demo request?')) return
    const { error } = await supabase.from('demo_requests').delete().eq('id', id)
    if (error) alert(error.message)
    else setDemos(demos.filter((d) => d.id !== id))
  }

  async function deleteAnnouncement(id) {
    if (!confirm('Are you sure you want to delete this announcement?')) return
    const { error } = await supabase.from('announcements').delete().eq('id', id)
    if (error) alert(error.message)
    else setAnnouncements(announcements.filter((a) => a.id !== id))
  }

  async function approveTestimonial(id, approve) {
    const { error } = await supabase
      .from('testimonials')
      .update({ is_approved: approve })
      .eq('id', id)

    if (!error) {
      setTestimonials(testimonials.map((t) => (t.id === id ? { ...t, is_approved: approve } : t)))
    }
  }

  async function updateEnrollmentStatus(id, status) {
    const { error } = await supabase.rpc('admin_update_enrollment_status', {
      enrollment_id: id,
      new_status: status
    })

    if (!error) {
      setEnrollments(enrollments.map((e) => (e.id === id ? { ...e, status: status } : e)))
    } else {
      alert('Failed to update status: ' + error.message)
    }
  }

  async function deleteEnrollment(id) {
    if (!confirm('Are you sure you want to delete this enrollment?')) return
    const { error } = await supabase.from('student_enrollments').delete().eq('id', id)
    if (error) alert(error.message)
    else setEnrollments(enrollments.filter(e => e.id !== id))
  }

  const statusColors = {
    pending: 'badge-glass badge-glow-yellow',
    contacted: 'badge-glass badge-glow-blue',
    confirmed: 'badge-glass badge-glow-green',
    completed: 'badge-glass badge-glow-purple',
    approved: 'badge-glass badge-glow-green',
    rejected: 'badge-glass badge-glow-red',
    suspended: 'badge-glass badge-glow-yellow',
  }

  const handleAddTeacher = async (e) => {
    e.preventDefault()
    setTeacherError(null)
    setTeacherSuccess(null)

    if (newTeacherPassword.length < 6) {
      setTeacherError('Password must be at least 6 characters')
      return
    }

    setCreatingTeacher(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newTeacherEmail,
          password: newTeacherPassword,
          data: {
            full_name: newTeacherName,
            phone: newTeacherPhone,
            role: 'teacher'
          }
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.msg || data.error_description || 'Failed to create teacher')
      }

      setTeacherSuccess('Teacher account created successfully!')
      setNewTeacherEmail('')
      setNewTeacherPassword('')
      setNewTeacherName('')
      setNewTeacherPhone('')
    } catch (err) {
      setTeacherError(err.message)
    } finally {
      setCreatingTeacher(false)
    }
  }

  const handleAddSubject = async (e) => {
    e.preventDefault()
    setCreatingSubject(true)
    const { data, error } = await supabase.from('subjects').insert([{
      name: newSubjectName,
      description: newSubjectDesc,
      icon: newSubjectIcon
    }]).select()

    if (error) {
      alert('Failed to add subject: ' + error.message)
    } else if (data) {
      setSubjects([...subjects, data[0]])
      setNewSubjectName('')
      setNewSubjectDesc('')
      setNewSubjectIcon('BookOpen')
    }
    setCreatingSubject(false)
  }

  async function deleteSubject(id) {
    if (confirm('Are you sure you want to delete this subject?')) {
      const { error } = await supabase.from('subjects').delete().eq('id', id)
      if (!error) {
        setSubjects(subjects.filter(s => s.id !== id))
      } else {
        alert('Failed to delete subject: ' + error.message)
      }
    }
  }

  async function handleSendAnnouncement(e) {
    e.preventDefault()
    setSendingAnn(true)
    const { data, error } = await supabase.from('announcements').insert([{
      sender_id: profile?.id,
      title: annTitle,
      message: annMessage,
      target_audience: annTarget
    }]).select()

    if (error) {
      alert('Failed to send announcement: ' + error.message)
    } else if (data) {
      setAnnouncements([data[0], ...announcements])
      setAnnTitle('')
      setAnnMessage('')
      setAnnTarget('all')
      alert('Announcement sent successfully!')
    }
    setSendingAnn(false)
  }

  const tabs = [
    { id: 'demos', label: 'Demo Requests', icon: Eye, count: demos.filter(d => d.status === 'pending').length },
    { id: 'teacher_apps', label: 'Teacher Apps', icon: GraduationCap, count: teacherApps.length },
    { id: 'students', label: 'Students', icon: Users, count: users.filter(u => u.role === 'student').length },
    { id: 'teachers', label: 'Teachers', icon: Users, count: users.filter(u => u.role === 'teacher').length },
    { id: 'subjects', label: 'Subjects', icon: BookOpen, count: subjects.length },
    { id: 'enrollments', label: 'Enrollments', icon: GraduationCap, count: enrollments.filter(e => e.status === 'pending').length },
    { id: 'materials', label: 'Study Materials', icon: FileText, count: materials.filter(m => m.material_type !== 'announcement').length },
    { id: 'announcements', label: 'Announcements', icon: Bell, count: announcements.length },
    { id: 'add_teacher', label: 'Add Teacher', icon: UserPlus, count: 0 },
    { id: 'contacts', label: 'Contact Forms', icon: MessageSquare, count: contacts.length },
    { id: 'testimonials', label: 'Testimonials', icon: Star, count: testimonials.filter(t => !t.is_approved).length },
  ]

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen relative overflow-hidden bg-transparent">
        <div className="bg-orb bg-orb-1"></div>
        <div className="bg-orb bg-orb-2"></div>
        <div className="bg-orb bg-orb-3"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-white animate-fade-in-down">
              Admin Panel
            </h1>
            <p className="text-slate-300 mt-1">Manage demo requests, teacher applications, and content.</p>
          </div>

          <div className="flex flex-wrap gap-3 mb-6 animate-fade-in-up delay-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pill-tab flex items-center gap-2 px-5 py-2.5 whitespace-nowrap flex-shrink-0 text-sm font-semibold hover:bg-white/10 text-slate-300 transition-colors ${activeTab === tab.id
                  ? 'active shadow-lg'
                  : ''
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-white/10 backdrop-blur-md border border-white/10/20' : 'bg-primary-900/50 text-primary-700'
                    }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : (
            <>
              {activeTab === 'demos' && (
                <div className="dash-card overflow-hidden animate-fade-in">
                  <div className="p-6 border-b border-white/10">
                    <h2 className="text-xl font-semibold text-white">Demo Class Requests</h2>
                  </div>
                  {demos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 empty-state-icon">
                        <Eye className="w-10 h-10 text-primary-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">No data found</h3>
                      <p className="text-slate-400">There are no records to display here yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b border-white/10 animate-fade-in">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase">Student</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase">Class</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase">Subject</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase">Location</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase">Contact</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {demos.map((demo, index) => (
                            <tr key={demo.id} className="table-row-hover animate-fade-in-up" style={{animationDelay: `${index * 50}ms`}}>
                              <td className="px-6 py-4">
                                <div className="font-medium text-white">{demo.student_name}</div>
                                <div className="text-sm text-slate-400">{demo.parent_name}</div>
                              </td>
                              <td className="px-6 py-4 text-slate-300">{demo.class}</td>
                              <td className="px-6 py-4 text-slate-300">{demo.subject_required}</td>
                              <td className="px-6 py-4 text-slate-300">{demo.area_location}</td>
                              <td className="px-6 py-4">
                                <div className="text-slate-300">{demo.mobile_number}</div>
                                {demo.whatsapp_number && (
                                  <a
                                    href={`https://wa.me/${demo.whatsapp_number.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-green-600 text-sm hover:underline"
                                  >
                                    WhatsApp
                                  </a>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[demo.status]}`}>
                                  {demo.status}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <select
                                    value={demo.status}
                                    onChange={(e) => updateDemoStatus(demo.id, e.target.value)}
                                    className="text-sm border border-white/20 rounded px-2 py-1 bg-transparent text-white"
                                  >
                                    <option className="bg-slate-800" value="pending">Pending</option>
                                    <option className="bg-slate-800" value="contacted">Contacted</option>
                                    <option className="bg-slate-800" value="confirmed">Confirmed</option>
                                    <option className="bg-slate-800" value="completed">Completed</option>
                                  </select>
                                  <button
                                    onClick={() => deleteDemo(demo.id)}
                                    className="text-red-400 hover:text-red-300 transition-colors p-1"
                                    title="Delete Demo"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'teacher_apps' && (
                <div className="dash-card overflow-hidden animate-fade-in">
                  <div className="p-6 border-b border-white/10">
                    <h2 className="text-xl font-semibold text-white">Teacher Applications</h2>
                  </div>
                  {teacherApps.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 empty-state-icon">
                        <GraduationCap className="w-10 h-10 text-primary-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">No data found</h3>
                      <p className="text-slate-400">There are no records to display here yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b border-white/10 animate-fade-in">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase">Applicant</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase">Qualification</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase">Subjects</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase">Experience</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase">Location</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {teacherApps.map((app, index) => (
                            <tr key={app.id} className="table-row-hover animate-fade-in-up" style={{animationDelay: `${index * 50}ms`}}>
                              <td className="px-6 py-4">
                                <div className="font-medium text-white">{app.full_name}</div>
                                <div className="text-sm text-slate-400">{app.email}</div>
                                <div className="text-sm text-slate-400">{app.mobile_number}</div>
                                {app.resume_url && (
                                  <a href={app.resume_url} target="_blank" rel="noopener noreferrer" className="text-primary-400 text-xs hover:underline mt-1 block">View Resume</a>
                                )}
                              </td>
                              <td className="px-6 py-4 text-slate-300">{app.qualification}</td>
                              <td className="px-6 py-4 text-slate-300">
                                <div className="flex flex-wrap gap-1">
                                  {app.subjects?.map((s) => <span key={s} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-xs">{s}</span>)}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-slate-300">{app.experience || 'N/A'}</td>
                              <td className="px-6 py-4 text-slate-300">{app.area_location}</td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => deleteTeacherApp(app.id)}
                                  className="text-red-400 hover:text-red-300 transition-colors p-1"
                                  title="Delete Application"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {(activeTab === 'students' || activeTab === 'teachers') && (
                <div className="dash-card overflow-hidden animate-fade-in">
                  {rpcError && (
                    <div className="m-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-white animate-fade-in">
                      <h3 className="font-bold text-red-200">Database Setup Required</h3>
                      <p>We could not load users due to a security error: {rpcError}</p>
                      <p className="mt-2">Please go to your Supabase SQL Editor and run the contents of the <strong>admin-functions.sql</strong> file to enable this feature.</p>
                    </div>
                  )}
                  <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-white">
                      {activeTab === 'students' ? 'Registered Students' : 'Registered Teachers'}
                    </h2>
                    <div className="flex gap-4">
                      <div className="text-slate-300">
                        Total: <span className="text-white font-bold">{users.filter(u => u.role === (activeTab === 'students' ? 'student' : 'teacher')).length}</span>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="border-b border-white/10 animate-fade-in">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase border-b border-white/10">Name</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase border-b border-white/10">Email</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase border-b border-white/10">Role</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase border-b border-white/10">Phone</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase border-b border-white/10">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.filter(u => u.role === (activeTab === 'students' ? 'student' : 'teacher')).length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-0">
                              <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 empty-state-icon">
                                  <Users className="w-10 h-10 text-primary-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">No data found</h3>
                                <p className="text-slate-400">{rpcError ? 'Could not load users. Please run the SQL script.' : 'No users found in this category.'}</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          users.filter(u => u.role === (activeTab === 'students' ? 'student' : 'teacher')).map((u, index) => (
                            <tr key={u.id} className="table-row-hover border-b border-white/10 animate-fade-in-up" style={{animationDelay: `${index * 50}ms`}}>
                              <td className="p-4 text-slate-200">
                                {u.full_name} <span className="text-slate-400 text-xs ml-2">(ID: {u.id.substring(0, 6).toUpperCase()})</span>
                              </td>
                              <td className="p-4 text-slate-300">{u.email}</td>
                              <td className="p-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${u.role === 'teacher' ? 'bg-blue-100 text-blue-700' :
                                    u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                                  }`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="p-4 text-slate-300">{u.phone || 'N/A'}</td>
                              <td className="p-4">
                                {u.role !== 'admin' && (
                                  <button
                                    onClick={() => deleteUser(u.id)}
                                    className="text-red-400 hover:text-red-300 transition-colors p-2"
                                    title="Delete User"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'add_teacher' && (
                <div className="dash-card overflow-hidden p-6 max-w-2xl mx-auto animate-scale-in">
                  <div className="border-b border-white/10 pb-4 mb-6">
                    <h2 className="text-xl font-semibold text-white">Register New Teacher</h2>
                    <p className="text-sm text-slate-400 mt-1">Create a teacher account directly without requiring them to sign up.</p>
                  </div>

                  {teacherError && (
                    <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6 animate-fade-in">
                      {teacherError}
                    </div>
                  )}
                  {teacherSuccess && (
                    <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      <span>{teacherSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleAddTeacher} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={newTeacherName}
                        onChange={(e) => setNewTeacherName(e.target.value)}
                        className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-1">Email</label>
                      <input
                        type="email"
                        required
                        value={newTeacherEmail}
                        onChange={(e) => setNewTeacherEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-1">Phone</label>
                      <input
                        type="tel"
                        required
                        value={newTeacherPhone}
                        onChange={(e) => setNewTeacherPhone(e.target.value)}
                        className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-1">Password</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={newTeacherPassword}
                        onChange={(e) => setNewTeacherPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={creatingTeacher}
                      className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                      {creatingTeacher ? 'Creating...' : 'Create Teacher Account'}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'subjects' && (
                <div className="space-y-6">
                  {rpcError && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center animate-fade-in">
                      <h3 className="text-xl font-semibold text-red-400 mb-2">Database Setup Required</h3>
                      <p className="text-red-200 mb-4">
                        The subjects table does not exist. You must run the <strong>add-subjects-table.sql</strong> script in your Supabase SQL Editor.
                      </p>
                      <p className="text-sm text-red-300">Error: {rpcError}</p>
                    </div>
                  )}
                  {!rpcError && (
                    <>
                      <div className="dash-card p-6">
                        <h2 className="text-xl font-semibold text-white mb-6">Add New Subject</h2>
                        <form onSubmit={handleAddSubject} className="space-y-4 max-w-2xl">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Subject Name</label>
                              <input
                                type="text"
                                required
                                value={newSubjectName}
                                onChange={(e) => setNewSubjectName(e.target.value)}
                                className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                placeholder="e.g. Mathematics"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Icon Name (lucide-react)</label>
                              <input
                                type="text"
                                required
                                value={newSubjectIcon}
                                onChange={(e) => setNewSubjectIcon(e.target.value)}
                                className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                placeholder="e.g. BookOpen, FileText, MapPin"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                            <input
                              type="text"
                              required
                              value={newSubjectDesc}
                              onChange={(e) => setNewSubjectDesc(e.target.value)}
                              className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                              placeholder="Short description for the homepage..."
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={creatingSubject}
                            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                          >
                            {creatingSubject ? 'Adding...' : 'Add Subject'}
                          </button>
                        </form>
                      </div>

                      <div className="dash-card overflow-hidden animate-fade-in">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                          <h2 className="text-xl font-semibold text-white">Manage Subjects</h2>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead className="border-b border-white/10 animate-fade-in">
                              <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase border-b border-white/10">Icon</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase border-b border-white/10">Subject</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase border-b border-white/10">Description</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase border-b border-white/10">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {subjects.length === 0 ? (
                                <tr>
                                  <td colSpan={4} className="p-0">
                                    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
                                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 empty-state-icon">
                                        <BookOpen className="w-10 h-10 text-primary-400" />
                                      </div>
                                      <h3 className="text-xl font-bold text-white mb-2">No data found</h3>
                                      <p className="text-slate-400">There are no records to display here yet.</p>
                                    </div>
                                  </td>
                                </tr>
                              ) : (
                                subjects.map((s, index) => (
                                  <tr key={s.id} className="table-row-hover border-b border-white/10 animate-fade-in-up" style={{animationDelay: `${index * 50}ms`}}>
                                    <td className="p-4 text-slate-200 font-mono text-sm">{s.icon}</td>
                                    <td className="p-4 text-slate-200 font-bold">{s.name}</td>
                                    <td className="p-4 text-slate-300">{s.description}</td>
                                    <td className="p-4">
                                      <button
                                        onClick={() => deleteSubject(s.id)}
                                        className="text-red-400 hover:text-red-300 transition-colors p-2"
                                        title="Delete Subject"
                                      >
                                        <Trash2 className="w-5 h-5" />
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'materials' && (
                <div className="dash-card overflow-hidden animate-fade-in">
                  {rpcError && (
                    <div className="m-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-white animate-fade-in">
                      <h3 className="font-bold text-red-200">Database Setup Required</h3>
                      <p>We could not load teacher names due to a security error: {rpcError}</p>
                      <p className="mt-2">Please run <strong>admin-functions.sql</strong> in your Supabase SQL Editor.</p>
                    </div>
                  )}
                  <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-white">Teacher Uploaded Materials</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="border-b border-white/10 animate-fade-in">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase border-b border-white/10">Title</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase border-b border-white/10">Type</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase border-b border-white/10">Subject / Class</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase border-b border-white/10">Teacher</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase border-b border-white/10">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {materials.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-0">
                              <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 empty-state-icon">
                                  <FileText className="w-10 h-10 text-primary-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">No data found</h3>
                                <p className="text-slate-400">There are no records to display here yet.</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          materials.map((m, index) => {
                            const teacher = users.find(u => u.id === m.teacher_id);
                            return (
                              <tr key={m.id} className="table-row-hover border-b border-white/10 animate-fade-in-up" style={{animationDelay: `${index * 50}ms`}}>
                                <td className="p-4">
                                  <div className="font-medium text-slate-200">{m.title}</div>
                                  {m.description && <div className="text-sm text-slate-400">{m.description}</div>}
                                </td>
                                <td className="p-4">
                                  <span className="bg-blue-900/50 text-blue-300 px-2 py-1 rounded text-xs uppercase border border-blue-500/30">
                                    {m.material_type}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <div className="text-slate-300">{m.subject}</div>
                                  <div className="text-sm text-slate-400">{m.class_level || 'All Classes'}</div>
                                </td>
                                <td className="p-4 text-slate-300">
                                  {teacher ? teacher.full_name : (rpcError ? 'Unknown (Run SQL script)' : 'Loading...')}
                                </td>
                                <td className="p-4">
                                  <a
                                    href={m.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary-400 hover:text-primary-300 transition-colors text-sm font-medium"
                                  >
                                    View File
                                  </a>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'enrollments' && (
                <div className="dash-card overflow-hidden animate-fade-in">
                  <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-white">Student Enrollments</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="border-b border-white/10 animate-fade-in">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase border-b border-white/10">Student</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase border-b border-white/10">Class & Teacher</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase border-b border-white/10">Status</th>
                          <th className="px-6 py-4 text-right text-xs font-semibold tracking-wider text-slate-400 uppercase border-b border-white/10 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enrollments.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-0">
                              <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 empty-state-icon">
                                  <GraduationCap className="w-10 h-10 text-primary-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">No data found</h3>
                                <p className="text-slate-400">There are no records to display here yet.</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          (() => {
                            // Group enrollments
                            const groups = Object.values(enrollments.reduce((acc, e) => {
                              const key = `${e.student_name}_${e.class_name}_${e.teacher_name}`
                              if (!acc[key]) {
                                acc[key] = {
                                  key,
                                  student_name: e.student_name,
                                  class_name: e.class_name,
                                  teacher_name: e.teacher_name,
                                  items: []
                                }
                              }
                              acc[key].items.push(e)
                              return acc
                            }, {}))

                            // Sort so groups with pending items are at the top
                            groups.sort((a, b) => {
                              const aPending = a.items.some((i) => i.status === 'pending')
                              const bPending = b.items.some((i) => i.status === 'pending')
                              if (aPending && !bPending) return -1
                              if (!aPending && bPending) return 1
                              return 0
                            })

                            return groups.map((g) => {
                              const hasPending = g.items.some((i) => i.status === 'pending')
                              const isExpanded = expandedGroups.has(g.key)

                              return (
                                <React.Fragment key={g.key}>
                                  <tr
                                    onClick={() => {
                                      const newSet = new Set(expandedGroups)
                                      if (newSet.has(g.key)) newSet.delete(g.key)
                                      else newSet.add(g.key)
                                      setExpandedGroups(newSet)
                                    }}
                                    className={`table-row-hover border-b border-white/10 cursor-pointer ${hasPending ? 'bg-yellow-500/5' : ''}`}
                                  >
                                    <td className="p-4 font-medium text-slate-200">
                                      <div className="flex items-center gap-2">
                                        <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                        {g.student_name}
                                      </div>
                                    </td>
                                    <td className="p-4 text-slate-300">
                                      <span className="font-semibold text-white">{g.class_name}</span>
                                      <span className="mx-2 text-slate-500">•</span>
                                      Teacher: {g.teacher_name}
                                    </td>
                                    <td className="p-4">
                                      {hasPending ? (
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/20">Action Required</span>
                                      ) : (
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/20">Processed</span>
                                      )}
                                    </td>
                                    <td className="p-4 text-right text-sm text-primary-400 font-medium">
                                      {isExpanded ? 'Hide Subjects' : `View ${g.items.length} Subject${g.items.length > 1 ? 's' : ''}`}
                                    </td>
                                  </tr>

                                  {isExpanded && g.items.map((e) => (
                                    <tr key={e.id} className="bg-black/20 border-b border-white/5">
                                      <td className="p-4 pl-10 text-slate-400 text-sm">
                                        Subject: <span className="text-slate-200 font-medium">{e.subject}</span>
                                      </td>
                                      <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[e.status]}`}>
                                          {e.status}
                                        </span>
                                      </td>
                                      <td colSpan={2} className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                          <select
                                            value={e.status}
                                            onChange={(evt) => updateEnrollmentStatus(e.id, evt.target.value)}
                                            className="text-sm border border-white/20 rounded px-2 py-1 bg-slate-800 text-white focus:ring-primary-500 focus:border-primary-500"
                                            onClick={(evt) => evt.stopPropagation()}
                                          >
                                            <option value="pending">Pending</option>
                                            <option value="approved">Approve</option>
                                            <option value="rejected">Reject</option>
                                          </select>
                                          <button
                                            onClick={(evt) => {
                                              evt.stopPropagation()
                                              deleteEnrollment(e.id)
                                            }}
                                            className="text-red-400 hover:text-red-300 p-1.5 bg-red-400/10 hover:bg-red-400/20 rounded"
                                            title="Delete Enrollment"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </React.Fragment>
                              )
                            })
                          })()
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'announcements' && (
                <div className="space-y-6">
                  <div className="dash-card p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Send New Announcement</h3>
                    <form onSubmit={handleSendAnnouncement} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
                        <input type="text" required value={annTitle} onChange={e => setAnnTitle(e.target.value)} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" placeholder="Announcement Title" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Message</label>
                        <textarea required value={annMessage} onChange={e => setAnnMessage(e.target.value)} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white h-24" placeholder="Type your message here..."></textarea>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Target Audience</label>
                        <select value={annTarget} onChange={e => setAnnTarget(e.target.value)} className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white">
                          <option value="all">Both Teachers & Students</option>
                          <option value="teachers_only">Teachers Only</option>
                          <option value="students_only">Students Only</option>
                        </select>
                      </div>
                      <button type="submit" disabled={sendingAnn} className="w-full sm:w-auto bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50">
                        {sendingAnn ? 'Sending...' : 'Send Announcement'}
                      </button>
                    </form>
                  </div>

                  <div className="dash-card overflow-hidden animate-fade-in">
                    <div className="p-6 border-b border-white/10 flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-white">Announcement History</h2>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="border-b border-white/10 animate-fade-in">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase border-b border-white/10">Announcement</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase border-b border-white/10">Target / Class</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase border-b border-white/10">Sender</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase border-b border-white/10">Date Posted</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase border-b border-white/10">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {announcements.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="p-0">
                                <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
                                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 empty-state-icon">
                                    <Bell className="w-10 h-10 text-primary-400" />
                                  </div>
                                  <h3 className="text-xl font-bold text-white mb-2">No data found</h3>
                                  <p className="text-slate-400">There are no records to display here yet.</p>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            announcements.map((m, index) => {
                              const sender = users.find(u => u.id === m.sender_id);
                              return (
                                <tr key={m.id} className="table-row-hover border-b border-white/10 animate-fade-in-up" style={{animationDelay: `${index * 50}ms`}}>
                                  <td className="p-4">
                                    <div className="font-bold text-white text-lg">{m.title}</div>
                                    <div className="text-sm text-slate-300 mt-1 bg-white/5 p-2 rounded">{m.message}</div>
                                  </td>
                                  <td className="p-4">
                                    <div className="text-slate-300 capitalize">{m.target_audience.replace('_', ' ')}</div>
                                    <div className="text-sm text-slate-400">{m.class_name || 'Global'}</div>
                                  </td>
                                  <td className="p-4 text-slate-300 font-medium">
                                    {sender ? `${sender.full_name} (${sender.role === 'teacher' ? 'Teacher' : sender.role})` : 'Admin (You)'}
                                  </td>
                                  <td className="p-4 text-sm text-slate-400">
                                    {new Date(m.created_at).toLocaleDateString()}
                                  </td>
                                  <td className="p-4">
                                    <button
                                      onClick={() => deleteAnnouncement(m.id)}
                                      className="text-red-400 hover:text-red-300 transition-colors p-2"
                                      title="Delete Announcement"
                                    >
                                      <Trash2 className="w-5 h-5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'contacts' && (
                <div className="dash-card overflow-hidden animate-fade-in">
                  <div className="p-6 border-b border-white/10">
                    <h2 className="text-xl font-semibold text-white">Contact Form Submissions</h2>
                  </div>
                  {contacts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 empty-state-icon">
                        <MessageSquare className="w-10 h-10 text-primary-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">No data found</h3>
                      <p className="text-slate-400">There are no records to display here yet.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {contacts.map((contact, index) => (
                        <div key={contact.id} className="p-6 glass-card hover-lift animate-fade-in-up" style={{animationDelay: `${index * 50}ms`}}>
                          <div className="flex flex-col sm:flex-row justify-between gap-4">
                            <div>
                              <div className="font-medium text-white">{contact.name}</div>
                              <div className="text-sm text-slate-400">{contact.email}</div>
                              {contact.phone && (
                                <a href={`tel:${contact.phone}`} className="text-sm text-primary-600 hover:underline">
                                  {contact.phone}
                                </a>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0">
                              <div className="text-sm text-gray-400">
                                {new Date(contact.created_at).toLocaleDateString()}
                              </div>
                              <button
                                onClick={() => deleteContact(contact.id)}
                                className="text-red-400 hover:text-red-300 transition-colors p-1"
                                title="Delete Message"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                          <p className="mt-3 text-slate-300 bg-white/10 backdrop-blur-md border border-white/10/5 backdrop-blur-sm rounded-lg p-3">{contact.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'testimonials' && (
                <div className="dash-card overflow-hidden animate-fade-in">
                  <div className="p-6 border-b border-white/10">
                    <h2 className="text-xl font-semibold text-white">Testimonials</h2>
                  </div>
                  {testimonials.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 empty-state-icon">
                        <Star className="w-10 h-10 text-primary-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">No data found</h3>
                      <p className="text-slate-400">There are no records to display here yet.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {testimonials.map((testimonial, index) => (
                        <div key={testimonial.id} className="p-6 glass-card hover-lift animate-fade-in-up" style={{animationDelay: `${index * 50}ms`}}>
                          <div className="flex flex-col sm:flex-row justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-medium text-white">{testimonial.name}</span>
                                {testimonial.role && (
                                  <span className="text-sm text-slate-400">{testimonial.role}</span>
                                )}
                                {testimonial.is_approved ? (
                                  <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">Approved</span>
                                ) : (
                                  <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full">Pending</span>
                                )}
                              </div>
                              {testimonial.rating && (
                                <div className="flex gap-0.5 mb-2">
                                  {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                                  ))}
                                </div>
                              )}
                              <p className="text-slate-300">{testimonial.content}</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              {!testimonial.is_approved ? (
                                <button
                                  onClick={() => approveTestimonial(testimonial.id, true)}
                                  className="text-green-600 hover:text-green-700 flex items-center gap-1 text-sm"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Approve
                                </button>
                              ) : (
                                <button
                                  onClick={() => approveTestimonial(testimonial.id, false)}
                                  className="text-red-600 hover:text-red-700 flex items-center gap-1 text-sm"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Unapprove
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
