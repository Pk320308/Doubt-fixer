'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, checkDatabaseHealth } from './supabase'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dbHealthy, setDbHealthy] = useState(true)

  useEffect(() => {
    const checkHealth = async () => {
      const health = await checkDatabaseHealth()
      setDbHealthy(health !== null)
    }
    checkHealth()
    const interval = setInterval(checkHealth, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    }).catch((err) => {
      console.error('Session fetch error:', err)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!error && data) {
        setProfile(data)
      } else if (error) {
        console.error('Profile fetch error:', error)
      }
    } catch (err) {
      console.error('Profile fetch exception:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  async function signUp(email, password, fullName, phone, role) {
    if (!email || !password || !fullName || !phone) {
      return { error: new Error('All fields are required') }
    }
    if (password.length < 6) {
      return { error: new Error('Password must be at least 6 characters') }
    }
    const { error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
          role: role,
        },
      },
    })
    return { error }
  }

  async function signIn(email, password) {
    if (!email || !password) {
      return { error: new Error('Email and password are required') }
    }
    const { error, data } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    })
    if (error) {
      return { error }
    }
    if (data.user) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()
      if (profileError) {
        return { error: profileError }
      }
      const userProfile = profileData
      if (userProfile.role === 'teacher') {
        if (userProfile.teacher_status === 'rejected') {
          await supabase.auth.signOut()
          return { error: null, message: 'Your application was not approved.' }
        }
        if (userProfile.teacher_status === 'suspended') {
          await supabase.auth.signOut()
          return { error: null, message: 'Your account has been temporarily suspended.' }
        }
      }
      return { error: null, role: userProfile.role }
    }
    return { error: null }
  }

  async function adminSignIn(email, password) {
    if (!email || !password) {
      return { error: new Error('Email and password are required') }
    }
    const { error, data } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    })
    if (error) {
      return { error }
    }
    if (data.user) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()
      if (profileError) {
        await supabase.auth.signOut()
        return { error: new Error('Access denied') }
      }
      const userProfile = profileData
      if (userProfile.role !== 'admin') {
        await supabase.auth.signOut()
        return { error: new Error('Access denied. Admin privileges required.') }
      }
    }
    return { error: null }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{
      user, profile, session, loading, dbHealthy,
      signUp, signIn, adminSignIn, signOut
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
