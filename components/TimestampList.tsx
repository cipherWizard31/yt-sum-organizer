'use client'

import { useState } from 'react'
import { Trash2, Clock } from 'lucide-react'
import { deleteTimestamp } from '@/app/watch/[videoId]/actions'
import type { TimestampNote } from '@/types'
import type { VideoPlayerHandle } from './VideoPlayer'

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

interface Props {
  timestamps: TimestampNote[]
  videoId: string
  playerRef: React.RefObject<VideoPlayerHandle | null>
}

export default function TimestampList({ timestamps, videoId, playerRef }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    setDeletingId(id)
    await deleteTimestamp(id, videoId)
    setDeletingId(null)
  }

  function handleSeek(seconds: number) {
    playerRef.current?.seekTo(seconds)
  }

  if (timestamps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700/60 bg-slate-900/30 py-12 text-center">
        <Clock className="mb-3 h-8 w-8 text-slate-600" />
        <p className="text-sm font-medium text-slate-400">No notes yet</p>
        <p className="mt-1 text-xs text-slate-500">Capture a timestamp while the video plays</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {timestamps.map((ts) => (
        <div
          key={ts.id}
          onClick={() => handleSeek(ts.time_in_seconds)}
          className="group flex cursor-pointer items-start gap-3 rounded-xl border border-slate-800/60 bg-slate-900/60 p-3.5 transition hover:border-indigo-500/40 hover:bg-slate-800/50"
        >
          <span className="mt-0.5 shrink-0 rounded-lg bg-indigo-600/20 px-2 py-1 text-xs font-mono font-bold text-indigo-300 transition group-hover:bg-indigo-600/30">
            {formatTime(ts.time_in_seconds)}
          </span>
          <p className="flex-1 text-sm leading-relaxed text-slate-300 group-hover:text-white">
            {ts.note_text}
          </p>
          <button
            onClick={(e) => handleDelete(e, ts.id)}
            disabled={deletingId === ts.id}
            className="shrink-0 rounded-lg p-1 text-slate-600 opacity-0 transition hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100 disabled:opacity-40"
            title="Delete note"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
