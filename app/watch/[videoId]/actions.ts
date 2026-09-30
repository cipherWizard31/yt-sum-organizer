'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/app/utils/supabase/server'

export async function addTimestamp(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const video_id = formData.get('video_id') as string
  const time_in_seconds = parseFloat(formData.get('time_in_seconds') as string)
  const note_text = (formData.get('note_text') as string)?.trim()

  if (!note_text || isNaN(time_in_seconds)) {
    return // silently skip invalid submissions
  }

  await supabase.from('timestamps').insert({
    video_id,
    user_id: user.id,
    time_in_seconds,
    note_text,
  })

  revalidatePath(`/watch/${video_id}`)
}

export async function deleteTimestamp(timestampId: string, videoId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase.from('timestamps').delete().eq('id', timestampId).eq('user_id', user.id)
  revalidatePath(`/watch/${videoId}`)
}
