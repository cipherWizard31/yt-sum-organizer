import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/app/utils/supabase/server'
import WatchClient from '@/components/WatchClient'
import { ArrowLeft, Layers } from 'lucide-react'
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

  const { data: timestamps } = await supabase
    .from('timestamps')
    .select('*')
    .eq('video_id', videoId)
    .order('time_in_seconds', { ascending: true })

  const timestampList: TimestampNote[] = timestamps ?? []

  const { data: summaries } = await supabase
    .from('summaries')
    .select('*')
    .eq('video_id', videoId)
    .order('created_at', { ascending: false })

  const summaryList: Summary[] = summaries ?? []

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-60 -left-40 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-sm text-slate-300 transition hover:border-slate-600 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:block">Back</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
              <Layers className="h-3.5 w-3.5 text-white" />
            </div>
          </div>

          <h1 className="flex-1 truncate text-sm font-semibold text-white sm:text-base">
            {video.title}
          </h1>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
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
