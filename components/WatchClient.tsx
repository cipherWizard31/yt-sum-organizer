'use client'

import { useRef, useState } from 'react'
import VideoPlayer, { type VideoPlayerHandle } from '@/components/VideoPlayer'
import AddTimestampForm from '@/components/AddTimestampForm'
import TimestampList from '@/components/TimestampList'
import SummaryList from '@/components/SummaryList'
import type { TimestampNote, Summary } from '@/types'
import { Clock, FileText } from 'lucide-react'

interface Props {
  videoUrl: string
  videoId: string
  timestamps: TimestampNote[]
  summaries: Summary[]
}

export default function WatchClient({ videoUrl, videoId, timestamps, summaries }: Props) {
  const playerRef = useRef<VideoPlayerHandle>(null)
  const [tab, setTab] = useState<'notes' | 'summaries'>('notes')

  return (
    <div className="flex flex-col gap-5">
      {/* Top row: player + capture sidebar (always visible) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <VideoPlayer ref={playerRef} url={videoUrl} />
        </div>
        {/* Capture timestamp panel — always on the right, regardless of tab */}
        <div className="flex flex-col gap-3">
          <AddTimestampForm videoId={videoId} playerRef={playerRef} />
        </div>
      </div>

      {/* Bottom: tabs + content */}
      <div className="flex flex-col gap-3">
        {/* Tab switcher */}
        <div className="flex rounded-xl bg-slate-800/60 border border-slate-700/40 p-1 gap-1 w-full max-w-xs">
          <button
            onClick={() => setTab('notes')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition ${
              tab === 'notes' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            Notes
            <span className="ml-1 rounded-full bg-slate-600/60 px-1.5 py-0.5 text-xs leading-none">{timestamps.length}</span>
          </button>
          <button
            onClick={() => setTab('summaries')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition ${
              tab === 'summaries' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            Summaries
            <span className="ml-1 rounded-full bg-slate-600/60 px-1.5 py-0.5 text-xs leading-none">{summaries.length}</span>
          </button>
        </div>

        {/* Tab content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            {tab === 'notes' ? (
              <TimestampList timestamps={timestamps} videoId={videoId} playerRef={playerRef} />
            ) : (
              <SummaryList summaries={summaries} videoId={videoId} playerRef={playerRef} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
