'use client'

import { useState } from 'react'
import { Trash2, Clock, Play } from 'lucide-react'
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
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#262a34] bg-[#1c1f29]/40 py-12 text-center">
        <Clock className="mb-2 h-7 w-7 text-[#958ea0]" />
        <p className="text-sm font-semibold text-[#dfe2ef]">No notes captured yet</p>
        <p className="mt-1 text-xs text-[#cbc3d7]/70">
          Click &ldquo;Capture Current Timestamp&rdquo; while watching to bookmark moments.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2.5">
      {timestamps.map((ts) => (
        <div
          key={ts.id}
          onClick={() => handleSeek(ts.time_in_seconds)}
          className="group flex cursor-pointer items-start gap-3 rounded-xl border border-[#262a34] bg-[#1c1f29] p-3.5 transition-all duration-150 hover:border-[#a078ff]/40 hover:bg-[#262a34]/60 active:scale-[0.99]"
        >
          {/* Timestamp seek badge */}
          <button
            type="button"
            className="mt-0.5 shrink-0 inline-flex items-center gap-1 rounded-full bg-[#d0bcff]/15 px-2.5 py-1 text-xs font-mono font-bold text-[#d0bcff] transition group-hover:bg-[#d0bcff] group-hover:text-[#3c0091]"
          >
            <Play className="h-2.5 w-2.5 fill-current" />
            <span>{formatTime(ts.time_in_seconds)}</span>
          </button>

          {/* Note content */}
          <p className="flex-1 text-sm leading-relaxed text-[#dfe2ef] group-hover:text-white">
            {ts.note_text}
          </p>

          {/* Delete timestamp button */}
          <button
            type="button"
            onClick={(e) => handleDelete(e, ts.id)}
            disabled={deletingId === ts.id}
            aria-label="Delete timestamp"
            className="shrink-0 rounded-lg p-1.5 text-[#958ea0] opacity-0 transition group-hover:opacity-100 hover:text-[#ffb4ab] hover:bg-[#93000a]/20 disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
