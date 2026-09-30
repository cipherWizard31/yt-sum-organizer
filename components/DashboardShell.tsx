'use client'

import { useState } from 'react'
import { Plus, FolderOpen, Folder as FolderIcon, Trash2, X, Check, Video } from 'lucide-react'
import AddVideoModal from './AddVideoModal'
import VideoCard from './VideoCard'
import { createFolder, deleteFolder, assignVideoToFolder } from '@/app/dashboard/actions'
import type { Video as VideoType, Folder } from '@/types'

interface Props {
  videos: VideoType[]
  folders: Folder[]
  fetchError?: string
}

export default function DashboardShell({ videos, folders, fetchError }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null) // null = All
  const [dragOverFolder, setDragOverFolder] = useState<string | null | 'unassigned'>('_none')
  const [newFolderName, setNewFolderName] = useState('')
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [savingFolder, setSavingFolder] = useState(false)
  const [deletingFolder, setDeletingFolder] = useState<string | null>(null)

  const filteredVideos = selectedFolder === null
    ? videos
    : selectedFolder === 'unassigned'
      ? videos.filter(v => !v.folder_id)
      : videos.filter(v => v.folder_id === selectedFolder)

  async function handleCreateFolder() {
    if (!newFolderName.trim()) return
    setSavingFolder(true)
    await createFolder(newFolderName)
    setNewFolderName('')
    setShowNewFolder(false)
    setSavingFolder(false)
  }

  async function handleDeleteFolder(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('Delete this folder? Videos inside will be unassigned.')) return
    setDeletingFolder(id)
    await deleteFolder(id)
    if (selectedFolder === id) setSelectedFolder(null)
    setDeletingFolder(null)
  }

  async function handleDrop(folderId: string | null) {
    const videoId = (window as unknown as { _dragVideoId?: string })._dragVideoId
    if (!videoId) return
    setDragOverFolder('_none')
    await assignVideoToFolder(videoId, folderId)
  }

  function onDragOver(e: React.DragEvent, id: string | null | 'unassigned') {
    e.preventDefault()
    setDragOverFolder(id as string)
  }

  return (
    <>
      {/* Folder Bar */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {/* All tab */}
        <FolderTab
          label="All"
          count={videos.length}
          active={selectedFolder === null}
          isDragOver={dragOverFolder === null}
          onClick={() => setSelectedFolder(null)}
          onDragOver={e => onDragOver(e, null)}
          onDrop={() => handleDrop(null)}
          onDragLeave={() => setDragOverFolder('_none')}
        />

        {/* Unassigned */}
        {folders.length > 0 && (
          <FolderTab
            label="Unassigned"
            count={videos.filter(v => !v.folder_id).length}
            active={selectedFolder === 'unassigned'}
            isDragOver={dragOverFolder === 'unassigned'}
            onClick={() => setSelectedFolder('unassigned')}
            onDragOver={e => onDragOver(e, 'unassigned')}
            onDrop={() => handleDrop(null)}
            onDragLeave={() => setDragOverFolder('_none')}
          />
        )}

        {/* User folders */}
        {folders.map(f => (
          <div
            key={f.id}
            onClick={() => setSelectedFolder(f.id)}
            onDragOver={e => onDragOver(e, f.id)}
            onDrop={() => handleDrop(f.id)}
            onDragLeave={() => setDragOverFolder('_none')}
            className={`group flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition select-none ${
              selectedFolder === f.id
                ? 'border-indigo-500/60 bg-indigo-500/20 text-indigo-300'
                : dragOverFolder === f.id
                  ? 'border-violet-500/60 bg-violet-500/20 text-violet-300'
                  : 'border-slate-700/60 bg-slate-800/60 text-slate-400 hover:border-slate-600 hover:text-slate-200'
            }`}
          >
            <FolderIcon className="h-3.5 w-3.5 shrink-0" />
            <span>{f.name}</span>
            <span className="rounded-full bg-slate-700/60 px-1.5 py-0.5 text-xs leading-none">
              {videos.filter(v => v.folder_id === f.id).length}
            </span>
            <button
              onClick={e => handleDeleteFolder(f.id, e)}
              disabled={deletingFolder === f.id}
              className="ml-0.5 hidden rounded p-0.5 text-slate-500 transition hover:text-red-400 group-hover:block"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {/* New folder input / button */}
        {showNewFolder ? (
          <div className="flex items-center gap-1.5">
            <input
              autoFocus
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreateFolder(); if (e.key === 'Escape') setShowNewFolder(false) }}
              placeholder="Folder name…"
              className="rounded-xl border border-indigo-500/40 bg-slate-800 px-3 py-1.5 text-sm text-white outline-none placeholder-slate-500 w-36"
            />
            <button onClick={handleCreateFolder} disabled={savingFolder}
              className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-emerald-400 transition hover:bg-slate-700">
              <Check className="h-4 w-4" />
            </button>
            <button onClick={() => setShowNewFolder(false)}
              className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-400 transition hover:bg-slate-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button onClick={() => setShowNewFolder(true)}
            className="flex items-center gap-1.5 rounded-xl border border-dashed border-slate-700/60 px-3 py-1.5 text-sm text-slate-500 transition hover:border-slate-500 hover:text-slate-300">
            <Plus className="h-3.5 w-3.5" /> New Folder
          </button>
        )}

        {/* Spacer + Add Video button */}
        <div className="ml-auto">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-500 hover:to-violet-500"
          >
            <Plus className="h-4 w-4" /> Add Video
          </button>
        </div>
      </div>

      {/* Error */}
      {fetchError && (
        <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          Failed to load videos: {fetchError}
        </div>
      )}

      {/* Empty state */}
      {filteredVideos.length === 0 && !fetchError && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700/60 bg-slate-900/30 py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800">
            {selectedFolder !== null ? <FolderOpen className="h-8 w-8 text-slate-500" /> : <Video className="h-8 w-8 text-slate-500" />}
          </div>
          <h3 className="mb-1 text-lg font-semibold text-white">
            {selectedFolder !== null ? 'No videos in this folder' : 'No videos yet'}
          </h3>
          <p className="mb-6 text-sm text-slate-400">
            {selectedFolder !== null ? 'Drag a video here or add a new one.' : 'Add your first video to get started.'}
          </p>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:from-indigo-500 hover:to-violet-500">
            <Plus className="h-4 w-4" /> Add Video
          </button>
        </div>
      )}

      {/* Video Grid */}
      {filteredVideos.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredVideos.map(video => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}

      {showModal && <AddVideoModal onClose={() => setShowModal(false)} />}
    </>
  )
}

function FolderTab({ label, count, active, isDragOver, onClick, onDragOver, onDrop, onDragLeave }: {
  label: string; count: number; active: boolean; isDragOver: boolean;
  onClick: () => void; onDragOver: (e: React.DragEvent) => void; onDrop: () => void; onDragLeave: () => void;
}) {
  return (
    <div
      onClick={onClick}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragLeave={onDragLeave}
      className={`flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition select-none ${
        active ? 'border-indigo-500/60 bg-indigo-500/20 text-indigo-300'
        : isDragOver ? 'border-violet-500/60 bg-violet-500/20 text-violet-300'
        : 'border-slate-700/60 bg-slate-800/60 text-slate-400 hover:border-slate-600 hover:text-slate-200'
      }`}
    >
      <FolderOpen className="h-3.5 w-3.5 shrink-0" />
      <span>{label}</span>
      <span className="rounded-full bg-slate-700/60 px-1.5 py-0.5 text-xs leading-none">{count}</span>
    </div>
  )
}
