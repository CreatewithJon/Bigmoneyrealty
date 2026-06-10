'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      {/* Subtle background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#b8922a]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo / brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-[#b8922a]/30 bg-[#b8922a]/10 mb-5">
            <span className="text-[#b8922a] text-xl font-bold" style={{ fontFamily: 'var(--font-cormorant)' }}>
              B
            </span>
          </div>
          <h1
            className="text-2xl font-semibold text-white/90 tracking-tight"
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            Big Money Realty
          </h1>
          <p className="text-sm text-white/40 mt-1" style={{ fontFamily: 'var(--font-lato)' }}>
            Agent & Broker Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#111] border border-white/[0.07] rounded-2xl p-8 shadow-2xl">
          <h2
            className="text-lg font-medium text-white/80 mb-6"
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            Sign in to your account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-[0.12em] text-white/40 mb-2"
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@bigmoneyrealty.com"
                className="w-full bg-[#0a0a0a] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#b8922a]/50 focus:ring-1 focus:ring-[#b8922a]/20 transition-colors"
                style={{ fontFamily: 'var(--font-lato)' }}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-[0.12em] text-white/40 mb-2"
                style={{ fontFamily: 'var(--font-lato)' }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full bg-[#0a0a0a] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#b8922a]/50 focus:ring-1 focus:ring-[#b8922a]/20 transition-colors"
                style={{ fontFamily: 'var(--font-lato)' }}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                <p className="text-sm text-red-400" style={{ fontFamily: 'var(--font-lato)' }}>
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#b8922a] hover:bg-[#c9a030] disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold text-sm py-3 rounded-lg transition-colors mt-2"
              style={{ fontFamily: 'var(--font-lato)' }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-white/20 mt-6" style={{ fontFamily: 'var(--font-lato)' }}>
          Big Money Realty — Las Vegas, NV
        </p>
      </div>
    </div>
  )
}
