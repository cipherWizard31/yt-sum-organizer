'use client'

import { useState, useEffect } from 'react'
import { X, Link2, FileVideo, Loader2, CheckCircle2, AlignLeft, Sparkles, Folder as FolderIcon, ClipboardPaste } from 'lucide-react'
import { addVideo } from '@/app/dashboard/actions'
import type { Folder } from '@/types'

interface Props {
  folders?: Folder[]
  selectedFolderId?: string | null
  onClose: () => void
}

async function fetchVideoTitle(url: string): Promise<string | null> {
  try {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`)
      if (res.ok) {
        const d = await res.json()
        return d.title
      }
    }
    if (url.includes('vimeo.com')) {
      const res = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`)
      if (res.ok) {
        const d = await res.json()
        return d.title
      }
    }
  } catch {
    /* ignore network / cors */
  }
  return null
}

export default function AddVideoModal({ folders = [], selectedFolderId, onClose }: Props) {
  const [url, setUrl] = useState('')
  const [fetchedTitle, setFetchedTitle] = useState('')
  const [fetching, setFetching] = useState(false)
  const [summary, setSummary] = useState('')
  const [targetFolder, setTargetFolder] = useState<string>(selectedFolderId && selectedFolderId !== 'unassigned' ? selectedFolderId : '')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  // Debounced title lookup
  useEffect(() => {
    setFetchedTitle('')
    if (!url) return
    let valid = false
    try {
      new URL(url)
      valid = true
    } catch {
      /* invalid url */
    }
    if (!valid) return

    const t = setTimeout(async () => {
      setFetching(true)
      const title = await fetchVideoTitle(url)
      setFetchedTitle(title ?? '')
      setFetching(false)
    }, 500)
    return () => clearTimeout(t)
  }, [url])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText()
      if (text) setUrl(text.trim())
    } catch {
      /* clipboard read permission not granted */
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimUrl = url.trim()
    if (!trimUrl) {
      setError('Please enter a video URL.')
      return
    }
    try {
      new URL(trimUrl)
    } catch {
      setError('Please enter a valid URL (e.g. https://www.youtube.com/watch?v=...)')
      return
    }

    setError('')
    setPending(true)
    const fd = new FormData()
    fd.append('video_url', trimUrl)
    fd.append('title', fetchedTitle || new URL(trimUrl).hostname)
    if (targetFolder) fd.append('folder_id', targetFolder)
    if (summary.trim()) fd.append('summary', summary.trim())

    await addVideo(fd)
    setPending(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#0a0e17]/80 backdrop-blur-md transition-all">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#181b25] border border-[#262a34] p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
        {/* Stitch handle bar for mobile */}
        <div className="flex flex-col items-center gap-2 mb-4 sm:hidden">
          <div className="w-12 h-1.5 rounded-full bg-[#31353f]" />
        </div>

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#262a34]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#a078ff]/15 border border-[#a078ff]/30 flex items-center justify-center text-[#d0bcff]">
              <FileVideo className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#dfe2ef]">Queue YouTube Video</h2>
              <p className="text-xs text-[#cbc3d7]/70">Auto-sync metadata, notes, and chapters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#958ea0] hover:text-[#dfe2ef] hover:bg-[#262a34] transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-[#93000a]/20 border border-[#93000a]/40 px-3.5 py-2.5 text-xs text-[#ffb4ab]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          {/* YouTube Video URL */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#cbc3d7]" htmlFor="yt-url-input">
              YouTube Video URL
            </label>
            <div className="relative flex items-center">
              <Link2 className="absolute left-3.5 h-4 w-4 text-[#958ea0]" />
              <input
                id="yt-url-input"
                autoFocus
                type="url"
                required
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full h-12 pl-10 pr-22 rounded-xl bg-[#1c1f29] border border-[#262a34] text-sm text-[#dfe2ef] placeholder-[#958ea0] focus:outline-none focus:border-[#d0bcff] focus:ring-1 focus:ring-[#d0bcff]/40 transition"
              />
              <button
                type="button"
                onClick={handlePaste}
                className="absolute right-2 px-2.5 h-8 rounded-lg bg-[#262a34] text-[#d0bcff] hover:bg-[#31353f] text-xs font-medium flex items-center gap-1 transition active:scale-95"
              >
                <ClipboardPaste className="h-3.5 w-3.5" />
                Paste
              </button>
            </div>
          </div>

          {/* Auto-fetch Preview Box */}
          <div className="p-3.5 rounded-xl bg-[#1c1f29] border border-[#262a34] flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#958ea0]">
              <span>METADATA PREVIEW</span>
              <span className="inline-flex items-center gap-1.5 text-[#45dfa4]">
                <span className={`w-2 h-2 rounded-full bg-[#45dfa4] ${fetching ? 'animate-ping' : ''}`} />
                {fetching ? 'Fetching...' : fetchedTitle ? 'Auto-Sync Ready' : 'Awaiting URL'}
              </span>
            </div>

            <div className="text-[13px] font-medium text-[#dfe2ef] line-clamp-2 min-h-[1.5rem]">
              {fetching ? (
                <span className="inline-flex items-center gap-2 text-[#958ea0]">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#d0bcff]" />
                  Querying video title & chapters...
                </span>
              ) : fetchedTitle ? (
                fetchedTitle
              ) : (
                <span className="text-[#958ea0] italic text-xs">
                  Paste a YouTube video link to auto-extract title
                </span>
              )}
            </div>
          </div>

          {/* Target Folder Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#cbc3d7]">
              Save to Study Folder
            </label>
            <div className="relative">
              <select
                value={targetFolder}
                onChange={e => setTargetFolder(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-[#1c1f29] border border-[#262a34] text-sm text-[#dfe2ef] appearance-none focus:outline-none focus:border-[#d0bcff]"
              >
                <option value="">Unassigned</option>
                {folders.map(f => (
                  <option key={f.id} value={f.id}>
                    📁 {f.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#958ea0]">
                <FolderIcon className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Optional Summary */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#cbc3d7]">
              <span>Key Takeaway / Summary</span>
              <span className="text-[11px] font-normal text-[#958ea0] lowercase">(optional)</span>
            </label>
            <textarea
              value={summary}
              onChange={e => setSummary(e.target.value)}
              rows={3}
              placeholder="Paste summary or note down initial timestamps like 02:45 for quick reference..."
              className="w-full resize-none rounded-xl bg-[#1c1f29] border border-[#262a34] px-3.5 py-2.5 text-sm text-[#dfe2ef] placeholder-[#958ea0] focus:outline-none focus:border-[#d0bcff] focus:ring-1 focus:ring-[#d0bcff]/40 transition"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={pending}
              className="w-full h-12 rounded-full bg-[#a078ff] hover:bg-[#d0bcff] text-[#340080] font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#a078ff]/20 active:scale-[0.98] transition disabled:opacity-60"
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[#340080]" />
                  <span>Processing Video...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-[#340080]" />
                  <span>Extract Timestamps &amp; Save</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
