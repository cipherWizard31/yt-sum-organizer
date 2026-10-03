'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/app/utils/supabase/server'

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function deleteAccount() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Calls the delete_user() SQL function (security definer)
  await supabase.rpc('delete_user')
  await supabase.auth.signOut()
  redirect('/login?message=Your account has been deleted.')
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const fullName = (formData.get('fullName') as string)?.trim() || ''
  const username = (formData.get('username') as string)?.trim() || ''
  const avatarUrl = (formData.get('avatarUrl') as string)?.trim() || ''
  const exportFormat = (formData.get('exportFormat') as string)?.trim() || 'markdown'

  const { error } = await supabase.auth.updateUser({
    data: {
      full_name: fullName,
      username: username,
      avatar_url: avatarUrl,
      default_export: exportFormat,
    },
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/settings')
  return { success: true }
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || password.length < 6) {
    return { error: 'Password must be at least 6 characters long' }
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' }
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
