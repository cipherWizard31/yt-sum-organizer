import { redirect } from 'next/navigation'
import { createClient } from '@/app/utils/supabase/server'
import Link from 'next/link'
import { logout, deleteAccount } from './actions'
import { ArrowLeft, Layers, LogOut, Trash2, ShieldAlert, User } from 'lucide-react'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-4 px-6 py-4">
          <Link href="/dashboard"
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-sm text-slate-300 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:block">Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
              <Layers className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-semibold text-white">Settings</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-10 flex flex-col gap-6">
        {/* Account info */}
        <section className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-6">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-300">
            <User className="h-4 w-4 text-indigo-400" /> Account
          </div>
          <p className="text-sm text-slate-400">Signed in as</p>
          <p className="mt-1 font-medium text-white">{user.email}</p>
        </section>

        {/* Log out */}
        <section className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-6">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-300">
            <LogOut className="h-4 w-4 text-amber-400" /> Session
          </div>
          <p className="mb-4 text-sm text-slate-400">Sign out of your account on this device.</p>
          <form action={logout}>
            <button type="submit"
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-amber-500/40 hover:text-amber-300">
              <LogOut className="h-4 w-4" /> Log Out
            </button>
          </form>
        </section>

        {/* Danger zone */}
        <section className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-red-400">
            <ShieldAlert className="h-4 w-4" /> Danger Zone
          </div>
          <p className="mb-4 text-sm text-slate-400">
            Permanently delete your account and all your videos, notes, and summaries. This cannot be undone.
          </p>
          <DeleteAccountButton />
        </section>
      </main>
    </div>
  )
}

// Separate client component for the confirm-then-delete button
function DeleteAccountButton() {
  return (
    <form action={deleteAccount} onSubmit={(e) => {
      if (!confirm('Are you absolutely sure? This will permanently delete your account and ALL your data.')) {
        e.preventDefault()
      }
    }}>
      <button type="submit"
        className="flex items-center gap-2 rounded-xl bg-red-600/80 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600">
        <Trash2 className="h-4 w-4" /> Delete My Account
      </button>
    </form>
  )
}
