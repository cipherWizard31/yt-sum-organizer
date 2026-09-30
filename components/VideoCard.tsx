'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Play, Calendar } from 'lucide-react'
import { deleteVideo } from '@/app/dashboard/actions'
import type { Video } from '@/types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getYouTubeThumbnail(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null
}

function getPlatformBadge(url: string): string {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube'
  if (url.includes('vimeo.com')) return 'Vimeo'
  if (url.match(/\.(mp4|webm|ogg)$/i)) return 'MP4'
  return 'Video'
}

export default function VideoCard({ video }: { video: Video }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [imgError, setImgError] = useState(false)
  const thumbnail = getYouTubeThumbnail(video.video_url)

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm(`Delete "${video.title}"?`)) return
    setDeleting(true)
    await deleteVideo(video.id)
    setDeleting(false)
  }

  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.setData('text/plain', video.id)
    // Also store on window for drop handlers
    ;(window as unknown as { _dragVideoId?: string })._dragVideoId = video.id
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => router.push(`/watch/${video.id}`)}
      className="group relative flex cursor-pointer flex-col gap-0 rounded-2xl border border-slate-800/60 bg-slate-900/60 overflow-hidden transition duration-200 hover:border-indigo-500/40 hover:bg-slate-800/60 hover:shadow-lg hover:shadow-indigo-500/5"
    >
      {/* Thumbnail */}
      <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
        {thumbnail && !imgError ? (
          <img
            src={thumbnail}
            alt={video.title}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <Play className="h-10 w-10 text-slate-600 transition group-hover:text-indigo-400" />
        )}
        {/* Platform badge */}
        <span className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-0.5 text-xs font-medium text-slate-300 backdrop-blur-sm">
          {getPlatformBadge(video.video_url)}
        </span>
        {/* Drag handle hint */}
        <span className="absolute top-2 right-2 hidden rounded-md bg-black/60 px-1.5 py-0.5 text-xs text-slate-400 group-hover:block">
          drag
        </span>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-white transition group-hover:text-indigo-200">
          {video.title}
        </h3>
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 mt-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(video.created_at)}
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
            title="Delete video"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
