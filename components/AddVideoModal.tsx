'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Link2, FileVideo, Loader2 } from 'lucide-react'
import { addVideo } from '@/app/dashboard/actions'

interface AddVideoModalProps {
  onClose: () => void
}

export default function AddVideoModal({ onClose }: AddVideoModalProps) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  async function handleSubmit(formData: FormData) {
    const title = (formData.get('title') as string).trim()
    const url = (formData.get('video_url') as string).trim()
    if (!title || !url) { setError('Both title and URL are required.'); return }
    try { new URL(url) } catch { setError('Please enter a valid URL.'); return }
    setError('')
    setPending(true)
    await addVideo(formData)
    setPending(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-slate-700/60 bg-slate-900 p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20">
              <FileVideo className="h-5 w-5 text-indigo-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Add Video</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-400">
            {error}
          </div>
        )}

        <form action={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Video Title</label>
            <input
              ref={inputRef}
              name="title"
              type="text"
              required
              placeholder="e.g. React Server Components Deep Dive"
              className="w-full rounded-xl bg-slate-800 border border-slate-700/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Video URL</label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                name="video_url"
                type="url"
                required
                placeholder="https://youtube.com/watch?v=..."
                className="w-full rounded-xl bg-slate-800 border border-slate-700/60 pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-500">Supports YouTube, Vimeo, and direct MP4 links</p>
          </div>

          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
            >
              {pending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : 'Save Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
