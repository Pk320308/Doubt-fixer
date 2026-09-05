'use client'

import { useState, useEffect } from 'react'
import { BookOpen, FileText, ClipboardCheck, Bell, Download, GraduationCap, CheckCircle, XCircle, Clock, PenTool, Target, Calendar, BarChart, Award } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import TakeQuiz from '@/components/TakeQuiz'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function StudentDashboard() {
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState('materials')
  const [materials, setMaterials] = useState([])
  const [tests, setTests] = useState([])
  const [performances, setPerformances] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState('all')
  const [enrollmentError, setEnrollmentError] = useState(null)

  // Enrollment Form State
  const [enrollData, setEnrollData] = useState({
    class_name: '', subjects: [], teacher_id: ''
  })
  const [enrolling, setEnrolling] = useState(false)
  const [takingTest, setTakingTest] = useState(null)

  const [subjectsList, setSubjectsList] = useState([])
  const classesList = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Trading', 'Google Advertising', 'Data Entry']

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)

    // Fetch Enrollments
    const { data: enrollData } = await supabase
      .from('student_enrollments')
      .select('*')
      .eq('student_id', profile?.id)
      .order('created_at', { ascending: false })

    if (enrollData) {
      setEnrollments(enrollData)
    }

    // Fetch dynamic subjects
    const { data: subjectData } = await supabase.from('subjects').select('name').order('created_at', { ascending: true })
    if (subjectData) {
      setSubjectsList(subjectData.map((s) => s.name))
    }

    // Fetch Teachers for the form
    const { data: teacherData, error: teacherError } = await supabase.rpc('get_active_teachers')
    if (teacherError) {
      setEnrollmentError("Database Error: Teachers could not be loaded because the SQL script was not run correctly. Please run master-database-setup.sql in Supabase.")
    } else if (teacherData) {
      setTeachers(teacherData)
    }

    const approvedEnrollments = (enrollData || []).filter(e => e.status === 'approved')
    const approvedClasses = [...new Set(approvedEnrollments.map(e => e.class_name))]
    const approvedSubjects = [...new Set(approvedEnrollments.map(e => e.subject))]

    if (approvedClasses.length > 0) {
      const { data: matData } = await supabase
        .from('materials')
        .select('*')
        .in('class_level', approvedClasses)
        .in('subject', approvedSubjects)
        .order('created_at', { ascending: false })
      if (matData) {
        const filteredMats = matData.filter(m => 
          approvedEnrollments.some(e => e.class_name === m.class_level && e.subject === m.subject)
        )
        setMaterials(filteredMats)
      }

      const { data: testData } = await supabase
        .from('tests')
        .select('*')
        .in('class_name', approvedClasses)
        .in('subject', approvedSubjects)
        .order('test_date', { ascending: false })
      if (testData) {
        const filteredTests = testData.filter(t => 
          approvedEnrollments.some(e => e.class_name === t.class_name && e.subject === t.subject)
        )
        setTests(filteredTests)
      }

      const { data: perfData } = await supabase
        .from('student_performance')
        .select('*')
        .eq('student_id', profile?.id)
        .order('created_at', { ascending: false })
      if (perfData) setPerformances(perfData)

      const { data: annData } = await supabase
        .from('announcements')
        .select('*')
        .in('target_audience', ['students_only', 'all'])
        .order('created_at', { ascending: false })
      if (annData) {
        // Filter announcements: show if it targets their class or if it's global (null/empty)
        const filtered = annData.filter(a => !a.class_name || approvedClasses.includes(a.class_name) || a.class_name === 'all_my_students')
        setAnnouncements(filtered)
      }
    } else {
      setMaterials([])
      setTests([])
      setPerformances([])
      setAnnouncements([])
      setActiveTab('enrollments') // Force to enrollments tab if no approved classes
    }

    setLoading(false)
  }

  async function handleEnroll(e) {
    e.preventDefault()
    
    const isRegularClass = enrollData.class_name.toLowerCase().startsWith('class')
    let finalSubjects = enrollData.subjects

    if (!isRegularClass) {
      finalSubjects = [enrollData.class_name]
    } else if (finalSubjects.length === 0) {
      setEnrollmentError("Please select at least one subject.")
      return
    }

    setEnrolling(true)
    setEnrollmentError(null)
    
    const inserts = finalSubjects.map(subject => ({
      student_id: profile?.id,
      teacher_id: enrollData.teacher_id,
      class_name: enrollData.class_name,
      subject: subject
    }))

    const { error } = await supabase.from('student_enrollments').insert(inserts)

    setEnrolling(false)
    if (error) {
      setEnrollmentError(error.message)
    } else {
      setEnrollData({ class_name: '', subjects: [], teacher_id: '' })
      fetchData() // Refresh enrollments
    }
  }

  const filteredMaterials = selectedType === 'all'
    ? materials
    : materials.filter((m) => m.material_type === selectedType)

  const typeIcons = {
    notes: BookOpen,
    assignment: FileText,
    worksheet: ClipboardCheck,
    announcement: Bell,
    resource: Download,
  }

  const typeColors = {
    notes: 'bg-blue-100 text-blue-600',
    assignment: 'bg-purple-100 text-purple-600',
    worksheet: 'bg-green-100 text-green-600',
    announcement: 'bg-orange-100 text-orange-600',
    resource: 'bg-teal-100 text-teal-600',
  }

  const approvedEnrollments = enrollments.filter(e => e.status === 'approved')
  const hasApproved = approvedEnrollments.length > 0

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="min-h-screen relative overflow-hidden bg-transparent">
        <div className="bg-orb bg-orb-1"></div>
        <div className="bg-orb bg-orb-2"></div>
        <div className="bg-orb bg-orb-3"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="animate-fade-in-down">
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Welcome, <span className="gradient-text">{profile?.full_name}</span>!
              </h1>
              <p className="text-slate-300 mt-1">Access study materials and track your performance.</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-nowrap md:flex-wrap gap-3 p-2 bg-black/20 rounded-2xl border border-white/5 w-full md:w-max max-w-full overflow-x-auto hide-scrollbar mb-8 animate-fade-in-up delay-200">
            <button
              onClick={() => setActiveTab('materials')}
              className={`pill-tab px-5 py-2.5 flex items-center gap-2 whitespace-nowrap font-medium text-sm transition-all flex-shrink-0 ${activeTab === 'materials' ? 'active shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <FileText className="w-5 h-5 shrink-0" />
              <span>Study Materials</span>
            </button>
            <button
              onClick={() => setActiveTab('tests')}
              className={`pill-tab px-5 py-2.5 flex items-center gap-2 whitespace-nowrap font-medium text-sm transition-all flex-shrink-0 ${activeTab === 'tests' ? 'active shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <BookOpen className="w-5 h-5 shrink-0" />
              <span>Online Tests</span>
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`pill-tab px-5 py-2.5 flex items-center gap-2 whitespace-nowrap font-medium text-sm transition-all flex-shrink-0 ${activeTab === 'performance' ? 'active shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <BarChart className="w-5 h-5 shrink-0" />
              <span>Performance</span>
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`pill-tab px-5 py-2.5 flex items-center gap-2 whitespace-nowrap font-medium text-sm transition-all flex-shrink-0 ${activeTab === 'announcements' ? 'active shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <Bell className="w-5 h-5 shrink-0" />
              <span>Announcements</span>
            </button>
            <button
              onClick={() => setActiveTab('enrollments')}
              className={`pill-tab px-5 py-2.5 flex items-center gap-2 whitespace-nowrap font-medium text-sm transition-all flex-shrink-0 ${activeTab === 'enrollments' ? 'active shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <Award className="w-5 h-5 shrink-0" />
              <span>My Enrollment</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 animate-fade-in">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
            </div>
          ) : (
            <>
              {activeTab === 'enrollments' && (
                <div className="grid lg:grid-cols-3 gap-6 animate-fade-in">
                  <div className="lg:col-span-1 dash-card h-fit animate-fade-in-left">
                    <h3 className="text-lg font-semibold text-white mb-4">Request Enrollment</h3>
                    <p className="text-sm text-slate-300 mb-4">Select a class, subject, and teacher to enroll.</p>
                    {enrollmentError && <div className="text-red-400 text-sm mb-4">{enrollmentError}</div>}
                    <form onSubmit={handleEnroll} className="space-y-4">
                      <select required value={enrollData.class_name} onChange={e => setEnrollData({...enrollData, class_name: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary-500">
                        <option value="" className="text-slate-900">Select Class / Course</option>
                        {classesList.map(c => <option key={c} value={c} className="text-slate-900">{c}</option>)}
                      </select>
                      {enrollData.class_name && enrollData.class_name.toLowerCase().startsWith('class') && (
                        <div className="bg-white/5 border border-white/20 p-3 rounded-lg">
                          <label className="block text-sm font-medium text-slate-300 mb-2">Select Subjects</label>
                          <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                            {subjectsList.map(s => (
                              <label key={s} className="flex items-center gap-2 text-white cursor-pointer hover:bg-white/5 p-1 rounded transition-colors">
                                <input 
                                  type="checkbox" 
                                  checked={enrollData.subjects.includes(s)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setEnrollData({...enrollData, subjects: [...enrollData.subjects, s]})
                                    } else {
                                      setEnrollData({...enrollData, subjects: enrollData.subjects.filter(sub => sub !== s)})
                                    }
                                  }}
                                  className="w-4 h-4 rounded border-white/20 text-primary-500 focus:ring-primary-500"
                                /> 
                                <span className="text-sm">{s}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                      <select required value={enrollData.teacher_id} onChange={e => setEnrollData({ ...enrollData, teacher_id: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary-500">
                        <option value="" className="text-slate-900">Select Teacher</option>
                        {teachers.map(t => <option key={t.id} value={t.id} className="text-slate-900">{t.full_name} (ID: {t.id.substring(0, 6).toUpperCase()})</option>)}
                      </select>
                      <button type="submit" disabled={enrolling} className="w-full bg-primary-600 text-white py-2 rounded-lg font-semibold hover:bg-primary-500 transition-colors">Request Access</button>
                    </form>
                  </div>

                  <div className="lg:col-span-2 dash-card animate-fade-in-right delay-200">
                    <h3 className="text-lg font-semibold text-white mb-4">My Enrollments</h3>
                    {enrollments.length === 0 ? (
                      <div className="text-center py-12 flex flex-col items-center justify-center animate-fade-in">
                        <div className="empty-state-icon mb-4">
                          <GraduationCap className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No Enrollments</h3>
                        <p className="text-slate-400">You haven't requested enrollment for any classes yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {enrollments.map((e, index) => {
                          const t = teachers.find(t => t.id === e.teacher_id)
                          return (
                            <div key={e.id} className="p-4 border border-white/10 rounded-xl bg-white/5 flex justify-between items-center hover-lift animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                              <div>
                                <h4 className="font-bold text-white text-lg">{e.class_name} - {e.subject}</h4>
                                <p className="text-sm text-slate-300">Teacher: {t ? t.full_name : 'Unknown'}</p>
                                <p className="text-xs text-slate-400 mt-1">Requested on {new Date(e.created_at).toLocaleDateString()}</p>
                              </div>
                              <div>
                                {e.status === 'approved' && <span className="flex items-center gap-1 badge-glass badge-glow-green text-green-300"><CheckCircle className="w-4 h-4" /> Approved</span>}
                                {e.status === 'pending' && <span className="flex items-center gap-1 badge-glass badge-glow-yellow text-yellow-300"><Clock className="w-4 h-4" /> Pending</span>}
                                {e.status === 'rejected' && <span className="flex items-center gap-1 badge-glass badge-glow-red text-red-300"><XCircle className="w-4 h-4" /> Rejected</span>}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!hasApproved && activeTab !== 'enrollments' && (
                <div className="dash-card text-center py-16 flex flex-col items-center justify-center animate-fade-in">
                  <div className="empty-state-icon mb-4">
                    <GraduationCap className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No Active Classes</h3>
                  <p className="text-slate-300 mb-6 max-w-md mx-auto">You need to enroll in a class and wait for admin approval before you can access this section.</p>
                  <button onClick={() => setActiveTab('enrollments')} className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-500 transition-colors">Go to Enrollments</button>
                </div>
              )}

              {hasApproved && activeTab === 'materials' && (
                <div className="bg-transparent rounded-xl shadow-sm animate-fade-in">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h2 className="text-xl font-semibold text-white">Class Materials</h2>
                    <div className="flex flex-wrap gap-2 p-1 bg-white/5 border border-white/10 rounded-xl">
                      <button
                        onClick={() => setSelectedType('all')}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedType === 'all' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-300 hover:text-white hover:bg-white/10'
                          }`}
                      >
                        All
                      </button>
                      {Object.keys(typeIcons)
                        .filter(type => type !== 'announcement')
                        .map((type) => (
                        <button
                          key={type}
                          onClick={() => setSelectedType(type)}
                          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${selectedType === type ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-300 hover:text-white hover:bg-white/10'
                            }`}
                        >
                          {type}s
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredMaterials.length === 0 ? (
                    <div className="dash-card text-center py-16 flex flex-col items-center justify-center animate-fade-in">
                      <div className="empty-state-icon mb-4">
                        <BookOpen className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">No Materials Found</h3>
                      <p className="text-slate-400">No materials available for your enrolled classes yet.</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredMaterials.map((material, index) => {
                        const Icon = typeIcons[material.material_type]
                        return (
                          <div key={material.id} className="dash-card hover-lift animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                            <div className="flex items-start gap-4">
                              <div className="icon-box shrink-0">
                                <Icon className="w-5 h-5 text-primary-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-white truncate">{material.title}</h3>
                                {material.description && <p className="text-sm text-slate-400 line-clamp-2 mt-1">{material.description}</p>}
                                <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                                  <span className="capitalize px-2 py-0.5 rounded-md bg-white/5 border border-white/10">{material.material_type}</span>
                                  <span>•</span>
                                  <span>{material.subject}</span>
                                </div>
                                <a href={material.file_url} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 text-sm font-medium bg-primary-600/20 text-primary-300 px-4 py-1.5 rounded-lg hover:bg-primary-600/30 transition-colors">View Material</a>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {hasApproved && activeTab === 'tests' && (
                <div className="bg-transparent rounded-xl shadow-sm animate-fade-in">
                  <div className="mb-6 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-white">Online Tests & Assessments</h2>
                  </div>
                  {tests.length === 0 ? (
                    <div className="dash-card text-center py-16 flex flex-col items-center justify-center animate-fade-in">
                      <div className="empty-state-icon mb-4">
                        <PenTool className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">No Tests Available</h3>
                      <p className="text-slate-400">No online tests available at the moment.</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {tests.map((test, index) => (
                        <div key={test.id} className="dash-card hover-lift animate-fade-in-up border-l-4 border-l-purple-500" style={{ animationDelay: `${index * 50}ms` }}>
                          <div className="flex items-center gap-4 mb-4">
                            <div className="icon-box">
                              <PenTool className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white">{test.title}</h3>
                              <p className="text-slate-400 text-sm">{test.subject} • {test.class_name}</p>
                            </div>
                          </div>
                          {test.description && <p className="text-sm text-slate-300 mb-5">{test.description}</p>}

                          <div className="grid grid-cols-2 gap-4 mb-5">
                            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                              <p className="text-xs text-slate-400 mb-1">Max Marks</p>
                              <p className="font-bold text-white text-lg">{test.max_marks}</p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                              <p className="text-xs text-slate-400 mb-1">Date</p>
                              <div className="flex items-center gap-1 text-white text-sm font-medium">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                {new Date(test.test_date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          {test.test_link && (
                            <a
                              href={test.test_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block w-full text-center bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 rounded-lg transition-colors border border-white/20 mb-3"
                            >
                              Open External Test
                            </a>
                          )}

                          <button
                            onClick={() => setTakingTest(test)}
                            className="block w-full text-center bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2.5 rounded-lg transition-colors shadow-lg shadow-purple-500/20"
                          >
                            Take Quiz Here
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {hasApproved && activeTab === 'announcements' && (
                <div className="bg-transparent rounded-xl shadow-sm animate-fade-in">
                  <div className="mb-6 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-white">Announcements</h2>
                  </div>
                  {announcements.length === 0 ? (
                    <div className="dash-card text-center py-16 flex flex-col items-center justify-center animate-fade-in">
                      <div className="empty-state-icon mb-4">
                        <Bell className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">No Announcements</h3>
                      <p className="text-slate-400">No announcements available.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {announcements.map((a, index) => (
                        <div key={a.id} className="dash-card animate-fade-in-up border-l-4 border-l-orange-500" style={{ animationDelay: `${index * 50}ms` }}>
                          <div className="flex items-center gap-4 mb-4">
                            <div className="icon-box shrink-0">
                              <Bell className="w-6 h-6 text-orange-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-white">{a.title}</h3>
                              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-medium">
                                <span className="capitalize px-2 py-0.5 rounded-md bg-white/5 border border-white/10">{a.target_audience.replace('_', ' ')}</span>
                                <span>•</span>
                                <span>{a.class_name || 'Global'}</span>
                                <span>•</span>
                                <span>{new Date(a.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-slate-300 bg-white/5 p-4 rounded-xl mt-4 border border-white/5">
                            {a.message}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {hasApproved && activeTab === 'performance' && (
                <div className="bg-transparent rounded-xl shadow-sm animate-fade-in">
                  <div className="mb-6 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-white">Performance Report</h2>
                  </div>
                  {performances.length === 0 ? (
                    <div className="dash-card text-center py-16 flex flex-col items-center justify-center animate-fade-in">
                      <div className="empty-state-icon mb-4">
                        <Target className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">No Records Found</h3>
                      <p className="text-slate-400">Wait for your teacher to grade your tests!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {performances.map((perf, index) => {
                        const percentage = (perf.marks_obtained / perf.total_marks) * 100
                        const isPassing = percentage >= 40

                        return (
                          <div key={perf.id} className="dash-card animate-fade-in-up flex flex-col md:flex-row justify-between items-start md:items-center gap-6" style={{ animationDelay: `${index * 50}ms` }}>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-white mb-2">{perf.test_name}</h3>
                              <div className="text-sm text-slate-400 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Graded on {new Date(perf.created_at).toLocaleDateString()}
                              </div>
                              {perf.remarks && (
                                <p className="mt-4 text-sm text-slate-300 italic bg-white/5 p-3.5 rounded-xl border border-white/5 flex items-center gap-3">
                                  <CheckCircle className="w-5 h-5 text-green-400 shrink-0" /> {perf.remarks}
                                </p>
                              )}
                              {!perf.remarks && (
                                <p className="mt-4 text-sm text-slate-300 italic bg-white/5 p-3.5 rounded-xl border border-white/5 flex items-center gap-3">
                                  <CheckCircle className="w-5 h-5 text-green-400 shrink-0" /> Auto-graded test submission completed. Your detailed answers have been securely logged for your teacher.
                                </p>
                              )}
                            </div>

                            <div className="shrink-0 flex items-center gap-5 bg-white/5 p-5 rounded-2xl border border-white/10 shadow-inner">
                              <div className="text-center">
                                <p className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wider">Score</p>
                                <p className="text-2xl font-bold text-white">
                                  {perf.marks_obtained} <span className="text-slate-500 text-lg">/ {perf.total_marks}</span>
                                </p>
                              </div>
                              <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 shadow-lg ${isPassing ? 'border-green-500/30 text-green-400 shadow-green-500/10' : 'border-red-500/30 text-red-400 shadow-red-500/10'}`}>
                                <span className={`font-bold text-lg ${isPassing ? 'text-green-400' : 'text-red-400'}`}>{percentage.toFixed(0)}%</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {takingTest && profile && (
            <TakeQuiz
              testId={takingTest.id}
              testTitle={takingTest.title}
              studentId={profile.id}
              teacherId={takingTest.teacher_id}
              onClose={() => setTakingTest(null)}
              onComplete={() => {
                setTakingTest(null)
                fetchData()
                setActiveTab('performance')
              }}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}

