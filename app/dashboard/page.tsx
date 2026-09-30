import { redirect } from 'next/navigation'
import { createClient } from '@/app/utils/supabase/server'
import { logout } from '@/app/login/actions'
import { addVideo } from './actions'
import VideoCard from '@/components/VideoCard'
import DashboardClient from '@/components/DashboardClient'
import { Layers, Plus, LogOut, Video } from 'lucide-react'
import type { Video as VideoType } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: videos, error } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false })

  const videoList: VideoType[] = videos ?? []

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
              <Layers className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">VideoMark</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-400 sm:block">{user.email}</span>
            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-300 transition hover:border-slate-600 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:block">Logout</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Page Title + Add Button */}
        <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Video Library</h1>
            <p className="text-sm text-slate-400">{videoList.length} saved video{videoList.length !== 1 ? 's' : ''}</p>
          </div>
          <DashboardClient />
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
            Failed to load videos: {error.message}
          </div>
        )}

        {/* Empty state */}
        {videoList.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700/60 bg-slate-900/30 py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800">
              <Video className="h-8 w-8 text-slate-500" />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-white">No videos yet</h3>
            <p className="mb-6 text-sm text-slate-400">Add your first video to start capturing timestamped notes.</p>
            <DashboardClient showButtonOnly />
          </div>
        )}

        {/* Video Grid */}
        {videoList.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videoList.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}