'use client'

import { useState, useMemo } from 'react'
import { Plus, Folder as FolderIcon, Trash2, X, Check, Search, ArrowUpDown, FolderPlus, Sparkles, AlertCircle } from 'lucide-react'
import AddVideoModal from './AddVideoModal'
import VideoCard from './VideoCard'
import { createFolder, deleteFolder, assignVideoToFolder } from '@/app/dashboard/actions'
import type { Video as VideoType, Folder } from '@/types'

interface Props {
  videos: VideoType[]
  folders: Folder[]
  fetchError?: string
  userEmail?: string
}

export default function DashboardShell({ videos, folders, fetchError, userEmail }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null) // null = All
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest' | 'title'>('recent')
  const [dragOverFolder, setDragOverFolder] = useState<string | null | 'unassigned'>('_none')
  const [newFolderName, setNewFolderName] = useState('')
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [savingFolder, setSavingFolder] = useState(false)
  const [deletingFolder, setDeletingFolder] = useState<string | null>(null)
  const [folderActionError, setFolderActionError] = useState<string | null>(null)

  // Filter & Search logic
  const filteredVideos = useMemo(() => {
    let result = videos

    // Folder filtering
    if (selectedFolder === 'unassigned') {
      result = result.filter(v => !v.folder_id)
    } else if (selectedFolder !== null) {
      result = result.filter(v => v.folder_id === selectedFolder)
    }

    // Text search in title
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(v => v.title.toLowerCase().includes(q) || v.video_url.toLowerCase().includes(q))
    }

    // Sort order
    return [...result].sort((a, b) => {
      if (sortOrder === 'recent') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
      if (sortOrder === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      }
      return a.title.localeCompare(b.title)
    })
  }, [videos, selectedFolder, searchQuery, sortOrder])

  // Map folder id to name
  const folderMap = useMemo(() => {
    const map = new Map<string, string>()
    folders.forEach(f => map.set(f.id, f.name))
    return map
  }, [folders])

  async function handleCreateFolder() {
    const trimmed = newFolderName.trim()
    if (!trimmed) return
    setSavingFolder(true)
    setFolderActionError(null)
    try {
      const res = await createFolder(trimmed)
      if (res?.error) {
        setFolderActionError(res.error)
      } else {
        setNewFolderName('')
        setShowNewFolder(false)
      }
    } catch (err: unknown) {
      setFolderActionError(err instanceof Error ? err.message : 'Failed to create folder')
    } finally {
      setSavingFolder(false)
    }
  }

  async function handleDeleteFolder(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('Delete this collection folder? Videos inside will become unassigned.')) return
    setDeletingFolder(id)
    setFolderActionError(null)
    try {
      const res = await deleteFolder(id)
      if (res?.error) {
        setFolderActionError(res.error)
      } else if (selectedFolder === id) {
        setSelectedFolder(null)
      }
    } catch (err: unknown) {
      setFolderActionError(err instanceof Error ? err.message : 'Failed to delete folder')
    } finally {
      setDeletingFolder(null)
    }
  }

  async function handleDrop(folderId: string | null) {
    const videoId = (window as unknown as { _dragVideoId?: string })._dragVideoId
    setDragOverFolder('_none')
    if (!videoId) return
    try {
      await assignVideoToFolder(videoId, folderId)
    } catch {
      // silently handle
    }
  }

  function onDragOver(e: React.DragEvent, id: string | null | 'unassigned') {
    e.preventDefault()
    if (dragOverFolder !== id) {
      setDragOverFolder(id)
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Search & Top Action Bar */}
      <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Live Filter Search Box */}
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#958ea0]" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search summaries, tags, or timestamps..."
            className="w-full h-11 pl-10 pr-9 rounded-2xl bg-[#1c1f29] border border-[#262a34] text-sm text-[#dfe2ef] placeholder-[#958ea0] focus:outline-none focus:border-[#d0bcff] focus:ring-1 focus:ring-[#d0bcff]/40 shadow-sm transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#958ea0] hover:text-[#dfe2ef]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Primary "+ Add Video" Button */}
        <button
          onClick={() => setShowModal(true)}
          className="h-11 px-5 rounded-full bg-[#a078ff] hover:bg-[#d0bcff] text-[#340080] font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#a078ff]/20 active:scale-95 transition"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Add Video</span>
        </button>
      </section>

      {/* Horizontal Folder Filter Tabs */}
      <nav aria-label="Folder classifications" className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {/* All Tab */}
        <button
          type="button"
          onClick={() => setSelectedFolder(null)}
          onDragOver={e => onDragOver(e, null)}
          onDrop={() => handleDrop(null)}
          onDragLeave={() => setDragOverFolder('_none')}
          className={`shrink-0 h-10 px-4 rounded-full font-medium text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all active:scale-95 ${selectedFolder === null
              ? 'bg-[#d0bcff] text-[#3c0091] font-semibold'
              : dragOverFolder === null
                ? 'bg-[#a078ff]/30 border border-[#d0bcff] text-[#d0bcff]'
                : 'bg-[#1c1f29] border border-[#262a34] text-[#cbc3d7] hover:bg-[#262a34]'
            }`}
        >
          <span>All</span>
          <span
            className={`px-1.5 py-0.5 rounded-full font-mono text-[11px] ${selectedFolder === null ? 'bg-[#3c0091]/20 text-[#3c0091]' : 'bg-[#262a34] text-[#958ea0]'
              }`}
          >
            {videos.length}
          </span>
        </button>

        {/* User Folders */}
        {folders.map(f => {
          const count = videos.filter(v => v.folder_id === f.id).length
          const isSelected = selectedFolder === f.id
          const isDragTarget = dragOverFolder === f.id

          return (
            <div
              key={f.id}
              onClick={() => setSelectedFolder(f.id)}
              onDragOver={e => onDragOver(e, f.id)}
              onDrop={() => handleDrop(f.id)}
              onDragLeave={() => setDragOverFolder('_none')}
              className={`group shrink-0 h-10 pl-3.5 pr-2 rounded-full font-medium text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-sm transition-all active:scale-95 ${isSelected
                  ? 'bg-[#d0bcff] text-[#3c0091] font-semibold'
                  : isDragTarget
                    ? 'bg-[#a078ff]/30 border border-[#d0bcff] text-[#d0bcff]'
                    : 'bg-[#1c1f29] border border-[#262a34] text-[#cbc3d7] hover:bg-[#262a34]'
                }`}
            >
              <FolderIcon className={`h-4 w-4 ${isSelected ? 'text-[#3c0091]' : 'text-[#d0bcff]'}`} />
              <span>{f.name}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full font-mono text-[11px] ${isSelected ? 'bg-[#3c0091]/20 text-[#3c0091]' : 'bg-[#262a34] text-[#958ea0]'
                  }`}
              >
                {count}
              </span>
              <button
                type="button"
                onClick={e => handleDeleteFolder(f.id, e)}
                disabled={deletingFolder === f.id}
                aria-label={`Delete ${f.name} folder`}
                className={`ml-0.5 p-1 rounded-full transition ${isSelected
                    ? 'text-[#3c0091]/60 hover:text-[#690005] hover:bg-[#ffdad6]'
                    : 'text-[#958ea0] hover:text-[#ffb4ab] hover:bg-[#262a34]'
                  }`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )
        })}

        {/* Unassigned Tab */}
        <button
          type="button"
          onClick={() => setSelectedFolder('unassigned')}
          onDragOver={e => onDragOver(e, 'unassigned')}
          onDrop={() => handleDrop(null)}
          onDragLeave={() => setDragOverFolder('_none')}
          className={`shrink-0 h-10 px-4 rounded-full font-medium text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all active:scale-95 ${selectedFolder === 'unassigned'
              ? 'bg-[#d0bcff] text-[#3c0091] font-semibold'
              : dragOverFolder === 'unassigned'
                ? 'bg-[#a078ff]/30 border border-[#d0bcff] text-[#d0bcff]'
                : 'bg-[#1c1f29] border border-[#262a34] text-[#cbc3d7] hover:bg-[#262a34]'
            }`}
        >
          <span>Unassigned</span>
          <span
            className={`px-1.5 py-0.5 rounded-full font-mono text-[11px] ${selectedFolder === 'unassigned' ? 'bg-[#3c0091]/20 text-[#3c0091]' : 'bg-[#262a34] text-[#958ea0]'
              }`}
          >
            {videos.filter(v => !v.folder_id).length}
          </span>
        </button>

        {/* New Folder Inline Form / Button */}
        {showNewFolder ? (
          <div className="shrink-0 flex items-center gap-1.5 bg-[#181b25] border border-[#d0bcff]/50 rounded-full px-2 py-1 shadow-sm">
            <input
              autoFocus
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleCreateFolder()
                if (e.key === 'Escape') setShowNewFolder(false)
              }}
              placeholder="Collection name..."
              className="bg-transparent px-2 text-xs sm:text-sm text-[#dfe2ef] outline-none placeholder-[#958ea0] w-28 sm:w-36"
            />
            <button
              onClick={handleCreateFolder}
              disabled={savingFolder}
              className="p-1 rounded-full text-[#45dfa4] hover:bg-[#262a34]"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setShowNewFolder(false)}
              className="p-1 rounded-full text-[#958ea0] hover:bg-[#262a34]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowNewFolder(true)}
            className="shrink-0 h-10 px-4 rounded-full bg-[#181b25] border border-[#262a34] text-[#7bd0ff] hover:bg-[#262a34] font-medium text-xs sm:text-sm flex items-center gap-1.5 transition active:scale-95 shadow-sm"
          >
            <FolderPlus className="h-4 w-4" />
            <span>+ New Folder</span>
          </button>
        )}
      </nav>

      {/* Errors banner */}
      {(fetchError || folderActionError) && (
        <div className="rounded-xl bg-[#93000a]/20 border border-[#93000a]/40 px-4 py-3 text-xs sm:text-sm text-[#ffb4ab] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-[#ffb4ab]" />
            <span>{folderActionError || `Failed to fetch data: ${fetchError}`}</span>
          </div>
          {folderActionError && (
            <button onClick={() => setFolderActionError(null)} className="text-[#ffb4ab] hover:text-white">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Grid Subheader (Curated Library & Sort control) */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-semibold text-[#dfe2ef]">Curated Library</h2>
          <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-[#1c1f29] border border-[#262a34] text-[#d0bcff] font-semibold">
            {filteredVideos.length} {filteredVideos.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            if (sortOrder === 'recent') setSortOrder('oldest')
            else if (sortOrder === 'oldest') setSortOrder('title')
            else setSortOrder('recent')
          }}
          className="h-8 px-3 rounded-lg bg-[#1c1f29] border border-[#262a34] hover:bg-[#262a34] flex items-center gap-1.5 text-xs font-medium text-[#cbc3d7] transition active:scale-95"
        >
          <ArrowUpDown className="h-3.5 w-3.5 text-[#958ea0]" />
          <span className="capitalize">{sortOrder}</span>
        </button>
      </div>

      {/* Video Cards Grid */}
      {filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVideos.map(video => (
            <VideoCard
              key={video.id}
              video={video}
              folderName={video.folder_id ? folderMap.get(video.folder_id) : null}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-20 px-6 rounded-2xl bg-[#1c1f29]/50 border border-dashed border-[#262a34] flex flex-col items-center justify-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#1c1f29] border border-[#262a34] flex items-center justify-center text-[#958ea0]">
            <FolderIcon className="h-7 w-7 text-[#958ea0]" />
          </div>
          <h3 className="text-base font-semibold text-[#dfe2ef]">
            {searchQuery
              ? `No summaries match "${searchQuery}"`
              : selectedFolder !== null
                ? 'No videos in this folder yet'
                : 'No video summaries saved yet'}
          </h3>
          <p className="text-xs sm:text-sm text-[#cbc3d7]/70 max-w-sm">
            {searchQuery
              ? 'Try searching with different keywords or clear your search query.'
              : 'Add YouTube videos to extract structured timestamps, notes, and AI summaries.'}
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-2 h-10 px-5 rounded-full bg-[#a078ff] hover:bg-[#d0bcff] text-[#340080] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#a078ff]/20 active:scale-95 transition"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Add First Video</span>
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <AddVideoModal
          folders={folders}
          selectedFolderId={selectedFolder}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
