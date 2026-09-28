'use client'

import { useState } from 'react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../lib/firebase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  const handleReset = async () => {
    try {
      await sendPasswordResetEmail(auth, email)
      setStatus('✅ Check your inbox for the reset link.')
      setError('')
    } catch (err: any) {
      console.error(err.message)
      setError('❌ Unable to send reset email.')
      setStatus('')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-white p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-md space-y-6 text-center">
        <h2 className="text-2xl font-bold text-blue-800">🔐 Reset Password</h2>
        <input
          type="email"
          placeholder="Your email"
          className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          onClick={handleReset}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
        >
          Send Reset Link
        </button>
        {status && <p className="text-green-600 text-sm">{status}</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>
    </main>
  )
}
