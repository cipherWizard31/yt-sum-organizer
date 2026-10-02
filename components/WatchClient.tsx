'use client'

import { useRef, useState } from 'react'
import VideoPlayer, { type VideoPlayerHandle } from '@/components/VideoPlayer'
import AddTimestampForm from '@/components/AddTimestampForm'
import TimestampList from '@/components/TimestampList'
import SummaryList from '@/components/SummaryList'
import type { TimestampNote, Summary } from '@/types'
import { Clock, FileText, Sparkles } from 'lucide-react'

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
    <div className="flex flex-col gap-6">
      {/* Top row: Video Player + Capture sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Player Left Column */}
        <div className="lg:col-span-8 rounded-2xl overflow-hidden bg-[#181b25] border border-[#262a34] shadow-xl">
          <VideoPlayer ref={playerRef} url={videoUrl} />
        </div>

        {/* Capture Panel Right Column */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <AddTimestampForm videoId={videoId} playerRef={playerRef} />
        </div>
      </div>

      {/* Studio Tabs & Content Section */}
      <div className="flex flex-col gap-4">
        {/* Tab Switcher */}
        <div className="flex items-center justify-between border-b border-[#262a34] pb-3">
          <div className="flex rounded-full bg-[#1c1f29] border border-[#262a34] p-1 gap-1 w-full max-w-xs shadow-inner">
            <button
              onClick={() => setTab('notes')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-1.5 text-xs font-semibold transition active:scale-95 ${
                tab === 'notes'
                  ? 'bg-[#d0bcff] text-[#3c0091] shadow-sm'
                  : 'text-[#cbc3d7] hover:text-white'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Timestamp Notes</span>
              <span
                className={`ml-1 rounded-full px-1.5 py-0.2 font-mono text-[10px] ${
                  tab === 'notes' ? 'bg-[#3c0091]/20 text-[#3c0091]' : 'bg-[#262a34] text-[#958ea0]'
                }`}
              >
                {timestamps.length}
              </span>
            </button>

            <button
              onClick={() => setTab('summaries')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-1.5 text-xs font-semibold transition active:scale-95 ${
                tab === 'summaries'
                  ? 'bg-[#d0bcff] text-[#3c0091] shadow-sm'
                  : 'text-[#cbc3d7] hover:text-white'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>AI Summaries</span>
              <span
                className={`ml-1 rounded-full px-1.5 py-0.2 font-mono text-[10px] ${
                  tab === 'summaries' ? 'bg-[#3c0091]/20 text-[#3c0091]' : 'bg-[#262a34] text-[#958ea0]'
                }`}
              >
                {summaries.length}
              </span>
            </button>
          </div>
        </div>

        {/* Tab panels */}
        {tab === 'notes' ? (
          <div className="rounded-2xl bg-[#181b25] border border-[#262a34] p-4 sm:p-6 shadow-sm">
            <TimestampList timestamps={timestamps} videoId={videoId} playerRef={playerRef} />
          </div>
        ) : (
          <div className="rounded-2xl bg-[#181b25] border border-[#262a34] p-4 sm:p-6 shadow-sm">
            <SummaryList
              summaries={summaries}
              videoId={videoId}
              onSeek={(seconds) => playerRef.current?.seekTo(seconds)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
