import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export async function checkDatabaseHealth() {
  try {
    const { data, error } = await supabase.rpc('health_check')
    if (error) {
      console.error('Database health check failed:', error)
      return null
    }
    return data
  } catch (err) {
    console.error('Database connection error:', err)
    return null
  }
}
