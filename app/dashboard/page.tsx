import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/app/utils/supabase/server'
import DashboardShell from '@/components/DashboardShell'
import { Settings, User as UserIcon } from 'lucide-react'
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
    <div className="min-h-screen bg-[#0f131c] text-[#dfe2ef] antialiased flex flex-col selection:bg-[#a078ff] selection:text-[#340080]">
      {/* Ambient gradient glow in Stitch violet & cyan */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[#a078ff]/10 blur-[120px]" />
        <div className="absolute top-1/2 -left-48 h-80 w-80 rounded-full bg-[#00a6e0]/8 blur-[100px]" />
      </div>

      {/* Stitch Top Bar */}
      <header className="sticky top-0 z-40 bg-[#0f131c]/85 backdrop-blur-xl border-b border-[#262a34]/60 shadow-[0_1px_8px_rgba(0,0,0,0.25)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-8 py-3.5">
          {/* Logo & App title */}
          <Link href="/dashboard" className="flex items-center gap-3 group focus:outline-none">
            <div className="h-9 w-9 rounded-xl bg-[#1c1f29] border border-[#31353f] flex items-center justify-center shadow-inner transition group-hover:border-[#d0bcff]/50">
              <Image src="/logo.svg" alt="YT Summary Organizer Logo" width={26} height={26} className="object-contain" priority />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-[17px] tracking-tight text-[#dfe2ef] group-hover:text-white transition leading-tight">
                YT Summaries
              </span>
              <span className="text-[11px] font-medium text-[#cbc3d7]/70 leading-tight">
                Workspace Dashboard
              </span>
            </div>
          </Link>

          {/* Right User Bar */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1c1f29] border border-[#262a34] text-[#cbc3d7] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#45dfa4] animate-pulse"></span>
              <span className="font-mono text-xs text-[#dfe2ef] truncate max-w-[200px]">
                {user.email}
              </span>
            </div>

            <Link
              href="/settings"
              aria-label="Settings and Profile"
              className="w-10 h-10 rounded-full bg-[#1c1f29] border border-[#262a34] hover:border-[#d0bcff]/50 flex items-center justify-center text-[#dfe2ef] hover:text-[#d0bcff] transition active:scale-95 shadow-sm"
            >
              <div className="w-7 h-7 rounded-full bg-[#d0bcff] flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-[#3c0091]" />
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 flex flex-col">
        <DashboardShell
          videos={(videos ?? []) as Video[]}
          folders={(folders ?? []) as Folder[]}
          fetchError={combinedError}
          userEmail={user.email ?? ''}
        />
      </main>
    </div>
  )
}