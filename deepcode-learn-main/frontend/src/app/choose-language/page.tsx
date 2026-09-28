'use client'

import { useRouter } from 'next/navigation'

export default function ChooseLanguage() {
  const router = useRouter()

  const goToLanguage = (lang: string) => {
    router.push(`/problems?lang=${lang}`)
  }

  const goToExam = () => {
    router.push('/exams')
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-white p-6">
      <div className="bg-white p-10 rounded-2xl shadow-lg text-center w-full max-w-md">
        <h1 className="text-3xl font-bold text-blue-800 mb-8">🧠 Choose a Language</h1>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => goToLanguage('python')}
            className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg font-medium"
          >
            Python 🐍
          </button>
          <button
            onClick={() => goToLanguage('java')}
            className="bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium"
          >
            Java ☕
          </button>
          <button
            onClick={() => goToLanguage('c')}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium"
          >
            C 🔵
          </button>
          <button
            onClick={() => goToLanguage('cpp')}
            className="bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg font-medium"
          >
            C++ 💡
          </button>
        </div>

        <button
          onClick={goToExam}
          className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg text-lg font-semibold w-full"
        >
          🎓 Take Exam
        </button>
      </div>
    </main>
  )
}
