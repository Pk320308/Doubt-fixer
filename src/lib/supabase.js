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
    const { data, error } = await supabase.from('profiles').select('id').limit(1)
    if (error) {
      console.warn('Database health check warning (maybe tables not created yet):', error.message)
      return false
    }
    return true
  } catch (err) {
    console.error('Database connection error:', err)
    return null
  }
}
