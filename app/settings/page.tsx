import { redirect } from 'next/navigation'
import { createClient } from '@/app/utils/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { logout } from './actions'
import DeleteAccountButton from './DeleteAccountButton'
import { ArrowLeft, LogOut, ShieldAlert, User, ShieldCheck } from 'lucide-react'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-[#0f131c] text-[#dfe2ef] antialiased flex flex-col selection:bg-[#a078ff] selection:text-[#340080]">
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[#a078ff]/10 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0f131c]/85 backdrop-blur-xl border-b border-[#262a34]/60 shadow-[0_1px_8px_rgba(0,0,0,0.25)]">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 sm:px-8 py-3.5">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 rounded-full border border-[#262a34] bg-[#1c1f29] px-3.5 py-1.5 text-xs font-medium text-[#cbc3d7] transition hover:border-[#d0bcff]/40 hover:text-white active:scale-95"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Dashboard</span>
            </Link>
            <div className="h-4 w-[1px] bg-[#262a34]" />
            <span className="font-semibold text-sm sm:text-base text-[#dfe2ef]">Account &amp; Settings</span>
          </div>

          <div className="h-8 w-8 rounded-lg bg-[#1c1f29] border border-[#262a34] flex items-center justify-center">
            <Image src="/logo.svg" alt="Logo" width={20} height={20} className="object-contain" />
          </div>
        </div>
      </header>

      {/* Main Settings Sections */}
      <main className="relative z-10 flex-1 max-w-3xl w-full mx-auto px-4 sm:px-8 py-8 flex flex-col gap-6">
        {/* Account Info */}
        <section className="rounded-2xl border border-[#262a34] bg-[#181b25] p-5 sm:p-6 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#cbc3d7]">
            <User className="h-4 w-4 text-[#d0bcff]" />
            <span>Profile &amp; Identity</span>
          </div>

          <div className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-[#1c1f29] border border-[#262a34]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-[#d0bcff] flex items-center justify-center shrink-0">
                <User className="h-5 w-5 text-[#3c0091]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-[#958ea0]">Primary Email</span>
                <span className="text-sm font-mono text-[#dfe2ef] truncate">{user.email}</span>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#45dfa4]/15 text-[#45dfa4] text-xs font-medium shrink-0">
              <ShieldCheck className="h-3.5 w-3.5" /> Active
            </span>
          </div>
        </section>

        {/* Log Out */}
        <section className="rounded-2xl border border-[#262a34] bg-[#181b25] p-5 sm:p-6 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#cbc3d7]">
            <LogOut className="h-4 w-4 text-[#7bd0ff]" />
            <span>Active Session</span>
          </div>
          <p className="text-xs sm:text-sm text-[#cbc3d7]/70">
            Sign out of your YT Summaries account on this browser.
          </p>
          <form action={logout} className="pt-1">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full border border-[#262a34] bg-[#1c1f29] px-5 py-2 text-xs sm:text-sm font-semibold text-[#dfe2ef] transition hover:border-[#7bd0ff]/40 hover:text-[#7bd0ff] active:scale-95"
            >
              <LogOut className="h-4 w-4" />
              <span>Log Out</span>
            </button>
          </form>
        </section>

        {/* Danger Zone */}
        <section className="rounded-2xl border border-[#93000a]/40 bg-[#93000a]/10 p-5 sm:p-6 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#ffb4ab]">
            <ShieldAlert className="h-4 w-4" />
            <span>Danger Zone</span>
          </div>
          <p className="text-xs sm:text-sm text-[#cbc3d7]/80 leading-relaxed">
            Permanently delete your account along with all saved video libraries, timestamp notes, and summaries. This action cannot be undone.
          </p>
          <div className="pt-1">
            <DeleteAccountButton />
          </div>
        </section>
      </main>
    </div>
  )
}
