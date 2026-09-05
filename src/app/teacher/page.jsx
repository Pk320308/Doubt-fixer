'use client'

import { useState, useEffect } from 'react'
import { 
  Upload, FileText, Trash2, X, BookOpen, 
  ClipboardCheck, BarChart, 
  Calendar, Clock, Bell, ChevronDown
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import QuizBuilder from '@/components/QuizBuilder'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function TeacherDashboard() {
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState('materials')
  const [loading, setLoading] = useState(true)
  const [rpcError, setRpcError] = useState(null)
  
  // Data States
  const [materials, setMaterials] = useState([])
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState([])
  const [tests, setTests] = useState([])
  const [performance, setPerformance] = useState([])
  const [schedules, setSchedules] = useState([])
  const [announcements, setAnnouncements] = useState([])

  // Global Lists
  const [subjects, setSubjects] = useState([])
  
  const types = [
    { value: 'notes', label: 'Study Notes (PDF, DOC, PPT)' },
    { value: 'assignment', label: 'Assignment' },
    { value: 'worksheet', label: 'Worksheet' },
    { value: 'resource', label: 'Learning Resource' },
  ]
  const classes = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Trading', 'Google Advertising', 'Data Entry']

  // Form Visibility
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [managingTest, setManagingTest] = useState(null)
  const [expandedPerformance, setExpandedPerformance] = useState(null)

  // Forms Data
  const [uploadData, setUploadData] = useState({
    title: '', description: '', file_url: '', material_type: 'notes', subject: '', class_level: ''
  })
  const [testData, setTestData] = useState({
    title: '', description: '', class_name: '', subject: '', test_date: '', test_link: '', max_marks: 100
  })
  const [classData, setClassData] = useState({
    class_name: '', subject: '', timing: '', days: ''
  })
  const [attendanceData, setAttendanceData] = useState({
    student_id: '', class_name: '', date: new Date().toISOString().split('T')[0], status: 'present'
  })
  const [perfData, setPerfData] = useState({
    student_id: '', test_name: '', marks_obtained: 0, total_marks: 100, remarks: ''
  })
  const [annData, setAnnData] = useState({
    title: '', message: '', target_audience: 'students_only', class_name: ''
  })

  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchSubjects()
  }, [])

  useEffect(() => {
    fetchData(activeTab)
    // Always fetch students just in case
    fetchStudents()
  }, [activeTab])

  async function fetchSubjects() {
    const { data } = await supabase.from('subjects').select('name').order('created_at', { ascending: true })
    if (data) {
      setSubjects(data.map((s) => s.name))
    }
  }

  async function fetchStudents() {
    const { data } = await supabase.rpc('get_students_for_teachers')
    if (data) setStudents(data)
  }

  async function fetchData(tab) {
    setLoading(true)
    setRpcError(null)
    try {
      if (tab === 'materials') {
        const { data } = await supabase.from('materials').select('*').eq('teacher_id', profile?.id).order('created_at', { ascending: false })
        if (data) setMaterials(data)
      } else if (tab === 'attendance') {
        const { data, error } = await supabase.from('attendance').select('*').eq('teacher_id', profile?.id).order('date', { ascending: false })
        if (error) throw error
        if (data) setAttendance(data)
      } else if (tab === 'tests') {
        const { data, error } = await supabase.from('tests').select('*').eq('teacher_id', profile?.id).order('test_date', { ascending: false })
        if (error) throw error
        if (data) setTests(data)
      } else if (tab === 'performance') {
        const { data, error } = await supabase.from('student_performance').select('*').eq('teacher_id', profile?.id).order('created_at', { ascending: false })
        if (error) throw error
        if (data) setPerformance(data)
      } else if (tab === 'classes') {
        const { data, error } = await supabase.from('classes_schedule').select('*').eq('teacher_id', profile?.id).order('created_at', { ascending: false })
        if (error) throw error
        if (data) setSchedules(data)
      } else if (tab === 'announcements') {
        // Teachers see announcements they sent AND announcements targeting teachers_only/all sent by admin
        const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })
        if (error) throw error
        if (data) setAnnouncements(data)
      }
    } catch (err) {
      setRpcError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Action Handlers
  async function handleUpload(e) {
    e.preventDefault()
    setSubmitting(true)
    const { error } = await supabase.from('materials').insert([{ ...uploadData, teacher_id: profile?.id }])
    setSubmitting(false)
    if (!error) {
      setShowUploadForm(false)
      setUploadData({ title: '', description: '', file_url: '', material_type: 'notes', subject: '', class_level: '' })
      fetchData('materials')
    } else alert(error.message)
  }

  async function handleCreateTest(e) {
    e.preventDefault()
    setSubmitting(true)
    const { error } = await supabase.from('tests').insert([{ ...testData, teacher_id: profile?.id }])
    setSubmitting(false)
    if (!error) {
      setTestData({ title: '', description: '', class_name: '', subject: '', test_date: '', test_link: '', max_marks: 100 })
      fetchData('tests')
    } else alert(error.message)
  }

  async function handleAddClass(e) {
    e.preventDefault()
    setSubmitting(true)
    const { error } = await supabase.from('classes_schedule').insert([{ ...classData, teacher_id: profile?.id }])
    setSubmitting(false)
    if (!error) {
      setClassData({ class_name: '', subject: '', timing: '', days: '' })
      fetchData('classes')
    } else alert(error.message)
  }

  async function handleMarkAttendance(e) {
    e.preventDefault()
    setSubmitting(true)
    
    // Check if attendance already exists for this student, class, and date
    const { data: existing } = await supabase
      .from('attendance')
      .select('id')
      .eq('student_id', attendanceData.student_id)
      .eq('class_name', attendanceData.class_name)
      .eq('date', attendanceData.date)
      .single()

    if (existing) {
      setSubmitting(false)
      alert('Attendance for this student has already been marked for this date and class.')
      return
    }

    const { error } = await supabase.from('attendance').insert([{ ...attendanceData, teacher_id: profile?.id }])
    setSubmitting(false)
    if (!error) {
      alert('Attendance marked!')
      fetchData('attendance')
    } else alert(error.message)
  }

  async function handleAddPerformance(e) {
    e.preventDefault()
    setSubmitting(true)
    const { error } = await supabase.from('student_performance').insert([{ ...perfData, teacher_id: profile?.id }])
    setSubmitting(false)
    if (!error) {
      setPerfData({ student_id: '', test_name: '', marks_obtained: 0, total_marks: 100, remarks: '' })
      fetchData('performance')
      alert('Performance saved!')
    } else alert(error.message)
  }

  async function handleDelete(table, id) {
    if (!confirm('Are you sure you want to delete this record?')) return
    await supabase.from(table).delete().eq('id', id)
    fetchData(activeTab)
  }

  async function handleSendAnnouncement(e) {
    e.preventDefault()
    setSubmitting(true)
    const { error } = await supabase.from('announcements').insert([{ 
      ...annData, 
      sender_id: profile?.id 
    }])
    setSubmitting(false)
    if (!error) {
      setAnnData({ title: '', message: '', target_audience: 'students_only', class_name: '' })
      fetchData('announcements')
      alert('Announcement sent to your students!')
    } else alert(error.message)
  }

  const typeColors = {
    notes: 'text-blue-400',
    assignment: 'text-purple-400',
    worksheet: 'text-green-400',
    announcement: 'text-orange-400',
    resource: 'text-teal-400',
  }

  const navTabs = [
    { id: 'materials', label: 'Upload Materials', icon: FileText },
    { id: 'tests', label: 'Online Tests', icon: BookOpen },
    { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
    { id: 'performance', label: 'Performance', icon: BarChart },
    { id: 'announcements', label: 'Announcements', icon: Bell },
  ]

  const getStudentName = (id) => {
    const s = students.find(s => s.id === id);
    return s ? `${s.full_name} (ID: ${s.id.substring(0, 6).toUpperCase()})` : 'Unknown Student';
  }

  const getStaggerDelay = (index) => {
    const delays = ['delay-100', 'delay-200', 'delay-300', 'delay-400', 'delay-500'];
    return delays[Math.min(index, delays.length - 1)];
  };

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <div className="min-h-screen relative overflow-hidden bg-transparent">
        <div className="bg-orb bg-orb-1"></div>
        <div className="bg-orb bg-orb-2"></div>
        <div className="bg-orb bg-orb-3"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="animate-fade-in-down">
              <h1 className="text-2xl md:text-3xl font-bold text-white">Teacher Dashboard</h1>
              <p className="text-slate-300 mt-1">Welcome, {profile?.full_name}!</p>
            </div>
            {activeTab === 'materials' && (
              <button
                onClick={() => setShowUploadForm(true)}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center gap-2 animate-fade-in delay-200 hover-glow"
              >
                <Upload className="w-5 h-5" /> Upload Material
              </button>
            )}
          </div>

          <div className="flex flex-nowrap md:flex-wrap gap-3 p-2 bg-black/20 rounded-2xl border border-white/5 w-full md:w-max max-w-full overflow-x-auto hide-scrollbar mb-8 animate-fade-in-up delay-200">
            {navTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pill-tab px-5 py-2.5 flex items-center gap-2 whitespace-nowrap font-medium text-sm transition-all flex-shrink-0 ${activeTab === tab.id ? 'active shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <tab.icon className="w-5 h-5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {rpcError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center mb-6 animate-fade-in">
              <h3 className="text-xl font-semibold text-red-400 mb-2">Database Setup Required</h3>
              <p className="text-red-200 mb-4">
                The necessary database tables for this feature do not exist. Please run the <strong>teacher-features.sql</strong> script in your Supabase SQL Editor.
              </p>
              <p className="text-sm text-red-300">Error: {rpcError}</p>
            </div>
          )}

          {!rpcError && loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : !rpcError && (
            <div className="space-y-6 animate-fade-in">
              
              {/* MATERIALS TAB */}
              {activeTab === 'materials' && (
                <div className="dash-card p-6 md:p-8">
                  <h2 className="text-xl font-semibold text-white mb-6">My Uploaded Materials</h2>
                  {materials.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="empty-state-icon mx-auto mb-4 w-16 h-16 flex items-center justify-center bg-white/5 rounded-full text-slate-400">
                        <FileText className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-1">No Materials Found</h3>
                      <p className="text-slate-400">You haven't uploaded any materials yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {materials.map((material, idx) => (
                        <div key={material.id} className={`flex flex-col sm:flex-row items-start justify-between dash-card p-6 hover-lift animate-fade-in-up ${getStaggerDelay(idx)}`}>
                          <div className="flex items-start gap-4">
                            <div className={`icon-box w-12 h-12 shrink-0 ${typeColors[material.material_type] || 'text-slate-300'}`}>
                              <FileText className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="font-medium text-white">{material.title}</h3>
                              {material.description && <p className="text-sm text-slate-400 mt-1 line-clamp-2">{material.description}</p>}
                              <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-slate-400">
                                <span className="badge-glass capitalize">{material.material_type}</span>
                                <span>{material.subject}</span>
                                {material.class_level && <span>• {material.class_level}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-row items-center gap-2 mt-4 sm:mt-0 pt-2 sm:pt-0">
                            <a href={material.file_url} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300 text-sm font-medium px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">View</a>
                            <button onClick={() => handleDelete('materials', material.id)} className="text-red-400 hover:text-red-300 p-2 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ONLINE TESTS TAB */}
              {activeTab === 'tests' && (
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1 dash-card p-6 md:p-8 h-fit animate-fade-in-left">
                    <h3 className="text-lg font-semibold text-white mb-4">Create Online Test</h3>
                    <form onSubmit={handleCreateTest} className="space-y-4">
                      <input type="text" required placeholder="Test Title" value={testData.title} onChange={e => setTestData({...testData, title: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors outline-none" />
                      <select required value={testData.class_name} onChange={e => setTestData({...testData, class_name: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-primary-500 transition-colors [&>option]:bg-slate-900">
                        <option value="">Select Class</option>
                        {classes.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <select required value={testData.subject} onChange={e => setTestData({...testData, subject: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-primary-500 transition-colors [&>option]:bg-slate-900">
                        <option value="">Select Subject</option>
                        {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <input type="date" required value={testData.test_date} onChange={e => setTestData({...testData, test_date: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-primary-500 transition-colors" />
                      <input type="number" required placeholder="Max Marks" value={testData.max_marks} onChange={e => setTestData({...testData, max_marks: Number(e.target.value)})} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-primary-500 transition-colors" />
                      <input type="url" placeholder="External Test Link (Optional)" value={testData.test_link} onChange={e => setTestData({...testData, test_link: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:border-primary-500 outline-none transition-colors" />
                      <div className="bg-primary-500/10 border border-primary-500/20 p-4 rounded-xl text-xs text-primary-200">
                        <strong className="text-primary-300 block mb-1">Important:</strong> If you use an External Link, you must manually enter student marks. Without a link, results are automatically calculated.
                      </div>
                      <button type="submit" disabled={submitting} className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-semibold hover:bg-primary-700 hover-glow transition-all">Create Test</button>
                    </form>
                  </div>
                  <div className="lg:col-span-2 dash-card p-6 md:p-8 animate-fade-in-right delay-200">
                    <h3 className="text-lg font-semibold text-white mb-6">Scheduled Tests</h3>
                    <div className="space-y-4">
                      {tests.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="empty-state-icon mx-auto mb-4 w-16 h-16 flex items-center justify-center bg-white/5 rounded-full text-slate-400">
                            <BookOpen className="w-8 h-8" />
                          </div>
                          <p className="text-slate-400">No tests scheduled yet.</p>
                        </div>
                      ) : tests.map((t, idx) => (
                        <div key={t.id} className={`dash-card p-6 flex flex-col sm:flex-row gap-4 sm:justify-between items-start sm:items-center hover-glow animate-fade-in-up ${getStaggerDelay(idx)}`}>
                          <div>
                            <h4 className="font-medium text-white text-lg">{t.title}</h4>
                            <p className="text-sm text-slate-400 mt-1">{t.class_name} • {t.subject} • {new Date(t.test_date).toLocaleDateString()}</p>
                            {t.test_link && <a href={t.test_link} target="_blank" className="text-primary-400 text-sm hover:underline mt-2 inline-block badge-glass">External Link</a>}
                          </div>
                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            <button onClick={() => setManagingTest({ id: t.id, title: t.title })} className="flex-1 sm:flex-none bg-white/10 hover:bg-white/20 text-white border border-white/5 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                              Manage Questions
                            </button>
                            <button onClick={() => handleDelete('tests', t.id)} className="text-red-400 hover:text-red-300 p-2 bg-red-500/10 rounded-lg transition-colors hover:bg-red-500/20"><Trash2 className="w-5 h-5" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ATTENDANCE TAB */}
              {activeTab === 'attendance' && (
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1 dash-card p-6 md:p-8 h-fit animate-fade-in-left">
                    <h3 className="text-lg font-semibold text-white mb-4">Mark Attendance</h3>
                    <form onSubmit={handleMarkAttendance} className="space-y-4">
                      <input type="date" required value={attendanceData.date} onChange={e => setAttendanceData({...attendanceData, date: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-primary-500 transition-colors" />
                      <select required value={attendanceData.class_name} onChange={e => setAttendanceData({...attendanceData, class_name: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-primary-500 transition-colors [&>option]:bg-slate-900">
                        <option value="">Select Class</option>
                        {classes.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <select required value={attendanceData.student_id} onChange={e => setAttendanceData({...attendanceData, student_id: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-primary-500 transition-colors [&>option]:bg-slate-900">
                        <option value="">Select Student</option>
                        {students.map(s => <option key={s.id} value={s.id}>{s.full_name} (ID: {s.id.substring(0, 6).toUpperCase()})</option>)}
                      </select>
                      <div className="flex gap-4 pt-2">
                        <label className="flex items-center gap-2 text-white cursor-pointer"><input type="radio" name="status" value="present" checked={attendanceData.status === 'present'} onChange={e => setAttendanceData({...attendanceData, status: e.target.value})} className="accent-primary-500 w-4 h-4" /> Present</label>
                        <label className="flex items-center gap-2 text-white cursor-pointer"><input type="radio" name="status" value="absent" checked={attendanceData.status === 'absent'} onChange={e => setAttendanceData({...attendanceData, status: e.target.value})} className="accent-primary-500 w-4 h-4" /> Absent</label>
                      </div>
                      <button type="submit" disabled={submitting} className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition-all hover-glow mt-2">Save Record</button>
                    </form>
                  </div>
                  <div className="lg:col-span-2 dash-card p-6 md:p-8 overflow-x-auto animate-fade-in-right delay-200">
                    <h3 className="text-lg font-semibold text-white mb-6">Recent Records</h3>
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/10 text-slate-400">
                          <th className="py-3 px-4 font-medium">Date</th>
                          <th className="py-3 px-4 font-medium">Student</th>
                          <th className="py-3 px-4 font-medium">Class</th>
                          <th className="py-3 px-4 font-medium">Status</th>
                          <th className="py-3 px-4 font-medium"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendance.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-slate-400">
                              <div className="empty-state-icon mx-auto mb-3 w-12 h-12 flex items-center justify-center bg-white/5 rounded-full text-slate-400">
                                <ClipboardCheck className="w-6 h-6" />
                              </div>
                              No records found
                            </td>
                          </tr>
                        ) : attendance.map((a, idx) => (
                          <tr key={a.id} className={`table-row-hover animate-fade-in ${getStaggerDelay(idx)}`}>
                            <td className="py-3 px-4 text-slate-200">{new Date(a.date).toLocaleDateString()}</td>
                            <td className="py-3 px-4 text-white font-medium">{getStudentName(a.student_id)}</td>
                            <td className="py-3 px-4 text-slate-300">{a.class_name}</td>
                            <td className="py-3 px-4">
                              <span className={`badge-glass ${a.status === 'present' ? 'badge-glow-green' : 'badge-glow-red'}`}>
                                {a.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button onClick={() => handleDelete('attendance', a.id)} className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PERFORMANCE TAB */}
              {activeTab === 'performance' && (
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1 dash-card p-6 md:p-8 h-fit animate-fade-in-left">
                    <h3 className="text-lg font-semibold text-white mb-4">Log Performance</h3>
                    <div className="mb-6 p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl text-xs text-primary-200">
                      <strong className="text-primary-300 block mb-1">Note:</strong> Only use this manual form if you provided an External Test Link. Built-in tests record marks automatically.
                    </div>
                    <form onSubmit={handleAddPerformance} className="space-y-4">
                      <select required value={perfData.student_id} onChange={e => setPerfData({...perfData, student_id: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-primary-500 transition-colors [&>option]:bg-slate-900">
                        <option value="">Select Student</option>
                        {students.map(s => <option key={s.id} value={s.id}>{s.full_name} (ID: {s.id.substring(0, 6).toUpperCase()})</option>)}
                      </select>
                      <input type="text" required placeholder="Test Name / Subject" value={perfData.test_name} onChange={e => setPerfData({...perfData, test_name: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-400 outline-none focus:border-primary-500 transition-colors" />
                      <div className="grid grid-cols-2 gap-4">
                        <input type="number" required placeholder="Marks" value={perfData.marks_obtained} onChange={e => setPerfData({...perfData, marks_obtained: Number(e.target.value)})} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-primary-500 transition-colors" />
                        <input type="number" required placeholder="Out Of" value={perfData.total_marks} onChange={e => setPerfData({...perfData, total_marks: Number(e.target.value)})} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-primary-500 transition-colors" />
                      </div>
                      <textarea placeholder="Feedback / Remarks" value={perfData.remarks} onChange={e => setPerfData({...perfData, remarks: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-400 outline-none focus:border-primary-500 transition-colors" rows={3} />
                      <button type="submit" disabled={submitting} className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition-all hover-glow mt-2">Log Performance</button>
                    </form>
                  </div>
                  <div className="lg:col-span-2 dash-card p-6 md:p-8 overflow-x-auto animate-fade-in-right delay-200">
                    <h3 className="text-lg font-semibold text-white mb-6">Performance Log</h3>
                    
                    {performance.length === 0 ? (
                      <div className="py-12 text-center bg-white/5 rounded-xl border border-white/5">
                        <div className="empty-state-icon mx-auto mb-4 w-16 h-16 flex items-center justify-center bg-white/5 rounded-full text-slate-400">
                          <BarChart className="w-8 h-8" />
                        </div>
                        <p className="text-slate-400">No performance records found.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {Object.entries(performance.reduce((acc, p) => {
                          if (!acc[p.test_name]) acc[p.test_name] = [];
                          acc[p.test_name].push(p);
                          return acc;
                        }, {})).map(([testName, records], idx) => (
                          <div key={testName} className={`dash-card overflow-hidden animate-fade-in-up ${getStaggerDelay(idx)}`}>
                            <button 
                              onClick={() => setExpandedPerformance(expandedPerformance === testName ? null : testName)}
                              className="w-full px-6 py-5 flex justify-between items-center hover:bg-white/5 text-left transition-colors"
                            >
                              <div>
                                <h4 className="font-bold text-white text-lg">{testName}</h4>
                                <p className="text-sm text-slate-400 mt-1">{records.length} Student{records.length !== 1 ? 's' : ''} Submitted</p>
                              </div>
                              <div className={`text-slate-400 bg-white/5 p-2 rounded-full border border-white/5 transition-transform duration-300 ${expandedPerformance === testName ? 'rotate-180' : ''}`}>
                                <ChevronDown className="w-5 h-5" />
                              </div>
                            </button>
                            
                            {expandedPerformance === testName && (
                              <div className="border-t border-white/10 bg-black/20 p-0 overflow-x-auto">
                                <table className="w-full text-left">
                                  <thead>
                                    <tr className="border-b border-white/10 text-slate-400 text-sm bg-white/5">
                                      <th className="py-3 px-6 font-medium">Student</th>
                                      <th className="py-3 px-6 font-medium">Score</th>
                                      <th className="py-3 px-6 font-medium">Remarks</th>
                                      <th className="py-3 px-6 font-medium w-10 text-center"></th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {records.map(p => (
                                      <tr key={p.id} className="table-row-hover text-white">
                                        <td className="py-4 px-6 whitespace-nowrap font-medium">{getStudentName(p.student_id)}</td>
                                        <td className="py-4 px-6 whitespace-nowrap font-bold text-primary-400">{p.marks_obtained} / {p.total_marks}</td>
                                        <td className="py-4 px-6 text-sm text-slate-300 min-w-[300px] whitespace-pre-wrap">{p.remarks || '-'}</td>
                                        <td className="py-4 px-6 text-center">
                                          <button onClick={() => handleDelete('student_performance', p.id)} className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ANNOUNCEMENTS TAB */}
              {activeTab === 'announcements' && (
                <div className="space-y-6">
                  <div className="dash-card p-6 md:p-8 h-fit animate-fade-in-left">
                    <h3 className="text-lg font-semibold text-white mb-4">Send New Announcement</h3>
                    <form onSubmit={handleSendAnnouncement} className="space-y-4">
                      <input type="text" required placeholder="Announcement Title" value={annData.title} onChange={e => setAnnData({...annData, title: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-400 outline-none focus:border-primary-500 transition-colors" />
                      <textarea required placeholder="Message" value={annData.message} onChange={e => setAnnData({...annData, message: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-400 outline-none focus:border-primary-500 transition-colors" rows={3} />
                      <select required value={annData.class_name} onChange={e => setAnnData({...annData, class_name: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-primary-500 transition-colors [&>option]:bg-slate-900">
                        <option value="">Select Target Class</option>
                        <option value="all_my_students">All My Students</option>
                        {classes.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <button type="submit" disabled={submitting} className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition-all hover-glow mt-2">Send Announcement</button>
                    </form>
                  </div>
                  
                  <div className="dash-card p-6 md:p-8 animate-fade-in-right delay-200">
                    <h3 className="text-lg font-semibold text-white mb-6">Announcement Feed</h3>
                    <div className="space-y-4">
                      {announcements.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="empty-state-icon mx-auto mb-4 w-16 h-16 flex items-center justify-center bg-white/5 rounded-full text-slate-400">
                            <Bell className="w-8 h-8" />
                          </div>
                          <p className="text-slate-400">No announcements yet.</p>
                        </div>
                      ) : announcements.map((a, idx) => (
                        <div key={a.id} className={`dash-card p-5 animate-fade-in-up ${getStaggerDelay(idx)}`}>
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-bold text-white text-lg">{a.title}</h4>
                            {a.sender_id === profile?.id && (
                              <button onClick={() => handleDelete('announcements', a.id)} className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                            )}
                          </div>
                          <p className="text-slate-300 mb-4 whitespace-pre-wrap">{a.message}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs font-medium">
                            <span className={`badge-glass ${a.sender_id === profile?.id ? 'badge-glow-primary' : 'badge-glow-yellow'}`}>
                              {a.sender_id === profile?.id ? 'Sent by me' : 'From Admin'}
                            </span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-400">Target: {a.class_name && a.class_name !== 'all_my_students' ? a.class_name : a.target_audience.replace('_', ' ')}</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-400">{new Date(a.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* UPLOAD MODAL */}
          {showUploadForm && activeTab === 'materials' && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-backdrop-in">
              <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-lg w-full p-6 md:p-8 max-h-[90vh] overflow-y-auto animate-modal-in shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-white">Upload Material</h2>
                  <button onClick={() => setShowUploadForm(false)} className="text-slate-400 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleUpload} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Title *</label>
                    <input type="text" required value={uploadData.title} onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-primary-500 transition-colors" placeholder="Material title" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
                    <textarea value={uploadData.description} onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-primary-500 transition-colors" rows={3} placeholder="Brief description"></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">File URL *</label>
                    <input type="url" required value={uploadData.file_url} onChange={(e) => setUploadData({ ...uploadData, file_url: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-primary-500 transition-colors" placeholder="https://drive.google.com/..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Material Type *</label>
                    <select required value={uploadData.material_type} onChange={(e) => setUploadData({ ...uploadData, material_type: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-primary-500 transition-colors [&>option]:bg-slate-900">
                      {types.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Subject *</label>
                      <select required value={uploadData.subject} onChange={(e) => setUploadData({ ...uploadData, subject: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-primary-500 transition-colors [&>option]:bg-slate-900">
                        <option value="">Select Subject</option>
                        {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Class</label>
                      <select value={uploadData.class_level} onChange={(e) => setUploadData({ ...uploadData, class_level: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-primary-500 transition-colors [&>option]:bg-slate-900">
                        <option value="">All Classes</option>
                        {classes.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <button type="submit" disabled={submitting} className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-all hover-glow disabled:opacity-50 mt-6">
                    {submitting ? 'Uploading...' : 'Upload Material'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* QUIZ BUILDER MODAL */}
          {managingTest && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-backdrop-in">
              <div className="w-full max-w-4xl animate-modal-in">
                <QuizBuilder 
                  testId={managingTest.id}
                  testTitle={managingTest.title}
                  onClose={() => setManagingTest(null)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
