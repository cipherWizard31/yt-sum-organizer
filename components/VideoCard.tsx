'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Play, Calendar, GripVertical, Clock, FileText, Folder as FolderIcon } from 'lucide-react'
import { deleteVideo } from '@/app/dashboard/actions'
import type { Video, Folder } from '@/types'

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60)
  if (diffHours < 24) {
    if (diffHours < 1) return 'Just now'
    return `${Math.floor(diffHours)}h ago`
  }
  if (diffHours < 24 * 7) {
    return `${Math.floor(diffHours / 24)}d ago`
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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

interface VideoCardProps {
  video: Video
  folderName?: string | null
  noteCount?: number
  summaryCount?: number
}

export default function VideoCard({
  video,
  folderName,
  noteCount = 0,
  summaryCount = 0,
}: VideoCardProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [imgError, setImgError] = useState(false)
  const thumbnail = getYouTubeThumbnail(video.video_url)

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm(`Delete "${video.title}"? This cannot be undone.`)) return
    setDeleting(true)
    await deleteVideo(video.id)
    setDeleting(false)
  }

  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.setData('text/plain', video.id)
    ;(window as unknown as { _dragVideoId?: string })._dragVideoId = video.id
  }

  return (
    <article
      draggable
      onDragStart={handleDragStart}
      onClick={() => router.push(`/watch/${video.id}`)}
      className="group relative flex cursor-pointer flex-col rounded-2xl bg-[#1c1f29] border border-[#262a34] p-3.5 sm:p-4 shadow-md transition-all duration-200 hover:border-[#a078ff]/50 hover:bg-[#262a34]/60 hover:shadow-lg hover:shadow-[#a078ff]/5 active:scale-[0.99]"
    >
      {/* Top media & info row */}
      <div className="flex gap-3 sm:gap-4 items-start">
        {/* Thumbnail container */}
        <div className="relative w-28 h-20 sm:w-32 sm:h-22 shrink-0 rounded-xl overflow-hidden bg-[#0f131c] border border-[#262a34] flex items-center justify-center">
          {thumbnail && !imgError ? (
            <img
              src={thumbnail}
              alt={video.title}
              onError={() => setImgError(true)}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#181b25] to-[#262a34]">
              <Play className="h-6 w-6 text-[#958ea0]" />
            </div>
          )}

          {/* Platform play indicator */}
          <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-[#ffb4ab] flex items-center justify-center shadow">
            <Play className="h-2.5 w-2.5 fill-[#690005] text-[#690005] ml-0.5" />
          </div>
        </div>

        {/* Video metadata column */}
        <div className="flex-1 min-w-0 flex flex-col justify-between h-20 sm:h-22">
          <div className="flex items-start justify-between gap-1.5">
            <h3 className="text-[14px] sm:text-[15px] font-semibold text-[#dfe2ef] line-clamp-2 leading-snug group-hover:text-white transition">
              {video.title}
            </h3>
            {/* Drag affordance */}
            <div
              title="Drag into a folder"
              className="shrink-0 text-[#958ea0]/70 hover:text-[#dfe2ef] p-0.5 cursor-grab active:cursor-grabbing"
              onClick={e => e.stopPropagation()}
            >
              <GripVertical className="h-4 w-4" />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#cbc3d7]/80">
            <span className="inline-flex items-center gap-1.5 text-[#7bd0ff] font-mono text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7bd0ff]"></span>
              {getPlatformBadge(video.video_url)}
            </span>
            <span className="text-[#958ea0]">•</span>
            <span className="text-[#958ea0]">{formatDate(video.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Bottom status pills & actions */}
      <div className="flex items-center justify-between gap-2 pt-3 mt-2 border-t border-[#262a34]/60">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Notes badge */}
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#262a34] text-[#dfe2ef] font-mono text-[11px]">
            <Clock className="h-3 w-3 text-[#d0bcff]" />
            {noteCount} note{noteCount !== 1 ? 's' : ''}
          </span>

          {/* Summaries badge */}
          {summaryCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#262a34] text-[#dfe2ef] font-mono text-[11px]">
              <FileText className="h-3 w-3 text-[#45dfa4]" />
              {summaryCount}
            </span>
          )}

          {/* Folder pill badge */}
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
              folderName
                ? 'bg-[#a078ff]/15 text-[#d0bcff]'
                : 'bg-[#262a34]/60 text-[#958ea0]'
            }`}
          >
            <FolderIcon className="h-3 w-3" />
            {folderName ?? 'Unassigned'}
          </span>
        </div>

        {/* Delete action */}
        <button
          onClick={handleDelete}
          disabled={deleting}
          aria-label="Delete video"
          className="h-8 w-8 rounded-full flex items-center justify-center text-[#958ea0] hover:text-[#ffb4ab] hover:bg-[#93000a]/20 transition active:scale-90 disabled:opacity-40"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </article>
  )
}
