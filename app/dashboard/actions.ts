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

  if (!title || !video_url) {
    redirect('/dashboard?error=Title and URL are required')
  }

  const { error } = await supabase
    .from('videos')
    .insert({ title, video_url, user_id: user.id })

  if (error) {
    redirect(`/dashboard?error=${encodeURIComponent(error.message)}`)
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
