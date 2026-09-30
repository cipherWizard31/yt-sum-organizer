'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import AddVideoModal from './AddVideoModal'

export default function DashboardClient({ showButtonOnly = false }: { showButtonOnly?: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-500 hover:to-violet-500"
      >
        <Plus className="h-4 w-4" />
        {showButtonOnly ? 'Add Your First Video' : 'Add Video'}
      </button>
      {open && <AddVideoModal onClose={() => setOpen(false)} />}
    </>
  )
}
