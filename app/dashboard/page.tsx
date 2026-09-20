import { redirect } from 'next/navigation'
import { createClient } from '@/app/utils/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-bold">Logged in as {user.email}</h1>
    </div>
  )
}