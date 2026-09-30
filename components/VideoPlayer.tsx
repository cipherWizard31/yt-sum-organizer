'use client'

import { useState, useRef, forwardRef, useImperativeHandle } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import to avoid SSR issues
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false })

export interface VideoPlayerHandle {
  getCurrentTime: () => number
  seekTo: (seconds: number) => void
}

interface VideoPlayerProps {
  url: string
}

const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(({ url }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [ready, setReady] = useState(false)

  useImperativeHandle(ref, () => ({
    getCurrentTime: () => videoRef.current?.currentTime ?? 0,
    seekTo: (seconds: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = seconds
      }
    },
  }))

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-black" style={{ paddingTop: '56.25%' }}>
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 rounded-2xl">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-500" />
        </div>
      )}
      <div className="absolute inset-0">
        <ReactPlayer
          ref={videoRef}
          src={url}
          controls
          width="100%"
          height="100%"
          onReady={() => setReady(true)}
          style={{ position: 'absolute', top: 0, left: 0 }}
        />
      </div>
    </div>
  )
})

VideoPlayer.displayName = 'VideoPlayer'
export default VideoPlayer
