'use client'

import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-white p-6">
      <div className="text-center">
        <img src="/logo.PNG" alt="Logo" className="w-24 h-24 mx-auto mb-6" />
        <h1 className="text-5xl font-extrabold text-blue-700 mb-4">
          Welcome to DeepCode Learn
        </h1>
        <p className="text-lg text-gray-700 mb-10 max-w-xl mx-auto">
          Master real coding challenges, get AI-powered feedback, and track your progress in Learn or Exam mode.
        </p>

        <div className="flex justify-center gap-6">
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg shadow-md"
          >
            Sign In
          </button>
          <button
            onClick={() => router.push('/signup')}
            className="border border-blue-600 hover:bg-blue-50 text-blue-700 px-6 py-3 rounded-lg text-lg"
          >
            Sign Up
          </button>
        </div>
      </div>
    </main>
  )
}
