'use client'

import { useState, useMemo } from 'react'
import { Trash2, FileText, AlignLeft, Loader2, Pencil, Check, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { deleteSummary, addSummary, updateSummary } from '@/app/watch/[videoId]/actions'
import type { Summary } from '@/types'
import type { VideoPlayerHandle } from './VideoPlayer'

function parseTimestamp(t: string): number {
  const parts = t.split(':').map(Number)
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  return 0
}

function renderTextWithTimestamps(content: string, onSeek: (s: number) => void) {
  const parts = content.split(/(\b\d{1,2}:\d{2}(?::\d{2})?\b)/g)
  return parts.map((part, i) =>
    /^\d{1,2}:\d{2}(:\d{2})?$/.test(part) ? (
      <button
        key={i}
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onSeek(parseTimestamp(part))
        }}
        className="inline-flex items-center rounded-md bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 hover:text-white px-1.5 py-0.5 font-mono text-xs font-semibold mx-0.5 cursor-pointer transition select-none"
      >
        {part}
      </button>
    ) : (
      part
    )
  )
}

function SummaryMarkdown({ text, onSeek }: { text: string; onSeek: (s: number) => void }) {
  const components = useMemo(() => ({
    p: ({ children }: { children?: React.ReactNode }) => (
      <p className="mb-3 last:mb-0 text-sm leading-relaxed text-slate-300">
        {Array.isArray(children)
          ? children.map((child, idx) =>
              typeof child === 'string' ? renderTextWithTimestamps(child, onSeek) : <span key={idx}>{child}</span>
            )
          : typeof children === 'string'
            ? renderTextWithTimestamps(children, onSeek)
            : children}
      </p>
    ),
    li: ({ children }: { children?: React.ReactNode }) => (
      <li className="mb-1 text-sm text-slate-300">
        {Array.isArray(children)
          ? children.map((child, idx) =>
              typeof child === 'string' ? renderTextWithTimestamps(child, onSeek) : <span key={idx}>{child}</span>
            )
          : typeof children === 'string'
            ? renderTextWithTimestamps(children, onSeek)
            : children}
      </li>
    ),
    h1: ({ children }: { children?: React.ReactNode }) => (
      <h1 className="text-xl font-bold text-white mt-4 mb-2 first:mt-0">{children}</h1>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="text-lg font-bold text-white mt-3 mb-2 first:mt-0">{children}</h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="text-base font-semibold text-white mt-3 mb-1 first:mt-0">{children}</h3>
    ),
    ul: ({ children }: { children?: React.ReactNode }) => (
      <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>
    ),
    ol: ({ children }: { children?: React.ReactNode }) => (
      <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="border-l-4 border-indigo-500/50 bg-slate-800/40 pl-3 py-1 my-3 text-slate-400 italic rounded-r">
        {children}
      </blockquote>
    ),
    code: ({ children, className }: { children?: React.ReactNode; className?: string }) => {
      const isInline = !className
      return isInline ? (
        <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-indigo-300 border border-slate-700/60">
          {children}
        </code>
      ) : (
        <pre className="overflow-x-auto rounded-xl bg-slate-950 p-3 my-3 font-mono text-xs text-slate-200 border border-slate-800">
          <code>{children}</code>
        </pre>
      )
    },
    table: ({ children }: { children?: React.ReactNode }) => (
      <div className="overflow-x-auto my-3">
        <table className="w-full text-left text-sm border-collapse border border-slate-700/60">
          {children}
        </table>
      </div>
    ),
    th: ({ children }: { children?: React.ReactNode }) => (
      <th className="border border-slate-700 bg-slate-800/70 p-2 font-semibold text-slate-200">
        {children}
      </th>
    ),
    td: ({ children }: { children?: React.ReactNode }) => (
      <td className="border border-slate-700/60 p-2 text-slate-300">
        {children}
      </td>
    ),
    a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-indigo-400 underline hover:text-indigo-300 transition"
      >
        {children}
      </a>
    ),
  }), [onSeek])

  return (
    <div className="prose prose-invert max-w-none text-slate-300 break-words">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {text}
      </ReactMarkdown>
    </div>
  )
}

interface Props {
  summaries: Summary[]
  videoId: string
  playerRef: React.RefObject<VideoPlayerHandle | null>
}

export default function SummaryList({ summaries, videoId, playerRef }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [saving, setSaving] = useState(false)
  // For "add" form when no summaries exist
  const [newText, setNewText] = useState('')
  const [addingSaving, setAddingSaving] = useState(false)

  function handleSeek(s: number) { playerRef.current?.seekTo(s) }

  async function handleDelete(id: string) {
    setDeletingId(id)
    await deleteSummary(id, videoId)
    setDeletingId(null)
  }

  function startEdit(s: Summary) {
    setEditingId(s.id)
    setEditText(s.summary_text)
  }

  async function handleSaveEdit(id: string) {
    if (!editText.trim()) return
    setSaving(true)
    const fd = new FormData()
    fd.append('summary_id', id)
    fd.append('summary_text', editText.trim())
    fd.append('video_id', videoId)
    await updateSummary(fd)
    setEditingId(null)
    setSaving(false)
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newText.trim()) return
    setAddingSaving(true)
    const fd = new FormData()
    fd.append('video_id', videoId)
    fd.append('summary_text', newText.trim())
    await addSummary(fd)
    setNewText('')
    setAddingSaving(false)
  }

  // No summaries → show add form
  if (summaries.length === 0) {
    return (
      <form onSubmit={handleAdd} className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4">
        <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-300">
          <AlignLeft className="h-4 w-4 text-violet-400" /> Add Summary
        </label>
        <textarea value={newText} onChange={e => setNewText(e.target.value)} rows={5}
          placeholder="Paste a summary here. Timestamps like 2:30 become clickable."
          className="w-full resize-none rounded-xl bg-slate-800 border border-slate-700/60 px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
        />
        <button type="submit" disabled={addingSaving || !newText.trim()}
          className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50">
          {addingSaving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : 'Save Summary'}
        </button>
        <div className="mt-6 flex flex-col items-center justify-center py-6 text-center">
          <FileText className="mb-2 h-7 w-7 text-slate-600" />
          <p className="text-xs text-slate-500">No summaries yet — add one above</p>
        </div>
      </form>
    )
  }

  // Has summaries → show each with edit/delete only (no add form)
  return (
    <div className="flex flex-col gap-3">
      {summaries.map(s => (
        <div key={s.id} className="group rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
              {editingId !== s.id && (
                <button onClick={() => startEdit(s)}
                  className="rounded-lg p-1 text-slate-500 transition hover:bg-slate-700 hover:text-indigo-400">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
              <button onClick={() => handleDelete(s.id)} disabled={deletingId === s.id}
                className="rounded-lg p-1 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {editingId === s.id ? (
            <div className="flex flex-col gap-2">
              <textarea value={editText} onChange={e => setEditText(e.target.value)} rows={6}
                className="w-full resize-none rounded-xl bg-slate-800 border border-indigo-500/40 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <div className="flex gap-2">
                <button onClick={() => handleSaveEdit(s.id)} disabled={saving}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50">
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Save
                </button>
                <button onClick={() => setEditingId(null)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-400 transition hover:text-white">
                  <X className="h-3.5 w-3.5" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <SummaryMarkdown text={s.summary_text} onSeek={handleSeek} />
          )}
        </div>
      ))}
    </div>
  )
}
