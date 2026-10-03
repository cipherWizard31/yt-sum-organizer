'use client'

import React, { useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  User,
  Palette,
  Check,
  CheckCircle2,
  Sparkles,
  Cloud,
  QrCode,
  Share2,
  Copy,
  Edit3,
  Key,
  Shield,
  ShieldCheck,
  Smartphone,
  Laptop,
  LogOut,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  Maximize2,
  Sliders,
  Type,
  FileText,
  FileCode,
  BookOpen,
} from 'lucide-react'
import { useTheme, ColorMode, AccentKey, FontScale, ACCENT_PALETTES } from '@/components/ThemeProvider'
import { updateProfile, updatePassword, logout } from './actions'
import DeleteAccountButton from './DeleteAccountButton'

interface Props {
  user: {
    id: string
    email?: string
    user_metadata?: {
      full_name?: string
      username?: string
      avatar_url?: string
      default_export?: string
    }
    created_at?: string
  }
}

export default function SettingsClientView({ user }: Props) {
  const {
    prefs,
    resolvedMode,
    setMode,
    setAccent,
    setFontScale,
    updatePreference,
    resetToDefaults,
  } = useTheme()

  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'account'>('profile')

  // Profile Form state
  const [fullName, setFullName] = useState(user.user_metadata?.full_name || 'Alex Rivera')
  const [username, setUsername] = useState(user.user_metadata?.username || 'alexrivera.dev')
  const [avatarUrl, setAvatarUrl] = useState(user.user_metadata?.avatar_url || '')
  const [exportFormat, setExportFormat] = useState(user.user_metadata?.default_export || 'markdown')
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileSaving, startProfileTransition] = useTransition()
  const [profileMessage, setProfileMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // Password Modal / Form
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, startPasswordTransition] = useTransition()
  const [passwordMessage, setPasswordMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // Feedback Toast
  const [toast, setToast] = useState<{ message: string; show: boolean }>({ message: '', show: false })

  const showToast = (message: string) => {
    setToast({ message, show: true })
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }))
    }, 2600)
  }

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startProfileTransition(async () => {
      const fd = new FormData()
      fd.append('fullName', fullName)
      fd.append('username', username)
      fd.append('avatarUrl', avatarUrl)
      fd.append('exportFormat', exportFormat)

      const res = await updateProfile(fd)
      if (res?.error) {
        setProfileMessage({ text: res.error, type: 'error' })
      } else {
        setProfileMessage({ text: 'Profile updated successfully!', type: 'success' })
        setIsEditingProfile(false)
        showToast('Profile information saved')
        setTimeout(() => setProfileMessage(null), 3000)
      }
    })
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startPasswordTransition(async () => {
      const fd = new FormData()
      fd.append('password', password)
      fd.append('confirmPassword', confirmPassword)

      const res = await updatePassword(fd)
      if (res?.error) {
        setPasswordMessage({ text: res.error, type: 'error' })
      } else {
        setPasswordMessage({ text: 'Password changed successfully!', type: 'success' })
        showToast('Password updated securely')
        setTimeout(() => {
          setPasswordMessage(null)
          setShowPasswordModal(false)
          setPassword('')
          setConfirmPassword('')
        }, 1500)
      }
    })
  }

  const copyHandle = () => {
    navigator.clipboard?.writeText(`@${username.replace(/^@/, '')}`)
    showToast('Username copied to clipboard')
  }

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: `${fullName} - YT Summary Organizer`,
        url: window.location.href,
      }).catch(() => {})
    } else {
      navigator.clipboard?.writeText(window.location.href)
      showToast('Profile URL copied to clipboard')
    }
  }

  const formattedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Nov 2023'

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--on-surface)] antialiased flex flex-col selection:bg-[var(--primary-container)] selection:text-[var(--on-primary-container)]">
      {/* Toast Notification */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-[var(--on-surface)] text-[var(--surface)] font-medium text-xs sm:text-sm shadow-2xl flex items-center gap-2 transition-all duration-300 pointer-events-none ${
          toast.show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
        }`}
      >
        <Sparkles className="w-4 h-4 text-[var(--primary-accent)] shrink-0" />
        <span>{toast.message}</span>
      </div>

      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div
          className="absolute -top-32 -right-32 h-96 w-96 rounded-full blur-[140px] opacity-25 transition-colors duration-500"
          style={{ backgroundColor: 'var(--primary-accent-container)' }}
        />
        <div className="absolute top-1/2 -left-48 h-80 w-80 rounded-full bg-[var(--secondary)]/10 blur-[120px]" />
      </div>

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[var(--surface)]/85 backdrop-blur-xl border-b border-[var(--border-color)] shadow-[0_1px_8px_rgba(0,0,0,0.15)]">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 sm:px-8 py-3.5">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 rounded-full border border-[var(--border-color)] bg-[var(--surface-container)] px-3.5 py-1.5 text-xs font-medium text-[var(--on-surface-variant)] transition hover:border-[var(--primary)] hover:text-[var(--on-surface)] active:scale-95"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Dashboard</span>
            </Link>
            <div className="h-4 w-[1px] bg-[var(--border-color)]" />
            <span className="font-semibold text-sm sm:text-base text-[var(--on-surface)]">
              Settings &amp; Preferences
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-8 px-3 rounded-full bg-[var(--surface-container-high)] border border-[var(--border-color)] flex items-center gap-1.5 text-xs text-[var(--tertiary)] font-mono">
              <span className="w-2 h-2 rounded-full bg-[var(--tertiary)] animate-pulse" />
              <span>SYNCED</span>
            </div>
            <div className="h-9 w-9 rounded-xl bg-[var(--surface-container)] border border-[var(--border-color)] flex items-center justify-center overflow-hidden">
              <Image src="/logo.svg" alt="Logo" width={22} height={22} className="object-contain" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 flex flex-col gap-6">
        {/* Navigation Tabs (Profile & Identity, Appearance & Display, Account Security) */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition active:scale-95 ${
                activeTab === 'profile'
                  ? 'bg-[var(--primary-container)] text-[var(--on-primary-container)] shadow-sm'
                  : 'bg-[var(--surface-container)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile &amp; Identity</span>
            </button>

            <button
              onClick={() => setActiveTab('appearance')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition active:scale-95 ${
                activeTab === 'appearance'
                  ? 'bg-[var(--primary-container)] text-[var(--on-primary-container)] shadow-sm'
                  : 'bg-[var(--surface-container)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Appearance &amp; Theme</span>
            </button>

            <button
              onClick={() => setActiveTab('account')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition active:scale-95 ${
                activeTab === 'account'
                  ? 'bg-[var(--primary-container)] text-[var(--on-primary-container)] shadow-sm'
                  : 'bg-[var(--surface-container)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Account &amp; Security</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => {
                showToast('Sync QR generated for mobile pairing')
              }}
              aria-label="QR Code"
              className="w-9 h-9 rounded-full bg-[var(--surface-container)] border border-[var(--border-color)] hover:border-[var(--primary)] flex items-center justify-center text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition active:scale-95"
            >
              <QrCode className="w-4 h-4" />
            </button>
            <button
              onClick={handleShare}
              aria-label="Share"
              className="w-9 h-9 rounded-full bg-[var(--surface-container)] border border-[var(--border-color)] hover:border-[var(--primary)] flex items-center justify-center text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition active:scale-95"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* TAB 1: PROFILE MANAGEMENT */}
        {activeTab === 'profile' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-200">
            {/* Hero Profile Bento Card (Stitch design 94d5cb27ab94475ea333b5bb0063afc7) */}
            <section className="relative overflow-hidden rounded-3xl bg-[var(--surface-container-low)] border border-[var(--border-color)] p-6 sm:p-8 shadow-sm">
              <div
                className="absolute -right-12 -top-12 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20"
                style={{ backgroundColor: 'var(--primary-accent-container)' }}
              />

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10 text-center sm:text-left">
                {/* Avatar with Gradient border */}
                <div className="relative shrink-0">
                  <div
                    className="w-24 h-24 rounded-full p-1 shadow-lg flex items-center justify-center bg-gradient-to-tr from-[var(--primary)] to-[var(--secondary)]"
                  >
                    <div className="w-full h-full rounded-full bg-[var(--surface-container)] flex items-center justify-center overflow-hidden">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-10 h-10 text-[var(--primary)]" />
                      )}
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 flex items-center justify-center w-7 h-7 rounded-full bg-[var(--primary-container)] text-[var(--on-primary-container)] shadow-md">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-[var(--on-surface)]">{fullName}</h1>
                      <p className="text-sm font-semibold text-[var(--primary)] mt-0.5">
                        @{username.replace(/^@/, '')}
                      </p>
                    </div>

                    <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                      <button
                        onClick={() => setIsEditingProfile(!isEditingProfile)}
                        className="h-10 px-4 rounded-full bg-[var(--primary-container)] text-[var(--on-primary-container)] font-semibold text-xs flex items-center gap-2 shadow-sm transition active:scale-95"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isEditingProfile ? 'Close Editor' : 'Edit Profile'}</span>
                      </button>
                      <button
                        onClick={copyHandle}
                        title="Copy handle"
                        className="w-10 h-10 rounded-full bg-[var(--surface-container)] border border-[var(--border-color)] text-[var(--on-surface)] flex items-center justify-center hover:border-[var(--primary)] transition active:scale-95"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--on-surface-variant)] mt-2">
                    {user.email} • Member since {formattedDate}
                  </p>
                </div>
              </div>

              {/* Edit Profile Form Inline Dropdown */}
              {isEditingProfile && (
                <form
                  onSubmit={handleProfileSubmit}
                  className="mt-6 pt-6 border-t border-[var(--border-color)] flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200"
                >
                  <h3 className="text-sm font-semibold text-[var(--on-surface)]">Edit Profile Information</h3>

                  {profileMessage && (
                    <div
                      className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                        profileMessage.type === 'success'
                          ? 'bg-[#45dfa4]/15 text-[#45dfa4]'
                          : 'bg-[#ffb4ab]/15 text-[#ffb4ab]'
                      }`}
                    >
                      {profileMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      <span>{profileMessage.text}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-[var(--on-surface-variant)] font-medium">Display Name</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="w-full h-11 px-4 rounded-xl bg-[var(--surface-container)] border border-[var(--border-color)] text-sm text-[var(--on-surface)] focus:border-[var(--primary)] focus:outline-none transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-[var(--on-surface-variant)] font-medium">Username / Handle</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--on-surface-variant)]">@</span>
                        <input
                          type="text"
                          value={username.replace(/^@/, '')}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                          className="w-full h-11 pl-8 pr-4 rounded-xl bg-[var(--surface-container)] border border-[var(--border-color)] text-sm text-[var(--on-surface)] focus:border-[var(--primary)] focus:outline-none transition"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-[var(--on-surface-variant)] font-medium">Avatar Image URL (Optional)</label>
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full h-11 px-4 rounded-xl bg-[var(--surface-container)] border border-[var(--border-color)] text-sm text-[var(--on-surface)] placeholder:text-[var(--outline)] focus:border-[var(--primary)] focus:outline-none transition"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-4 py-2 rounded-full border border-[var(--border-color)] bg-[var(--surface-container)] text-xs font-semibold text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="px-5 py-2 rounded-full bg-[var(--primary-container)] text-[var(--on-primary-container)] text-xs font-semibold shadow-sm transition active:scale-95 disabled:opacity-50"
                    >
                      {profileSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}
            </section>

            {/* Quota & Plan Metric Card */}
            <section className="rounded-3xl bg-[var(--surface-container-low)] border border-[var(--border-color)] p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[var(--primary-container)] text-[var(--on-primary-container)] flex items-center justify-center shadow-sm">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-base text-[var(--on-surface)]">Pro Creator</h2>
                      <span className="px-2 py-0.5 rounded-full bg-[var(--primary-container)] text-[var(--on-primary-container)] font-mono text-[11px] font-semibold">
                        TIER 2
                      </span>
                    </div>
                    <p className="text-xs text-[var(--on-surface-variant)]">Auto-renews Dec 14, 2026</p>
                  </div>
                </div>

                <span className="text-xs font-semibold text-[var(--primary)] flex items-center gap-0.5">
                  Active Subscription
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>

              {/* Usage Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-[var(--surface-container)] border border-[var(--border-color)]">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-[var(--on-surface)]">Video Summaries</span>
                    <span className="font-mono text-[var(--on-surface-variant)]">18 / 100</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--surface-container-highest)] overflow-hidden">
                    <div className="h-full bg-[var(--primary-accent-container)] rounded-full" style={{ width: '18%' }} />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--surface-container)] border border-[var(--border-color)]">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-[var(--on-surface)]">Cloud Vault Storage</span>
                    <span className="font-mono text-[var(--on-surface-variant)]">1.2 / 10 GB</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--surface-container-highest)] overflow-hidden">
                    <div className="h-full bg-[var(--secondary)] rounded-full" style={{ width: '12%' }} />
                  </div>
                </div>
              </div>
            </section>

            {/* Export Format Preference */}
            <section className="rounded-3xl bg-[var(--surface-container-low)] border border-[var(--border-color)] p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm sm:text-base text-[var(--on-surface)]">
                    Default Export Target
                  </h3>
                  <p className="text-xs text-[var(--on-surface-variant)]">
                    Default format when copying or downloading generated video summaries
                  </p>
                </div>
                <span className="font-mono text-xs text-[var(--primary)] uppercase font-semibold">
                  Instant Parse
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setExportFormat('markdown')
                    showToast('Default export target set to Markdown')
                  }}
                  className={`h-12 rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 transition active:scale-95 ${
                    exportFormat === 'markdown'
                      ? 'bg-[var(--primary-container)] text-[var(--on-primary-container)] shadow-sm'
                      : 'bg-[var(--surface-container)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] border border-[var(--border-color)]'
                  }`}
                >
                  <FileCode className="w-4 h-4" />
                  <span>Markdown</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setExportFormat('obsidian')
                    showToast('Default export target set to Obsidian')
                  }}
                  className={`h-12 rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 transition active:scale-95 ${
                    exportFormat === 'obsidian'
                      ? 'bg-[var(--primary-container)] text-[var(--on-primary-container)] shadow-sm'
                      : 'bg-[var(--surface-container)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] border border-[var(--border-color)]'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Obsidian</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setExportFormat('notion')
                    showToast('Default export target set to Notion')
                  }}
                  className={`h-12 rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 transition active:scale-95 ${
                    exportFormat === 'notion'
                      ? 'bg-[var(--primary-container)] text-[var(--on-primary-container)] shadow-sm'
                      : 'bg-[var(--surface-container)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] border border-[var(--border-color)]'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Notion</span>
                </button>
              </div>
            </section>

            {/* Connected Services Bento (Stitch 94d5cb27ab94475ea333b5bb0063afc7) */}
            <section className="rounded-3xl bg-[var(--surface-container-low)] border border-[var(--border-color)] p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h3 className="font-semibold text-sm sm:text-base text-[var(--on-surface)]">
                    Connected Services &amp; Vaults
                  </h3>
                  <p className="text-xs text-[var(--on-surface-variant)]">Integrated sync destinations</p>
                </div>
                <span className="font-mono text-xs text-[var(--tertiary)] bg-[var(--tertiary)]/10 px-2.5 py-0.5 rounded-full">
                  2 Active
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--surface-container)] border border-[var(--border-color)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--surface-container-highest)] flex items-center justify-center text-[var(--on-surface)]">
                    <Cloud className="w-5 h-5 text-[var(--secondary)]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--on-surface)]">Google Workspace / Drive</p>
                    <p className="text-[11px] text-[var(--on-surface-variant)]">Drive backlink ready</p>
                  </div>
                </div>
                <span className="w-8 h-8 rounded-full bg-[var(--tertiary)]/15 text-[var(--tertiary)] flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--surface-container)] border border-[var(--border-color)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--surface-container-highest)] flex items-center justify-center text-[#ff4b4b]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-[var(--on-surface)]">YouTube Sync Engine</p>
                      <span className="w-2 h-2 rounded-full bg-[var(--tertiary)] animate-pulse" />
                    </div>
                    <p className="text-[11px] text-[var(--on-surface-variant)]">Auto-fetch transcripts</p>
                  </div>
                </div>
                <span className="font-mono text-[11px] text-[var(--tertiary)] bg-[var(--surface-container-high)] px-2.5 py-1 rounded-full">
                  Connected
                </span>
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: APPEARANCE & THEMES (Based on Stitch Screen 2ac0b48cfda246abadb8add5e5b424ba) */}
        {activeTab === 'appearance' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-200">
            {/* Color Mode Section */}
            <section className="bg-[var(--surface-container)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--primary)]/15 flex items-center justify-center text-[var(--primary)]">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-base text-[var(--on-surface)]">Color Mode</h2>
                    <p className="text-xs text-[var(--on-surface-variant)]">Adaptive UI contrast for video learning</p>
                  </div>
                </div>
                <span className="font-mono text-xs text-[var(--primary)] px-2.5 py-1 rounded-full bg-[var(--primary-container)]/20 uppercase font-semibold">
                  {prefs.mode} Active
                </span>
              </div>

              {/* Grid with 4 modes: System, Dark, Light, Pure AMOLED */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {/* System */}
                <button
                  type="button"
                  onClick={() => {
                    setMode('system')
                    showToast('Theme set to System default')
                  }}
                  className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between h-28 relative active:scale-[0.98] ${
                    prefs.mode === 'system'
                      ? 'bg-[var(--surface-container-highest)] border-[var(--primary)] ring-2 ring-[var(--primary)] shadow-sm'
                      : 'bg-[var(--surface-container-high)] border-transparent hover:bg-[var(--surface-container-highest)]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="w-7 h-7 rounded-full bg-[var(--surface-container)] flex items-center justify-center text-[var(--on-surface-variant)]">
                      <Monitor className="w-4 h-4" />
                    </div>
                    {prefs.mode === 'system' && (
                      <CheckCircle2 className="w-4 h-4 text-[var(--primary)]" />
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-[var(--on-surface)] block">System</span>
                    <span className="text-[11px] text-[var(--on-surface-variant)]">Match OS theme</span>
                  </div>
                </button>

                {/* Dark Mode */}
                <button
                  type="button"
                  onClick={() => {
                    setMode('dark')
                    showToast('Dark Slate theme applied')
                  }}
                  className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between h-28 relative active:scale-[0.98] ${
                    prefs.mode === 'dark'
                      ? 'bg-[var(--surface-container-highest)] border-[var(--primary)] ring-2 ring-[var(--primary)] shadow-sm'
                      : 'bg-[var(--surface-container-high)] border-transparent hover:bg-[var(--surface-container-highest)]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="w-7 h-7 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)]">
                      <Moon className="w-4 h-4" />
                    </div>
                    {prefs.mode === 'dark' && (
                      <CheckCircle2 className="w-4 h-4 text-[var(--primary)]" />
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-[var(--on-surface)] block">Dark Mode</span>
                    <span className="text-[11px] text-[var(--on-surface-variant)]">Soft obsidian slate</span>
                  </div>
                </button>

                {/* Light Mode */}
                <button
                  type="button"
                  onClick={() => {
                    setMode('light')
                    showToast('Light theme applied')
                  }}
                  className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between h-28 relative active:scale-[0.98] ${
                    prefs.mode === 'light'
                      ? 'bg-[var(--surface-container-highest)] border-[var(--primary)] ring-2 ring-[var(--primary)] shadow-sm'
                      : 'bg-[var(--surface-container-high)] border-transparent hover:bg-[var(--surface-container-highest)]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="w-7 h-7 rounded-full bg-[var(--surface-container)] flex items-center justify-center text-[var(--on-surface-variant)]">
                      <Sun className="w-4 h-4" />
                    </div>
                    {prefs.mode === 'light' && (
                      <CheckCircle2 className="w-4 h-4 text-[var(--primary)]" />
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-[var(--on-surface)] block">Light Mode</span>
                    <span className="text-[11px] text-[var(--on-surface-variant)]">High ambient daylight</span>
                  </div>
                </button>

                {/* Pure AMOLED */}
                <button
                  type="button"
                  onClick={() => {
                    setMode('amoled')
                    showToast('Pure AMOLED theme applied')
                  }}
                  className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between h-28 relative active:scale-[0.98] ${
                    prefs.mode === 'amoled'
                      ? 'bg-[var(--surface-container-highest)] border-[var(--primary)] ring-2 ring-[var(--primary)] shadow-sm'
                      : 'bg-[var(--surface-container-high)] border-transparent hover:bg-[var(--surface-container-highest)]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="w-7 h-7 rounded-full bg-[var(--surface-container)] flex items-center justify-center text-[var(--on-surface-variant)]">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    {prefs.mode === 'amoled' && (
                      <CheckCircle2 className="w-4 h-4 text-[var(--primary)]" />
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-[var(--on-surface)] block">Pure AMOLED</span>
                    <span className="text-[11px] text-[var(--on-surface-variant)]">Zero-pixel black</span>
                  </div>
                </button>
              </div>
            </section>

            {/* Accent Glow Section (Stitch 6-color palette) */}
            <section className="bg-[var(--surface-container)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--primary)]/15 flex items-center justify-center text-[var(--primary)]">
                    <Palette className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-base text-[var(--on-surface)]">Accent Glow</h2>
                    <p className="text-xs text-[var(--on-surface-variant)]">Key highlights &amp; playback cursor</p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-[var(--primary-container)]/20 text-[var(--primary)] font-mono text-xs flex items-center gap-1.5 font-semibold">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ACCENT_PALETTES[prefs.accent].container }} />
                  <span>{ACCENT_PALETTES[prefs.accent].name}</span>
                </div>
              </div>

              {/* 6 Accent Swatches */}
              <div className="bg-[var(--surface-container-low)] rounded-2xl p-4 border border-[var(--border-color)]">
                <div className="flex items-center justify-between sm:justify-start gap-4 overflow-x-auto py-1 px-1">
                  {(Object.keys(ACCENT_PALETTES) as AccentKey[]).map((key) => {
                    const item = ACCENT_PALETTES[key]
                    const isActive = prefs.accent === key
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setAccent(key)
                          showToast(`Accent color set to ${item.name}`)
                        }}
                        aria-label={item.name}
                        className={`group w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 relative ${
                          isActive ? 'ring-4 ring-offset-2 ring-offset-[var(--surface)] ring-[var(--primary-accent-ring)] scale-105' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: item.container }}
                      >
                        {isActive && <Check className="w-5 h-5 text-white" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            </section>

            {/* Typography Scale Section */}
            <section className="bg-[var(--surface-container)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--primary)]/15 flex items-center justify-center text-[var(--primary)]">
                  <Type className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-semibold text-base text-[var(--on-surface)]">Summary Typography</h2>
                  <p className="text-xs text-[var(--on-surface-variant)]">Timestamp &amp; transcript readability</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[var(--surface-container-low)] border border-[var(--border-color)]">
                {(['compact', 'normal', 'large'] as FontScale[]).map((scale) => {
                  const isActive = prefs.fontScale === scale
                  return (
                    <button
                      key={scale}
                      type="button"
                      onClick={() => {
                        setFontScale(scale)
                        showToast(`Typography set to ${scale}`)
                      }}
                      className={`py-2.5 rounded-xl text-xs font-semibold capitalize transition active:scale-95 text-center ${
                        isActive
                          ? 'bg-[var(--primary-container)] text-[var(--on-primary-container)] shadow-sm'
                          : 'text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'
                      }`}
                    >
                      {scale}
                    </button>
                  )
                })}
              </div>

              {/* Dynamic Live Preview Box */}
              <div className="bg-[var(--surface-container-high)] rounded-2xl p-4 space-y-2 border border-[var(--border-color)]">
                <div className="flex items-center justify-between text-[var(--on-surface-variant)] text-xs">
                  <span className="uppercase tracking-wider font-mono text-[10px]">Live Preview</span>
                  <span className="text-[var(--tertiary)] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Real-time</span>
                  </span>
                </div>

                <div
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--surface-container)] border-l-4 shadow-sm"
                  style={{ borderLeftColor: 'var(--primary-accent-container)' }}
                >
                  <span className="px-2.5 py-1 rounded bg-[var(--primary-accent-container)]/20 text-[var(--primary-accent)] font-mono text-xs font-semibold tracking-wider shrink-0 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-accent-container)] animate-pulse" />
                    04:28
                  </span>
                  <span className="text-sm font-medium text-[var(--on-surface)] truncate">
                    Scaled Dot-Product Attention Layer &amp; Multi-Head Vector Architecture
                  </span>
                </div>
              </div>
            </section>

            {/* Player Interface Toggles */}
            <section className="bg-[var(--surface-container)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--primary)]/15 flex items-center justify-center text-[var(--primary)]">
                  <Maximize2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-semibold text-base text-[var(--on-surface)]">Player Interface Controls</h2>
                  <p className="text-xs text-[var(--on-surface-variant)]">Playback overlays and gesture behavior</p>
                </div>
              </div>

              <div className="divide-y divide-[var(--border-color)]">
                <label className="flex items-center justify-between py-3 cursor-pointer">
                  <div className="pr-4">
                    <span className="font-semibold text-xs sm:text-sm text-[var(--on-surface)] block">
                      Auto-hide controls during playback
                    </span>
                    <span className="text-[11px] text-[var(--on-surface-variant)]">
                      Dim player overlays after 3 seconds of inactivity
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.autoHideControls}
                    onChange={(e) => updatePreference('autoHideControls', e.target.checked)}
                    className="w-5 h-5 rounded text-[var(--primary-accent-container)] focus:ring-[var(--primary-accent)] cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between py-3 cursor-pointer">
                  <div className="pr-4">
                    <span className="font-semibold text-xs sm:text-sm text-[var(--on-surface)] block">
                      High-contrast scrub bar
                    </span>
                    <span className="text-[11px] text-[var(--on-surface-variant)]">
                      Thick glowing seekline with chapter pips
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.highContrastScrub}
                    onChange={(e) => updatePreference('highContrastScrub', e.target.checked)}
                    className="w-5 h-5 rounded text-[var(--primary-accent-container)] focus:ring-[var(--primary-accent)] cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between py-3 cursor-pointer">
                  <div className="pr-4">
                    <span className="font-semibold text-xs sm:text-sm text-[var(--on-surface)] block">
                      Reduce timeline motion
                    </span>
                    <span className="text-[11px] text-[var(--on-surface-variant)]">
                      Disable smooth animation during timestamp auto-tracking
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.reduceTimelineMotion}
                    onChange={(e) => updatePreference('reduceTimelineMotion', e.target.checked)}
                    className="w-5 h-5 rounded text-[var(--primary-accent-container)] focus:ring-[var(--primary-accent)] cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between py-3 cursor-pointer">
                  <div className="pr-4">
                    <span className="font-semibold text-xs sm:text-sm text-[var(--on-surface)] block">
                      Compact library card view
                    </span>
                    <span className="text-[11px] text-[var(--on-surface-variant)]">
                      Show dense multi-column layout on dashboard
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.compactLibraryView}
                    onChange={(e) => updatePreference('compactLibraryView', e.target.checked)}
                    className="w-5 h-5 rounded text-[var(--primary-accent-container)] focus:ring-[var(--primary-accent)] cursor-pointer"
                  />
                </label>
              </div>
            </section>

            {/* Reset Footer */}
            <div className="p-4 rounded-2xl bg-[var(--surface-container-low)] border border-[var(--border-color)] flex items-center justify-between gap-3">
              <span className="text-xs text-[var(--on-surface-variant)]">
                Preferences automatically persist across sessions in local storage.
              </span>
              <button
                type="button"
                onClick={() => {
                  resetToDefaults()
                  showToast('Appearance settings reset to default')
                }}
                className="px-4 py-1.5 rounded-full bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] text-[var(--on-surface)] text-xs font-semibold border border-[var(--border-color)] active:scale-95 transition"
              >
                Reset Defaults
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: ACCOUNT & SECURITY */}
        {activeTab === 'account' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-200">
            {/* Active Sessions Bento (Stitch Screen 0b070e3de6bd47a79d547f077046cb71) */}
            <section className="rounded-3xl bg-[var(--surface-container)] border border-[var(--border-color)] p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--primary)]/15 flex items-center justify-center text-[var(--primary)]">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-semibold text-base text-[var(--on-surface)]">Active Sessions &amp; Devices</h2>
                  <p className="text-xs text-[var(--on-surface-variant)]">Currently authenticated clients</p>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                {/* Current Device */}
                <div className="bg-[var(--surface-container-high)] p-3.5 rounded-2xl flex items-center justify-between border border-[var(--border-color)]">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[var(--surface-container)] flex items-center justify-center text-[var(--on-surface)] shrink-0">
                      <Laptop className="w-5 h-5 text-[var(--primary)]" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-[var(--on-surface)] truncate">
                          Web Browser (Current Session)
                        </span>
                        <span className="w-2 h-2 rounded-full bg-[var(--tertiary)] animate-pulse" />
                      </div>
                      <span className="text-[11px] font-mono text-[var(--on-surface-variant)] truncate">
                        Active on this device • Synced
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-semibold text-[var(--tertiary)] bg-[var(--tertiary)]/10 px-2.5 py-0.5 rounded-full shrink-0">
                    Current
                  </span>
                </div>
              </div>
            </section>

            {/* Security & Password */}
            <section className="rounded-3xl bg-[var(--surface-container)] border border-[var(--border-color)] p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--primary)]/15 flex items-center justify-center text-[var(--primary)]">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-semibold text-base text-[var(--on-surface)]">Security &amp; Credentials</h2>
                  <p className="text-xs text-[var(--on-surface-variant)]">Manage authentication keys and passwords</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--surface-container-high)] border border-[var(--border-color)]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--surface-container)] flex items-center justify-center text-[var(--on-surface)]">
                    <Key className="w-4 h-4 text-[var(--secondary)]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--on-surface)]">Account Password</p>
                    <p className="text-[11px] text-[var(--on-surface-variant)]">Update your Supabase authentication password</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPasswordModal(true)}
                  className="px-4 py-2 rounded-full bg-[var(--surface-container)] hover:bg-[var(--surface-container-highest)] border border-[var(--border-color)] text-xs font-semibold text-[var(--on-surface)] transition active:scale-95"
                >
                  Change Password
                </button>
              </div>
            </section>

            {/* Active Session & Log Out */}
            <section className="rounded-3xl bg-[var(--surface-container)] border border-[var(--border-color)] p-6 shadow-sm flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--secondary)]/15 flex items-center justify-center text-[var(--secondary)]">
                  <LogOut className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-semibold text-base text-[var(--on-surface)]">Sign Out</h2>
                  <p className="text-xs text-[var(--on-surface-variant)]">
                    End active session on this device
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <form action={logout}>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--surface-container-high)] px-5 py-2.5 text-xs sm:text-sm font-semibold text-[var(--on-surface)] transition hover:border-[var(--secondary)] hover:text-[var(--secondary)] active:scale-95"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log Out of YT Summaries</span>
                  </button>
                </form>
              </div>
            </section>

            {/* Danger Zone */}
            <section className="rounded-3xl border border-[#93000a]/40 bg-[#93000a]/10 p-6 shadow-sm flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#ffb4ab]">
                <AlertTriangle className="h-4 w-4" />
                <span>Danger Zone</span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--on-surface-variant)] leading-relaxed">
                Permanently purge your account along with all video libraries, transcript notes, and summaries from cloud storage. This action is irreversible.
              </p>
              <div className="pt-2">
                <DeleteAccountButton />
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--surface-container-low)] border border-[var(--border-color)] rounded-3xl p-6 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base text-[var(--on-surface)]">Change Password</h3>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="w-8 h-8 rounded-full bg-[var(--surface-container)] flex items-center justify-center text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
              >
                ✕
              </button>
            </div>

            {passwordMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  passwordMessage.type === 'success'
                    ? 'bg-[#45dfa4]/15 text-[#45dfa4]'
                    : 'bg-[#ffb4ab]/15 text-[#ffb4ab]'
                }`}
              >
                {passwordMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span>{passwordMessage.text}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3">
              <div className="space-y-1">
                <label className="text-xs text-[var(--on-surface-variant)]">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  className="w-full h-11 px-4 rounded-xl bg-[var(--surface-container)] border border-[var(--border-color)] text-sm text-[var(--on-surface)] focus:border-[var(--primary)] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[var(--on-surface-variant)]">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  className="w-full h-11 px-4 rounded-xl bg-[var(--surface-container)] border border-[var(--border-color)] text-sm text-[var(--on-surface)] focus:border-[var(--primary)] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 rounded-full border border-[var(--border-color)] bg-[var(--surface-container)] text-xs font-semibold text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="px-5 py-2 rounded-full bg-[var(--primary-container)] text-[var(--on-primary-container)] text-xs font-semibold shadow-sm transition active:scale-95 disabled:opacity-50"
                >
                  {passwordSaving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
