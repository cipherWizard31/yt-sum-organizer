'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/app/utils/supabase/server'

export async function addVideo(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const title = (formData.get('title') as string)?.trim()
  const video_url = (formData.get('video_url') as string)?.trim()
  const summary = (formData.get('summary') as string)?.trim() || null

  if (!title || !video_url) redirect('/dashboard?error=Title and URL are required')

  const { data: video, error } = await supabase
    .from('videos')
    .insert({ title, video_url, user_id: user.id })
    .select('id')
    .single()

  if (error || !video) redirect(`/dashboard?error=${encodeURIComponent(error?.message ?? 'Failed to save')}`)

  if (summary) {
    await supabase.from('summaries').insert({ video_id: video.id, user_id: user.id, summary_text: summary })
  }

  revalidatePath('/dashboard')
}

export async function deleteVideo(videoId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase.from('videos').delete().eq('id', videoId).eq('user_id', user.id)
  revalidatePath('/dashboard')
}

export async function createFolder(name: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase.from('folders').insert({ name: name.trim(), user_id: user.id })
  if (error) {
    return { error: error.message }
  }
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteFolder(folderId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Videos in folder will have folder_id set to null (on delete set null)
  const { error } = await supabase.from('folders').delete().eq('id', folderId).eq('user_id', user.id)
  if (error) {
    return { error: error.message }
  }
  revalidatePath('/dashboard')
  return { success: true }
}

export async function assignVideoToFolder(videoId: string, folderId: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase.from('videos').update({ folder_id: folderId }).eq('id', videoId).eq('user_id', user.id)
  if (error) {
    return { error: error.message }
  }
  revalidatePath('/dashboard')
  return { success: true }
}
