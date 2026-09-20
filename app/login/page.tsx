'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { login, signup } from './actions'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white p-4">
      <div className="w-full max-w-md rounded-xl bg-slate-900 p-8 border border-slate-800 shadow-2xl">
        <h1 className="text-2xl font-bold mb-2 text-center">
          {isSignUp ? 'Create an Account' : 'Welcome Back'}
        </h1>
        <p className="text-sm text-slate-400 text-center mb-6">
          {isSignUp ? 'Sign up to start saving video timestamps' : 'Log in to access your saved notes'}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <button
            formAction={isSignUp ? signup : login}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-lg transition mt-2"
          >
            {isSignUp ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-indigo-400 hover:underline font-medium"
          >
            {isSignUp ? 'Log in' : 'Sign up'}
          </button>
        </div>
      </div>
    </div>
  )
}