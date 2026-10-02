'use client'

import { deleteAccount } from './actions'
import { Trash2 } from 'lucide-react'

export default function DeleteAccountButton() {
  return (
    <form
      action={deleteAccount}
      onSubmit={(e) => {
        if (!confirm('Are you absolutely sure? This will permanently delete your account and all saved library notes.')) {
          e.preventDefault()
        }
      }}
    >
      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-full bg-[#ba1a1a] hover:bg-[#ff5449] px-5 py-2 text-xs sm:text-sm font-semibold text-white shadow-md transition active:scale-95"
      >
        <Trash2 className="h-4 w-4" />
        <span>Delete My Account</span>
      </button>
    </form>
  )
}
