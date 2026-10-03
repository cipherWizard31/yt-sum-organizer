import { redirect } from 'next/navigation'
import { createClient } from '@/app/utils/supabase/server'
import SettingsClientView from './SettingsClientView'

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <SettingsClientView
      user={{
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
        created_at: user.created_at,
      }}
    />
  )
}
