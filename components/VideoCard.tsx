'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Play, Calendar, ExternalLink } from 'lucide-react'
import { deleteVideo } from '@/app/dashboard/actions'
import type { Video } from '@/types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm(`Delete "${video.title}"?`)) return
    setDeleting(true)
    await deleteVideo(video.id)
    setDeleting(false)
  }

  return (
    <div
      onClick={() => router.push(`/watch/${video.id}`)}
      className="group relative flex cursor-pointer flex-col gap-3 rounded-2xl border border-slate-800/60 bg-slate-900/60 p-5 transition duration-200 hover:border-indigo-500/40 hover:bg-slate-800/60 hover:shadow-lg hover:shadow-indigo-500/5"
    >
      {/* Thumbnail placeholder */}
      <div className="flex h-36 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/40 transition group-hover:from-indigo-900/30 group-hover:to-slate-900">
        <Play className="h-10 w-10 text-slate-600 transition group-hover:text-indigo-400" />
      </div>

      {/* Platform badge */}
      <span className="absolute top-8 left-8 rounded-md bg-black/60 px-2 py-0.5 text-xs font-medium text-slate-300 backdrop-blur-sm">
        {getPlatformBadge(video.video_url)}
      </span>

      <div className="flex flex-col gap-1">
        <h3 className="line-clamp-2 text-sm font-semibold text-white transition group-hover:text-indigo-200">
          {video.title}
        </h3>
        <a
          href={video.video_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="flex items-center gap-1 text-xs text-slate-500 transition hover:text-indigo-400"
        >
          <ExternalLink className="h-3 w-3" />
          <span className="truncate max-w-[180px]">{video.video_url}</span>
        </a>
      </div>

      <div className="flex items-center justify-between border-t border-slate-800/60 pt-3">
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
  )
}
