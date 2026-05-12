import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('Supabase env vars:', {
    urlExists: !!url,
    keyExists: !!key,
    urlValue: url ? url.substring(0, 20) + '...' : 'MISSING',
    keyValue: key ? key.substring(0, 20) + '...' : 'MISSING'
  })

  if (!url || !key) {
    console.error('Supabase environment variables are missing!')
  }

  return createBrowserClient(url!, key!)
}
