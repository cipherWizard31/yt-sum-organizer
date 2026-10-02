'use client'

import { useState, useMemo } from 'react'
import { Trash2, FileText, AlignLeft, Loader2, Pencil, Check, X, Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { deleteSummary, addSummary, updateSummary } from '@/app/watch/[videoId]/actions'
import type { Summary } from '@/types'

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
        className="inline-flex items-center rounded-md bg-[#d0bcff]/20 hover:bg-[#d0bcff]/30 text-[#d0bcff] px-2 py-0.5 font-mono text-xs font-semibold mx-1 cursor-pointer transition select-none active:scale-95"
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
      <p className="mb-3 last:mb-0 text-sm leading-relaxed text-[#dfe2ef]">
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
      <li className="mb-1 text-sm text-[#dfe2ef]">
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
      <ul className="list-disc pl-5 mb-3 space-y-1 text-[#dfe2ef]">{children}</ul>
    ),
    ol: ({ children }: { children?: React.ReactNode }) => (
      <ol className="list-decimal pl-5 mb-3 space-y-1 text-[#dfe2ef]">{children}</ol>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="border-l-4 border-[#a078ff] bg-[#1c1f29] pl-3 py-1.5 my-3 text-[#cbc3d7] italic rounded-r">
        {children}
      </blockquote>
    ),
    code: ({ children, className }: { children?: React.ReactNode; className?: string }) => {
      const isInline = !className
      return isInline ? (
        <code className="rounded bg-[#1c1f29] px-1.5 py-0.5 font-mono text-xs text-[#d0bcff] border border-[#262a34]">
          {children}
        </code>
      ) : (
        <pre className="overflow-x-auto rounded-xl bg-[#0a0e17] p-3 my-3 font-mono text-xs text-[#dfe2ef] border border-[#262a34]">
          <code>{children}</code>
        </pre>
      )
    },
    table: ({ children }: { children?: React.ReactNode }) => (
      <div className="overflow-x-auto my-3">
        <table className="w-full text-left text-sm border-collapse border border-[#262a34]">
          {children}
        </table>
      </div>
    ),
    th: ({ children }: { children?: React.ReactNode }) => (
      <th className="border border-[#262a34] bg-[#1c1f29] p-2 font-semibold text-[#dfe2ef]">
        {children}
      </th>
    ),
    td: ({ children }: { children?: React.ReactNode }) => (
      <td className="border border-[#262a34] p-2 text-[#cbc3d7]">
        {children}
      </td>
    ),
    a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#7bd0ff] underline hover:text-[#c4e7ff] transition"
      >
        {children}
      </a>
    ),
  }), [onSeek])

  return (
    <div className="prose prose-invert max-w-none text-[#dfe2ef] break-words">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {text}
      </ReactMarkdown>
    </div>
  )
}

interface Props {
  summaries: Summary[]
  videoId: string
  onSeek: (seconds: number) => void
}

export default function SummaryList({ summaries, videoId, onSeek }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [saving, setSaving] = useState(false)
  const [newText, setNewText] = useState('')
  const [addingSaving, setAddingSaving] = useState(false)

  async function handleDelete(id: string) {
    if (!confirm('Delete this summary?')) return
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

  if (summaries.length === 0) {
    return (
      <form onSubmit={handleAdd} className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#cbc3d7]">
          <Sparkles className="h-4 w-4 text-[#45dfa4]" />
          <span>Add Study Summary</span>
        </div>
        <textarea
          value={newText}
          onChange={e => setNewText(e.target.value)}
          rows={5}
          placeholder="Paste or write key summary notes here. Include timestamps like 02:30 or 15:10 to make them directly seekable."
          className="w-full resize-none rounded-xl bg-[#1c1f29] border border-[#262a34] p-3 text-sm text-[#dfe2ef] placeholder-[#958ea0] outline-none transition focus:border-[#d0bcff] focus:ring-1 focus:ring-[#d0bcff]/40"
        />
        <button
          type="submit"
          disabled={addingSaving || !newText.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#a078ff] hover:bg-[#d0bcff] py-2.5 text-xs font-semibold text-[#340080] shadow-md shadow-[#a078ff]/20 transition active:scale-95 disabled:opacity-50"
        >
          {addingSaving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : 'Save Summary'}
        </button>
      </form>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {summaries.map(s => (
        <div key={s.id} className="group rounded-xl border border-[#262a34] bg-[#1c1f29] p-4 shadow-sm">
          <div className="mb-2.5 flex items-center justify-between border-b border-[#262a34]/60 pb-2">
            <span className="text-xs font-mono text-[#958ea0]">
              {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
              {editingId !== s.id && (
                <button
                  onClick={() => startEdit(s)}
                  aria-label="Edit summary"
                  className="rounded-lg p-1.5 text-[#958ea0] transition hover:bg-[#262a34] hover:text-[#d0bcff]"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={() => handleDelete(s.id)}
                disabled={deletingId === s.id}
                aria-label="Delete summary"
                className="rounded-lg p-1.5 text-[#958ea0] transition hover:bg-[#93000a]/20 hover:text-[#ffb4ab] disabled:opacity-40"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {editingId === s.id ? (
            <div className="flex flex-col gap-2.5">
              <textarea
                value={editText}
                onChange={e => setEditText(e.target.value)}
                rows={6}
                className="w-full resize-none rounded-xl bg-[#0f131c] border border-[#d0bcff]/50 p-3 text-sm text-[#dfe2ef] outline-none focus:ring-1 focus:ring-[#d0bcff]"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleSaveEdit(s.id)}
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded-full bg-[#a078ff] px-4 py-1.5 text-xs font-semibold text-[#340080] shadow transition active:scale-95 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  <span>Save</span>
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="flex items-center gap-1.5 rounded-full border border-[#262a34] bg-[#1c1f29] px-4 py-1.5 text-xs text-[#cbc3d7] transition hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          ) : (
            <SummaryMarkdown text={s.summary_text} onSeek={onSeek} />
          )}
        </div>
      ))}
    </div>
  )
}
