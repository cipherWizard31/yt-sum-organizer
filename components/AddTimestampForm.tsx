'use client'

import { useState, useRef } from 'react'
import { Timer, Plus, Loader2, Sparkles, CheckCircle2 } from 'lucide-react'
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
    <div className="rounded-2xl border border-[#262a34] bg-[#181b25] p-4 sm:p-5 shadow-lg flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#cbc3d7]">
          <Timer className="h-4 w-4 text-[#d0bcff]" />
          <span>Note Capture</span>
        </h3>
        {capturedTime !== null && (
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-full bg-[#d0bcff]/20 text-[#d0bcff]">
            {formatTime(capturedTime)}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={captureTimestamp}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#a078ff]/30 bg-[#a078ff]/10 hover:bg-[#a078ff]/20 py-2.5 text-xs sm:text-sm font-semibold text-[#d0bcff] transition active:scale-[0.98]"
      >
        <Timer className="h-4 w-4" />
        <span>Capture Current Timestamp</span>
      </button>

      {capturedTime !== null && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-1">
          <textarea
            ref={noteRef}
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={`Add key takeaway or chapter note for ${formatTime(capturedTime)}...`}
            className="w-full resize-none rounded-xl bg-[#1c1f29] border border-[#262a34] p-3 text-sm text-[#dfe2ef] placeholder-[#958ea0] focus:border-[#d0bcff] focus:outline-none focus:ring-1 focus:ring-[#d0bcff]/40 transition"
          />

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setCapturedTime(null)
                setNote('')
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#958ea0] hover:text-[#dfe2ef]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending || !note.trim()}
              className="flex items-center gap-1.5 rounded-full bg-[#a078ff] hover:bg-[#d0bcff] px-4 py-1.5 text-xs font-semibold text-[#340080] shadow-md shadow-[#a078ff]/20 transition active:scale-95 disabled:opacity-50"
            >
              {pending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  <span>Save Note</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {success && (
        <div className="flex items-center gap-2 text-xs text-[#45dfa4] pt-1">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Timestamp note saved to timeline!</span>
        </div>
      )}
    </div>
  )
}
