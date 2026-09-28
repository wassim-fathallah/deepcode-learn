'use client'

import { useState, useEffect } from 'react'
import { onAuthStateChanged, getIdToken } from 'firebase/auth'
import { auth } from '@/app/lib/firebase'
import { useRouter } from 'next/navigation'

type TestCase = { input: string; output: string }
type ExamResult = {
  student_email: string
  score: number
  submitted_at: string
  output: string
}

type ExamWithResults = {
  id: string
  title: string
  description: string
  results: ExamResult[]
}

export default function ProfessorDashboard() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [language, setLanguage] = useState('python')
  const [tests, setTests] = useState<TestCase[]>([{ input: '', output: '' }])
  const [message, setMessage] = useState('')
  const [token, setToken] = useState('')
  const [myExams, setMyExams] = useState<ExamWithResults[]>([])
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login')
        return
      }
      const fetchedToken = await getIdToken(user)
      setToken(fetchedToken)
      fetchMyExams(fetchedToken)
    })
    return () => unsubscribe()
  }, [])

  const fetchMyExams = async (idToken: string) => {
    try {
      const res = await fetch('http://127.0.0.1:8000/get-my-exams', {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed to fetch your exams')
      setMyExams(data)
    } catch (err) {
      console.error('❌ Error fetching my exams', err)
    }
  }

  const submitExam = async () => {
    setMessage('')
    try {
      const res = await fetch('http://127.0.0.1:8000/create-exam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, language, tests }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed to create exam')
      setMessage('✅ Exam successfully created!')
      setTitle('')
      setDescription('')
      setTests([{ input: '', output: '' }])
      fetchMyExams(token)
    } catch (err: any) {
      setMessage(`❌ Error: ${err.message || 'Unknown error'}`)
    }
  }

  const addTest = () => setTests([...tests, { input: '', output: '' }])
  const updateTest = (i: number, field: keyof TestCase, val: string) => {
    const updated = [...tests]
    updated[i][field] = val
    setTests(updated)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-white p-6">
      <div className="w-full max-w-5xl space-y-10">
        <section className="bg-white p-6 rounded-2xl shadow-lg">
          <h1 className="text-3xl font-bold text-blue-800 text-center mb-6">📘 Professor Dashboard</h1>
          <div className="grid gap-4">
            <input
              type="text"
              placeholder="📝 Exam Title"
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              placeholder="📄 Exam Description"
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <select
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="python">Python 🐍</option>
              <option value="java">Java ☕</option>
              <option value="c">C 🔵</option>
              <option value="cpp">C++ 💡</option>
            </select>

            <div>
              <h2 className="font-semibold text-blue-700 mb-2">🧪 Test Cases:</h2>
              {tests.map((test, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Input"
                    className="w-1/2 border p-2 rounded-lg"
                    value={test.input}
                    onChange={(e) => updateTest(index, 'input', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Expected Output"
                    className="w-1/2 border p-2 rounded-lg"
                    value={test.output}
                    onChange={(e) => updateTest(index, 'output', e.target.value)}
                  />
                </div>
              ))}
              <button onClick={addTest} className="text-blue-600 hover:underline text-sm mt-1">
                ➕ Add Another Test Case
              </button>
            </div>

            <button
              onClick={submitExam}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              🚀 Submit Exam
            </button>
            {message && (
              <p className="text-center mt-2 font-medium text-blue-700">{message}</p>
            )}
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-2xl font-bold text-blue-800 mb-4">📊 My Exams & Results</h2>
          {myExams.map((exam) => (
            <div key={exam.id} className="bg-gray-50 rounded-lg p-4 mb-4 border border-blue-100">
              <h3 className="text-xl font-semibold text-black">{exam.title}</h3>
              <p className="text-gray-600 mb-2">{exam.description}</p>
              <h4 className="font-semibold text-blue-700 mb-1">🧾 Submitted Results:</h4>
              {exam.results.length > 0 ? (
                <ul className="list-disc pl-5 text-sm text-gray-700">
                  {exam.results.map((res, idx) => (
                    <li key={idx}>
                      <strong>{res.student_email}</strong>: {res.score} points — {new Date(res.submitted_at).toLocaleString()}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="italic text-gray-500">No submissions yet.</p>
              )}
            </div>
          ))}
        </section>
      </div>
    </main>
  )
}
