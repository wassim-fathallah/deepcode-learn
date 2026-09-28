'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type Problem = {
  id: string
  title: string
  short_description: string
  difficulty: string
}

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([])
  const problemRefs = useRef<HTMLDivElement[]>([])
  const router = useRouter()
  const [input, setInput] = useState("")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const lang = params.get("lang")
    if (!lang) {
      router.replace("/problems/choose-language")
      return
    }
    const filePath = `/data/${lang}_problems.json`

    fetch(filePath)
      .then(res => {
        if (!res.ok) throw new Error(`❌ Failed to load ${filePath}`)
        return res.json()
      })
      .then((data: Problem[]) => {
        setProblems(data)
        problemRefs.current = Array(data.length).fill(null)
      })
      .catch(err => {
        console.error(err)
        alert(`⚠️ Could not load data for ${lang}. Check that /public/data/${lang}_problems.json exists.`)
      })
  }, [router])

  const scrollToProblem = () => {
    const index = parseInt(input) - 1
    if (!isNaN(index) && problemRefs.current[index]) {
      problemRefs.current[index].scrollIntoView({ behavior: 'smooth' })
    } else {
      alert("Invalid problem number")
    }
  }

  const goToProblem = (index: number) => {
    const params = new URLSearchParams(window.location.search)
    const lang = params.get("lang")
    
    if (lang) {
      router.push(`/problems/${index}?lang=${lang}`)

    } else {
      router.push(`/problems/${index}`)

    }
  }

  return (
    <main className="min-h-screen bg-white px-6 py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-blue-700 mb-2 flex justify-center items-center gap-2">
          Let’s Start Coding 💻
        </h1>
        <p className="text-gray-600 text-lg">
          Choose a coding problem and start your journey with AI-assisted feedback.
        </p>

        <div className="mt-6 flex justify-center gap-4 items-center">
          <div className="relative">
            <input
              type="number"
              min="1"
              max={problems.length}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="border border-blue-300 rounded px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 w-40 peer"
              placeholder=" "
            />
            <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-gray-600 pointer-events-none">
              Problem Number
            </label>
          </div>
          <button
            onClick={scrollToProblem}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
          >
            Go to Problem
          </button>
        </div>
      </div>

      <div className="space-y-6 max-w-3xl mx-auto">
        {problems.map((problem, index) => (
          <div
            key={problem.id}
            ref={(el) => {
              if (el) problemRefs.current[index] = el
            }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow hover:shadow-md transition"
          >
            <h1 className="text-2xl font-bold text-blue-800">
  Problem-{problem.id}: {problem.title}
</h1>
            <p className="text-gray-700 mb-2">{problem.short_description}</p>
            <p className="text-sm text-blue-600 font-semibold mb-4">Difficulty: {problem.difficulty}</p>
            <button
              onClick={() => goToProblem(index)}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm"
            >
              Solve Now →
            </button>
          </div>
        ))}
      </div>
    </main>
  )
}
