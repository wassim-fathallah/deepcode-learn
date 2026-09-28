'use client'

import { useEffect, useState } from 'react'
import { getAuth } from 'firebase/auth'

type Exam = {
  id: string
  title: string
  description: string
  language: string
}

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [selected, setSelected] = useState<Exam | null>(null)
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const [outputLog, setOutputLog] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('http://127.0.0.1:8000/get-exams')
      .then(res => res.json())
      .then(data => setExams(data))
      .catch(err => console.error('❌ Failed to fetch exams', err))
  }, [])

  const submitCode = async () => {
    if (!selected) return
    setMessage('')
    setOutputLog('')
    setLoading(true)

    try {
      const auth = getAuth()
      const user = auth.currentUser
      if (!user) throw new Error('User not authenticated')

      const token = await user.getIdToken()
      const email = user.email || 'anonymous@student.com'

      const res = await fetch('http://127.0.0.1:8000/submit-exam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          exam_id: selected.id,
          code,
          language: selected.language,
          score: 0,
          output: '',
          student_email: email,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed to submit')

      setMessage(`✅ You scored ${data.score}/100 `)
      setOutputLog(data.output)
    } catch (err: any) {
      setMessage(`❌ ${err.message || 'Submission failed'}`)
    } finally {
      setLoading(false)
    }
  }

  if (selected) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-100 to-white p-6 flex items-center justify-center">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-2xl font-bold mb-2 text-blue-800">{selected.title}</h2>
          <p className="mb-4 text-gray-600">{selected.description}</p>

          <textarea
            className="w-full border p-3 rounded-lg h-64 font-mono text-sm text-black"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="✍️ Write your code here..."
          />

          <button
            onClick={submitCode}
            disabled={loading}
            className="mt-4 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold"
          >
            {loading ? 'Submitting...' : '🚀 Submit Code'}
          </button>

          {message && (
            <p className="mt-4 text-center font-medium text-blue-700 whitespace-pre-line">
              {message}
            </p>
          )}

          {outputLog && (
            <pre className="mt-4 bg-gray-100 p-3 rounded-lg text-sm text-black whitespace-pre-wrap">
              {outputLog}
            </pre>
          )}

          <button
            onClick={() => setSelected(null)}
            className="mt-6 text-sm text-gray-500 hover:underline"
          >
            🔙 Back to exam list
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 to-white p-6 flex items-center justify-center">
      <div className="max-w-2xl w-full space-y-4">
        <h1 className="text-3xl font-bold text-center text-blue-800 mb-6">🎓 Available Exams</h1>
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="bg-white rounded-xl border p-4 shadow-sm hover:shadow-md cursor-pointer transition"
            onClick={() => setSelected(exam)}
          >
            <h3 className="text-xl font-semibold text-gray-900">{exam.title}</h3>
            <p className="text-gray-600">{exam.description}</p>
            <p className="text-sm text-gray-500 mt-1">Language: {exam.language}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
