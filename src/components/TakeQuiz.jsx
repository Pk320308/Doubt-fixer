'use client'
import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function TakeQuiz({ testId, testTitle, studentId, teacherId, onClose, onComplete }) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [score, setScore] = useState(0)
  const [totalMarks, setTotalMarks] = useState(0)

  useEffect(() => {
    fetchQuestions()
  }, [testId])

  async function fetchQuestions() {
    setLoading(true)
    const { data } = await supabase.from('quiz_questions').select('*').eq('test_id', testId).order('created_at', { ascending: true })
    if (data) {
      setQuestions(data)
      setTotalMarks(data.reduce((sum, q) => sum + (q.marks || 1), 0))
    }
    setLoading(false)
  }

  function handleSelectOption(questionId, optionIndex) {
    if (submitted) return
    setAnswers({ ...answers, [questionId]: optionIndex })
  }

  async function handleSubmit() {
    if (Object.keys(answers).length < questions.length) {
      if (!confirm("You haven't answered all questions. Submit anyway?")) return
    }

    setSubmitting(true)
    let obtainedMarks = 0

    // Calculate score
    questions.forEach(q => {
      if (answers[q.id] === q.correct_answer_index) {
        obtainedMarks += q.marks || 1
      }
    })
    
    setScore(obtainedMarks)
    
    // Generate detailed remarks with student's exact answers
    let detailedRemarks = `Auto-graded. Answered ${Object.keys(answers).length} out of ${questions.length} questions.\n\n`
    questions.forEach((q, idx) => {
      const studentAnsIdx = answers[q.id]
      const studentAnsText = studentAnsIdx !== undefined ? q.options[studentAnsIdx] : "Not Answered"
      const correctAnsText = q.options[q.correct_answer_index]
      
      detailedRemarks += `Q${idx + 1}: ${q.question_text}\n`
      detailedRemarks += `Student Answer: ${studentAnsText} ${studentAnsIdx === q.correct_answer_index ? '✅' : '❌ (Correct: ' + correctAnsText + ')'}\n\n`
    })
    
    // Save to student_performance
    const { error } = await supabase.from('student_performance').insert([{
      student_id: studentId,
      teacher_id: teacherId,
      test_name: testTitle,
      marks_obtained: obtainedMarks,
      total_marks: totalMarks,
      remarks: detailedRemarks.trim()
    }])

    setSubmitting(false)
    if (error) {
      alert("Error saving results: " + error.message)
    } else {
      setSubmitted(true)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-white">Loading Quiz...</p>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">No Questions Found</h2>
          <p className="text-slate-400 mb-6">The teacher hasn't added any questions to this quiz yet.</p>
          <button onClick={onClose} className="bg-white/10 text-white px-6 py-2 rounded-lg hover:bg-white/20">Go Back</button>
        </div>
      </div>
    )
  }

  const currentQ = questions[currentQuestionIndex]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-white/5 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
          <div>
            <h2 className="text-xl font-bold text-white">{testTitle}</h2>
            <p className="text-primary-400 text-sm font-medium">Question {currentQuestionIndex + 1} of {questions.length}</p>
          </div>
          {submitted ? (
            <button onClick={() => { onClose(); onComplete(); }} className="bg-primary-600 text-white px-4 py-2 rounded font-medium hover:bg-primary-700">Close</button>
          ) : (
            <div className="flex items-center gap-2 text-slate-300 bg-white/5 px-3 py-1.5 rounded border border-white/10">
              <Clock className="w-4 h-4" /> Not Timed
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 flex-1">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-primary-500/20 text-primary-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">Quiz Completed!</h3>
              <p className="text-slate-300 text-lg mb-8">You scored <span className="font-bold text-primary-400">{score}</span> out of {totalMarks}</p>
              
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-left max-w-xl mx-auto space-y-6">
                <h4 className="font-semibold text-white border-b border-white/10 pb-2">Review Answers</h4>
                {questions.map((q, idx) => (
                  <div key={q.id} className="space-y-2">
                    <p className="text-white font-medium"><span className="text-slate-400 mr-2">{idx + 1}.</span>{q.question_text}</p>
                    <div className="pl-6 space-y-1">
                      {q.options.map((opt, i) => {
                        const isSelected = answers[q.id] === i
                        const isCorrect = q.correct_answer_index === i
                        
                        let optionClass = "text-slate-400"
                        if (isCorrect) optionClass = "text-green-400 font-medium"
                        else if (isSelected && !isCorrect) optionClass = "text-red-400 line-through"

                        return (
                          <div key={i} className={`flex items-center gap-2 ${optionClass}`}>
                            {isCorrect ? <CheckCircle className="w-4 h-4 text-green-500" /> : (isSelected ? <XCircle className="w-4 h-4 text-red-500" /> : <div className="w-4 h-4" />)}
                            <span>{opt}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="text-xl text-white font-medium">
                {currentQ.question_text}
                <span className="ml-3 text-sm font-normal text-slate-400 bg-white/5 px-2 py-1 rounded">[{currentQ.marks} Marks]</span>
              </div>
              
              <div className="space-y-3">
                {currentQ.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(currentQ.id, idx)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      answers[currentQ.id] === idx 
                        ? 'border-primary-500 bg-primary-500/10 text-white shadow-[0_0_15px_rgba(var(--primary-500),0.3)]' 
                        : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${answers[currentQ.id] === idx ? 'border-primary-500' : 'border-slate-500'}`}>
                        {answers[currentQ.id] === idx && <div className="w-2.5 h-2.5 bg-primary-500 rounded-full" />}
                      </div>
                      {opt}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        {!submitted && (
          <div className="p-6 border-t border-white/10 bg-white/5 flex justify-between items-center sticky bottom-0 z-10 backdrop-blur-md">
            <button 
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-2 rounded-lg font-medium text-white disabled:opacity-30 hover:bg-white/10 transition-colors border border-transparent disabled:border-transparent"
            >
              Previous
            </button>
            
            {currentQuestionIndex === questions.length - 1 ? (
              <button 
                onClick={handleSubmit}
                disabled={submitting}
                className="px-8 py-2.5 rounded-lg font-bold text-white bg-green-600 hover:bg-green-700 shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all"
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            ) : (
              <button 
                onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                className="px-6 py-2 rounded-lg font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
              >
                Next
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
