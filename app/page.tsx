import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/app/utils/supabase/server'
import { Layers, Play, Clock, BookmarkCheck } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white p-6">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
      </div>

      <div className="relative max-w-2xl text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-2xl shadow-indigo-500/30">
            <Layers className="h-8 w-8 text-white" />
          </div>
        </div>

        <h1 className="mb-4 text-5xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">VideoMark</span>
        </h1>
        <p className="mb-8 text-lg text-slate-400">
          Save any video. Capture notes at exact timestamps. Never lose an important moment again.
        </p>

        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3 text-left">
          {[
            { icon: Play, title: 'Any Video', desc: 'YouTube, Vimeo, or direct MP4 links' },
            { icon: Clock, title: 'Timestamped Notes', desc: 'Capture the exact moment with one click' },
            { icon: BookmarkCheck, title: 'Jump & Review', desc: 'Click any note to seek directly there' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4">
              <Icon className="mb-2 h-5 w-5 text-indigo-400" />
              <p className="text-sm font-semibold text-white">{title}</p>
              <p className="mt-0.5 text-xs text-slate-400">{desc}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-500 hover:to-violet-500"
          >
            Get Started Free
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-slate-700 bg-slate-800/60 px-6 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:text-white"
          >
            Log In
          </Link>
        </div>
      </div>
    </div>
  )
}
