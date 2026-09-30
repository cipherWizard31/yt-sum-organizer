'use client'

import { useRef } from 'react'
import VideoPlayer, { type VideoPlayerHandle } from '@/components/VideoPlayer'
import AddTimestampForm from '@/components/AddTimestampForm'
import TimestampList from '@/components/TimestampList'
import type { TimestampNote } from '@/types'

interface Props {
  videoUrl: string
  videoId: string
  timestamps: TimestampNote[]
}

export default function WatchClient({ videoUrl, videoId, timestamps }: Props) {
  const playerRef = useRef<VideoPlayerHandle>(null)

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Left: Player */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <VideoPlayer ref={playerRef} url={videoUrl} />
        <AddTimestampForm videoId={videoId} playerRef={playerRef} />
      </div>

      {/* Right: Sidebar */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-300">
            Notes ({timestamps.length})
          </h2>
          <span className="text-xs text-slate-500">Click a note to jump</span>
        </div>
        <div className="max-h-[calc(100vh-18rem)] overflow-y-auto pr-0.5 scrollbar-thin">
          <TimestampList timestamps={timestamps} videoId={videoId} playerRef={playerRef} />
        </div>
      </div>
    </div>
  )
}
