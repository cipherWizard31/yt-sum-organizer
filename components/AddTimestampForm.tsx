'use client'

import { useState, useRef } from 'react'
import { Timer, Plus, Loader2 } from 'lucide-react'
import { addTimestamp } from '@/app/watch/[videoId]/actions'
import type { VideoPlayerHandle } from './VideoPlayer'

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

interface Props {
  videoId: string
  playerRef: React.RefObject<VideoPlayerHandle | null>
}

export default function AddTimestampForm({ videoId, playerRef }: Props) {
  const [capturedTime, setCapturedTime] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [pending, setPending] = useState(false)
  const [success, setSuccess] = useState(false)
  const noteRef = useRef<HTMLTextAreaElement>(null)

  function captureTimestamp() {
    const t = playerRef.current?.getCurrentTime() ?? 0
    setCapturedTime(t)
    setSuccess(false)
    setTimeout(() => noteRef.current?.focus(), 50)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (capturedTime === null || !note.trim()) return
    setPending(true)
    const fd = new FormData()
    fd.append('video_id', videoId)
    fd.append('time_in_seconds', String(capturedTime))
    fd.append('note_text', note.trim())
    await addTimestamp(fd)
    setPending(false)
    setSuccess(true)
    setNote('')
    setCapturedTime(null)
  }

  return (
    <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-300">
        <Timer className="h-4 w-4 text-indigo-400" />
        Capture Timestamp
      </h3>

      <button
        type="button"
        onClick={captureTimestamp}
        className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 py-2.5 text-sm font-medium text-indigo-300 transition hover:bg-indigo-500/20"
      >
        <Timer className="h-4 w-4" />
        {capturedTime !== null
          ? `Re-capture (currently ${formatTime(capturedTime)})`
          : 'Capture Current Time'}
      </button>

      {capturedTime !== null && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-slate-800/60 px-3 py-2">
            <span className="rounded-md bg-indigo-600/30 px-2 py-0.5 text-xs font-mono font-semibold text-indigo-300">
              {formatTime(capturedTime)}
            </span>
            <span className="text-xs text-slate-400">captured</span>
          </div>

          <textarea
            ref={noteRef}
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Add your note for this moment…"
            rows={3}
            className="w-full resize-none rounded-xl bg-slate-800 border border-slate-700/60 px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />

          <button
            type="submit"
            disabled={pending || !note.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Plus className="h-4 w-4" /> Save Note</>}
          </button>
        </form>
      )}

      {success && (
        <p className="mt-2 text-center text-xs text-emerald-400">✓ Note saved successfully!</p>
      )}
    </div>
  )
}
