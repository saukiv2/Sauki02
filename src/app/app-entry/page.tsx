// This page is only for the Android app entry point
// It checks if user is logged in and redirects accordingly
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyRefreshToken } from '@/lib/auth'

export default async function AppEntry() {
  const cookieStore = cookies()
  const refreshToken = cookieStore.get('sm_refresh')?.value

  if (refreshToken) {
    const payload = verifyRefreshToken(refreshToken)
    if (payload) {
       redirect('/dashboard')  // already logged in → go to app
    }
  }

  redirect('/login')  // not logged in → go to login
}
