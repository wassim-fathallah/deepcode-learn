'use client'

import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type Problem = {
  id: string
  title: string
  description: string
  difficulty: string
}

export default function ProblemPage() {
  const { id } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [problem, setProblem] = useState<Problem | null>(null)
  const [code, setCode] = useState('')
  const [feedback, setFeedback] = useState('')
  const [score, setScore] = useState<number | null>(null)
  const [correction, setCorrection] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatingCorrection, setGeneratingCorrection] = useState(false)
  const [showCorrectionButton, setShowCorrectionButton] = useState(false)

  useEffect(() => {
    const lang = searchParams.get('lang') || 'python'
    const filePath = `/data/${lang}_problems.json`

    fetch(filePath)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load ${filePath}`)
        return res.json()
      })
      .then((data: Problem[]) => {
        const p = data[parseInt(id as string)]
        setProblem(p)
      })
      .catch(err => {
        console.error('❌ Failed to load problem:', err)
        alert('Could not load problem. Please check the language and ID.')
      })
  }, [id, searchParams])

  const animateText = (text: string, setter: (val: string) => void) => {
    let i = 0
    setter('')
    const interval = setInterval(() => {
      setter(text.slice(0, i + 1))
      i++
      if (i >= text.length) clearInterval(interval)
    }, 20)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setFeedback('')
    setCorrection('')
    setShowCorrectionButton(false)
    setScore(null)

    try {
     const res = await fetch('http://127.0.0.1:8000/submit/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    problem_id: parseInt(id as string),
    student_code: code,
    language: searchParams.get('lang') || 'python'
  })
})

      const data = await res.json()
      setScore(data.score)
      animateText(data.feedback, setFeedback)
      if (data.score < 100) setShowCorrectionButton(true)
    } catch (err) {
      alert('⚠️ Cannot reach backend.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

const fetchCorrection = async () => {
  setGeneratingCorrection(true)
  setCorrection('')

  try {
    const res = await fetch('http://127.0.0.1:8000/correction/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problem_id: parseInt(id as string),
        student_code: code,
        language: searchParams.get('lang') || 'python',
        problem_context: problem?.description || ''
      })
    })

    const data = await res.json()
    animateText(data.correction, setCorrection)
  } catch (err) {
    setCorrection('❌ Failed to generate correction.')
    console.error(err)
  } finally {
    setGeneratingCorrection(false)
  }
}

  const goBack = () => {
    const lang = searchParams.get('lang') || 'python'
    router.push(`/problems?lang=${lang}`)
  }

  if (!problem) return <div>Loading...</div>

  return (
    <main className="min-h-screen p-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <button onClick={goBack} className="mb-6 text-blue-600 font-medium">← Back to Problems</button>

        <h1 className="text-2xl font-bold text-blue-800">{problem.title}</h1>
        <p className="text-sm text-blue-600 mb-2">Difficulty: {problem.difficulty}</p>

        <pre className="bg-blue-50 p-4 rounded mb-4 border border-blue-100 whitespace-pre-wrap text-black">
          {problem.description}
        </pre>

        <textarea
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="Write your code here..."
          className="w-full h-[400px] p-4 border border-blue-300 rounded font-mono text-sm text-black"
          spellCheck={false}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Solution'}
        </button>

        {score !== null && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded text-black">
            <strong>Score:</strong> {score}%
          </div>
        )}

        {feedback && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded whitespace-pre-line text-black">
            <strong>Feedback:</strong>
            <br />
            {feedback}
          </div>
        )}

        {showCorrectionButton && (
          <div className="mt-4">
            <button
              onClick={fetchCorrection}
              disabled={generatingCorrection}
              className="text-blue-600 underline"
            >
              {generatingCorrection ? 'Generating correction...' : '🛠️ Show Suggested Correction'}
            </button>
          </div>
        )}

        {correction && (
          <pre className="mt-4 bg-gray-100 p-4 border rounded whitespace-pre-wrap text-sm text-black">
            {correction}
          </pre>
        )}
      </div>
    </main>
  )
}