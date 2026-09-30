'use client'

import { useState, useEffect } from 'react'
import { X, Link2, FileVideo, Loader2, CheckCircle2, AlignLeft } from 'lucide-react'
import { addVideo } from '@/app/dashboard/actions'

interface Props { onClose: () => void }

async function fetchVideoTitle(url: string): Promise<string | null> {
  try {
    // YouTube oEmbed (no API key needed)
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`)
      if (res.ok) { const d = await res.json(); return d.title }
    }
    // Vimeo oEmbed
    if (url.includes('vimeo.com')) {
      const res = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`)
      if (res.ok) { const d = await res.json(); return d.title }
    }
  } catch { /* ignore */ }
  return null
}

export default function AddVideoModal({ onClose }: Props) {
  const [url, setUrl] = useState('')
  const [fetchedTitle, setFetchedTitle] = useState('')
  const [fetching, setFetching] = useState(false)
  const [summary, setSummary] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  // Debounce URL → auto-fetch title
  useEffect(() => {
    setFetchedTitle('')
    if (!url) return
    let valid = false
    try { new URL(url); valid = true } catch { /* invalid */ }
    if (!valid) return

    const t = setTimeout(async () => {
      setFetching(true)
      const title = await fetchVideoTitle(url)
      setFetchedTitle(title ?? '')
      setFetching(false)
    }, 600)
    return () => clearTimeout(t)
  }, [url])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimUrl = url.trim()
    if (!trimUrl) { setError('Please enter a video URL.'); return }
    try { new URL(trimUrl) } catch { setError('Please enter a valid URL.'); return }
    setError('')
    setPending(true)
    const fd = new FormData()
    fd.append('video_url', trimUrl)
    fd.append('title', fetchedTitle || new URL(trimUrl).hostname)
    if (summary.trim()) fd.append('summary', summary.trim())
    await addVideo(fd)
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
          <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-400">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* URL field */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Video URL</label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                autoFocus
                value={url}
                onChange={e => setUrl(e.target.value)}
                type="url"
                required
                placeholder="https://youtube.com/watch?v=..."
                className="w-full rounded-xl bg-slate-800 border border-slate-700/60 pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-500">Supports YouTube, Vimeo, and direct MP4 links</p>
          </div>

          {/* Auto-fetched title preview */}
          <div className="flex min-h-[2.5rem] items-center gap-2 rounded-xl bg-slate-800/50 border border-slate-700/40 px-3 py-2">
            {fetching ? (
              <><Loader2 className="h-4 w-4 animate-spin text-indigo-400 shrink-0" /><span className="text-xs text-slate-400">Fetching title…</span></>
            ) : fetchedTitle ? (
              <><CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /><span className="text-xs text-slate-200 line-clamp-1">{fetchedTitle}</span></>
            ) : (
              <span className="text-xs text-slate-500 italic">Title will be fetched automatically from the URL</span>
            )}
          </div>

          {/* Optional Summary */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-300">
              <AlignLeft className="h-3.5 w-3.5 text-violet-400" />
              Summary <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <textarea
              value={summary}
              onChange={e => setSummary(e.target.value)}
              rows={4}
              placeholder="Paste or type a summary of this video. You can include timestamps like 2:30 or 1:05:20 and they'll be clickable in the app."
              className="w-full resize-none rounded-xl bg-slate-800 border border-slate-700/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="mt-1 flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-700">
              Cancel
            </button>
            <button type="submit" disabled={pending}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60">
              {pending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : 'Save Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
