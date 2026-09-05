'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function QuizBuilder({ testId, testTitle, onClose }) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    options: ['', '', '', ''],
    correct_answer_index: 0,
    marks: 1
  })

  useEffect(() => {
    fetchQuestions()
  }, [testId])

  async function fetchQuestions() {
    setLoading(true)
    const { data } = await supabase.from('quiz_questions').select('*').eq('test_id', testId).order('created_at', { ascending: true })
    if (data) setQuestions(data)
    setLoading(false)
  }

  function handleOptionChange(index, value) {
    const newOptions = [...newQuestion.options]
    newOptions[index] = value
    setNewQuestion({ ...newQuestion, options: newOptions })
  }

  async function handleAddQuestion(e) {
    e.preventDefault()
    if (newQuestion.options.some(opt => !opt.trim())) {
      alert("All options must be filled!")
      return
    }
    
    setSaving(true)
    const { data, error } = await supabase.from('quiz_questions').insert([{
      test_id: testId,
      ...newQuestion
    }]).select()
    
    setSaving(false)
    if (error) {
      alert(error.message)
    } else if (data) {
      setQuestions([...questions, data[0]])
      setNewQuestion({
        question_text: '',
        options: ['', '', '', ''],
        correct_answer_index: 0,
        marks: 1
      })
    }
  }

  async function deleteQuestion(id) {
    if (!confirm("Delete this question?")) return
    await supabase.from('quiz_questions').delete().eq('id', id)
    setQuestions(questions.filter(q => q.id !== id))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-semibold text-white">Quiz Builder</h2>
            <p className="text-slate-400 text-sm">{testTitle}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-slate-300"><X className="w-6 h-6" /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-6">
          {/* Add Question Form */}
          <div className="flex-1 bg-white/5 p-6 rounded-xl border border-white/10 h-fit">
            <h3 className="text-lg font-semibold text-white mb-4">Add New Question</h3>
            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Question Text</label>
                <textarea required value={newQuestion.question_text} onChange={e => setNewQuestion({...newQuestion, question_text: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-400 h-24" placeholder="Enter question..." />
              </div>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-300">Options</label>
                {newQuestion.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="correct_answer" 
                      checked={newQuestion.correct_answer_index === i} 
                      onChange={() => setNewQuestion({...newQuestion, correct_answer_index: i})}
                      title="Mark as correct answer"
                      className="w-5 h-5 accent-primary-500"
                    />
                    <input 
                      type="text" 
                      required 
                      value={opt} 
                      onChange={e => handleOptionChange(i, e.target.value)} 
                      className={`flex-1 px-4 py-2 rounded-lg bg-white/5 border ${newQuestion.correct_answer_index === i ? 'border-primary-500' : 'border-white/10'} text-white`} 
                      placeholder={`Option ${i + 1}`} 
                    />
                  </div>
                ))}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Marks</label>
                <input type="number" min="1" required value={newQuestion.marks} onChange={e => setNewQuestion({...newQuestion, marks: parseInt(e.target.value) || 1})} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white" />
              </div>
              
              <button type="submit" disabled={saving} className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" /> {saving ? 'Saving...' : 'Add Question'}
              </button>
            </form>
          </div>
          
          {/* Question List */}
          <div className="flex-1 space-y-4">
            <h3 className="text-lg font-semibold text-white">Questions ({questions.length})</h3>
            {loading ? (
              <p className="text-slate-400">Loading questions...</p>
            ) : questions.length === 0 ? (
              <div className="text-center p-8 border border-white/10 border-dashed rounded-xl bg-white/5 text-slate-400">
                No questions added yet.
              </div>
            ) : (
              questions.map((q, idx) => (
                <div key={q.id} className="p-4 border border-white/10 rounded-xl bg-white/5 relative">
                  <button onClick={() => deleteQuestion(q.id)} className="absolute top-4 right-4 text-red-400 hover:text-red-300 p-1 bg-red-400/10 rounded"><Trash2 className="w-4 h-4" /></button>
                  <div className="flex gap-2">
                    <span className="font-bold text-primary-400">Q{idx + 1}.</span>
                    <h4 className="font-medium text-white text-lg">{q.question_text}</h4>
                  </div>
                  <div className="mt-3 space-y-2 pl-6">
                    {q.options.map((opt, i) => (
                      <div key={i} className={`px-3 py-2 rounded border ${q.correct_answer_index === i ? 'border-primary-500 bg-primary-500/10 text-primary-300 font-medium' : 'border-white/10 text-slate-300 bg-white/5'}`}>
                        {String.fromCharCode(65 + i)}. {opt}
                        {q.correct_answer_index === i && <span className="float-right text-xs bg-primary-500 text-white px-2 py-0.5 rounded-full">Correct</span>}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-sm text-slate-400 pl-6">Marks: {q.marks}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
