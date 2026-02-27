// This page is only for the Android app entry point
// It checks if user is logged in and redirects accordingly
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export default async function AppEntry() {
  // Check if refresh token exists
  const cookieStore = cookies()
  const refreshToken = cookieStore.get('sm_refresh')?.value

  // For now, just check if token exists (DB verification happens at API level)
  if (refreshToken) {
    // Token exists, user is logged in
    redirect('/dashboard')
  }

  // No token, not logged in
  redirect('/auth/login')
}
