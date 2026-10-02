'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { login, signup } from './actions'
import { AlertCircle, CheckCircle, Loader2, ArrowRight } from 'lucide-react'

function LoginForm() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [pending, setPending] = useState(false)
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const message = searchParams.get('message')

  async function handleAction(formData: FormData) {
    setPending(true)
    if (isSignUp) {
      await signup(formData)
    } else {
      await login(formData)
    }
    setPending(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f131c] text-[#dfe2ef] p-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#a078ff]/15 blur-[140px]" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#00a6e0]/12 blur-[140px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo / Brand */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1c1f29] border border-[#31353f] shadow-xl">
            <Image src="/logo.svg" alt="YT Summaries Logo" width={34} height={34} priority />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-[#dfe2ef]">YT Summaries</h1>
            <p className="text-xs sm:text-sm text-[#cbc3d7]/70">Curated timestamps, chapters &amp; AI study notes</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-[#262a34] bg-[#181b25]/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Header & Toggle */}
          <div className="mb-6 flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-[#dfe2ef]">
              {isSignUp ? 'Create your workspace' : 'Welcome back'}
            </h2>
            <p className="text-xs sm:text-sm text-[#cbc3d7]/70">
              {isSignUp
                ? 'Sign up to organize your video notes and timestamp bookmarks.'
                : 'Log in to access your curated video library.'}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl bg-[#93000a]/20 border border-[#93000a]/40 p-3.5 text-xs sm:text-sm text-[#ffb4ab]">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {message && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl bg-[#00a574]/20 border border-[#00a574]/40 p-3.5 text-xs sm:text-sm text-[#45dfa4]">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {/* Form */}
          <form action={handleAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#cbc3d7]" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="name@example.com"
                className="w-full h-11 px-3.5 rounded-xl bg-[#1c1f29] border border-[#262a34] text-sm text-[#dfe2ef] placeholder-[#958ea0] focus:outline-none focus:border-[#d0bcff] focus:ring-1 focus:ring-[#d0bcff]/40 transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#cbc3d7]" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                placeholder="••••••••"
                className="w-full h-11 px-3.5 rounded-xl bg-[#1c1f29] border border-[#262a34] text-sm text-[#dfe2ef] placeholder-[#958ea0] focus:outline-none focus:border-[#d0bcff] focus:ring-1 focus:ring-[#d0bcff]/40 transition"
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="mt-2 h-11 rounded-full bg-[#a078ff] hover:bg-[#d0bcff] text-[#340080] font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#a078ff]/25 active:scale-[0.98] transition disabled:opacity-50"
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[#340080]" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{isSignUp ? 'Sign Up' : 'Log In'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-6 border-t border-[#262a34] pt-5 text-center text-xs text-[#cbc3d7]/70">
            {isSignUp ? (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="font-semibold text-[#d0bcff] hover:underline"
                >
                  Log In
                </button>
              </span>
            ) : (
              <span>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="font-semibold text-[#d0bcff] hover:underline"
                >
                  Sign Up
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0f131c]">
          <Loader2 className="h-8 w-8 animate-spin text-[#d0bcff]" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}