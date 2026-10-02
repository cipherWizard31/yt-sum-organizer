import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/app/utils/supabase/server'
import { Play, Clock, BookmarkCheck, ArrowRight, Sparkles, Folder } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f131c] text-[#dfe2ef] p-6 relative overflow-hidden selection:bg-[#a078ff] selection:text-[#340080]">
      {/* Stitch Ambient Glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-[#a078ff]/15 blur-[160px]" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-[#00a6e0]/12 blur-[160px]" />
      </div>

      <div className="relative z-10 max-w-3xl text-center flex flex-col items-center">
        {/* Brand Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#1c1f29] border border-[#31353f] shadow-2xl shadow-[#a078ff]/20">
            <Image src="/logo.svg" alt="YT Summaries Logo" width={40} height={40} priority />
          </div>
        </div>

        {/* Hero Tagline */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1c1f29] border border-[#262a34] text-[#d0bcff] text-xs font-mono mb-4">
          <Sparkles className="h-3.5 w-3.5 text-[#45dfa4]" />
          <span>Intelligent YouTube Study Organizer</span>
        </div>

        <h1 className="mb-4 text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
          Master any video with{' '}
          <span className="bg-gradient-to-r from-[#d0bcff] via-[#a078ff] to-[#7bd0ff] bg-clip-text text-transparent">
            instant timestamps &amp; notes
          </span>
        </h1>
        <p className="mb-10 text-sm sm:text-lg text-[#cbc3d7]/80 max-w-xl">
          Queue YouTube tutorials and lectures. Capture one-click timestamp bookmarks, organize collections into study folders, and generate rich markdown notes.
        </p>

        {/* Features Row */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3 text-left w-full">
          {[
            {
              icon: Play,
              color: 'text-[#ffb4ab]',
              title: 'YouTube & Video Stream',
              desc: 'Direct auto-sync with video chapters and high-res thumbnails',
            },
            {
              icon: Clock,
              color: 'text-[#d0bcff]',
              title: 'Timestamp Bookmarks',
              desc: 'Save exact seconds and jump back immediately with interactive chips',
            },
            {
              icon: Folder,
              color: 'text-[#45dfa4]',
              title: 'Curated Collections',
              desc: 'Categorize study libraries with drag-and-drop folder sorting',
            },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-[#262a34] bg-[#181b25]/80 p-5 shadow-sm backdrop-blur transition hover:border-[#a078ff]/40"
            >
              <div className="w-9 h-9 rounded-xl bg-[#1c1f29] border border-[#262a34] flex items-center justify-center mb-3">
                <Icon className={`h-4.5 w-4.5 ${color}`} />
              </div>
              <p className="text-sm font-semibold text-white">{title}</p>
              <p className="mt-1 text-xs text-[#cbc3d7]/70 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="h-12 px-7 rounded-full bg-[#a078ff] hover:bg-[#d0bcff] text-[#340080] font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#a078ff]/25 active:scale-95 transition"
          >
            <span>Get Started Free</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="h-12 px-7 rounded-full border border-[#262a34] bg-[#1c1f29] hover:bg-[#262a34] text-xs sm:text-sm font-semibold text-[#dfe2ef] transition active:scale-95 flex items-center justify-center"
          >
            Log In
          </Link>
        </div>
      </div>
    </div>
  )
}
