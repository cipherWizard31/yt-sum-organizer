import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/app/utils/supabase/server'
import DashboardShell from '@/components/DashboardShell'
import { Layers, Settings } from 'lucide-react'
import type { Video, Folder } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: videos, error: videoError }, { data: folders, error: folderError }] = await Promise.all([
    supabase.from('videos').select('*').order('created_at', { ascending: false }),
    supabase.from('folders').select('*').order('created_at', { ascending: true }),
  ])

  const combinedError = videoError?.message || folderError?.message

  return (
    <div className="min-h-screen bg-slate-950 text-white">
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
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-400 sm:block">{user.email}</span>
            <Link href="/settings"
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-sm text-slate-300 transition hover:text-white">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:block">Settings</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Video Library</h1>
          <p className="text-sm text-slate-400">{(videos ?? []).length} saved video{(videos ?? []).length !== 1 ? 's' : ''}</p>
        </div>

        <DashboardShell
          videos={(videos ?? []) as Video[]}
          folders={(folders ?? []) as Folder[]}
          fetchError={combinedError}
        />
      </main>
    </div>
  )
}