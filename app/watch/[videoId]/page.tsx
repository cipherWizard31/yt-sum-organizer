import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/app/utils/supabase/server'
import WatchClient from '@/components/WatchClient'
import { ArrowLeft, User as UserIcon } from 'lucide-react'
import type { TimestampNote, Summary } from '@/types'

interface PageProps {
  params: Promise<{ videoId: string }>
}

export default async function WatchPage({ params }: PageProps) {
  const { videoId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: video, error: videoError } = await supabase
    .from('videos')
    .select('*')
    .eq('id', videoId)
    .eq('user_id', user.id)
    .single()

  if (videoError || !video) notFound()

  const [{ data: timestamps }, { data: summaries }] = await Promise.all([
    supabase
      .from('timestamps')
      .select('*')
      .eq('video_id', videoId)
      .order('time_in_seconds', { ascending: true }),
    supabase
      .from('summaries')
      .select('*')
      .eq('video_id', videoId)
      .order('created_at', { ascending: false }),
  ])

  const timestampList: TimestampNote[] = timestamps ?? []
  const summaryList: Summary[] = summaries ?? []

  return (
    <div className="min-h-screen bg-[#0f131c] text-[#dfe2ef] antialiased flex flex-col selection:bg-[#a078ff] selection:text-[#340080]">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#a078ff]/10 blur-[120px]" />
        <div className="absolute top-1/2 -right-48 h-80 w-80 rounded-full bg-[#00a6e0]/8 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0f131c]/85 backdrop-blur-xl border-b border-[#262a34]/60 shadow-[0_1px_8px_rgba(0,0,0,0.25)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-8 py-3.5 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 rounded-full border border-[#262a34] bg-[#1c1f29] px-3.5 py-1.5 text-xs font-medium text-[#cbc3d7] transition hover:border-[#d0bcff]/40 hover:text-white shrink-0 active:scale-95"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </Link>

            <div className="h-4 w-[1px] bg-[#262a34] shrink-0" />

            <div className="h-8 w-8 rounded-lg bg-[#1c1f29] border border-[#262a34] flex items-center justify-center shrink-0">
              <Image src="/logo.svg" alt="Logo" width={20} height={20} className="object-contain" />
            </div>

            <h1 className="font-semibold text-sm sm:text-base text-[#dfe2ef] truncate min-w-0">
              {video.title}
            </h1>
          </div>

          {/* Right quick avatar */}
          <Link
            href="/settings"
            aria-label="Profile and Settings"
            className="w-9 h-9 rounded-full bg-[#1c1f29] border border-[#262a34] hover:border-[#d0bcff]/50 flex items-center justify-center text-[#dfe2ef] transition shrink-0"
          >
            <div className="w-6 h-6 rounded-full bg-[#d0bcff] flex items-center justify-center">
              <UserIcon className="h-3.5 w-3.5 text-[#3c0091]" />
            </div>
          </Link>
        </div>
      </header>

      {/* Main Studio */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-6">
        <WatchClient
          videoUrl={video.video_url}
          videoId={videoId}
          timestamps={timestampList}
          summaries={summaryList}
        />
      </main>
    </div>
  )
}
