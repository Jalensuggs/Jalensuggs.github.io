import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        await fetchProfile(session.user.id)
      } else {
        // Retry anonymous sign-in up to 3 times — first attempt may hit cold start
        let authed = null
        for (let i = 0; i < 3 && !authed; i++) {
          const { data } = await supabase.auth.signInAnonymously()
          authed = data?.user ?? null
          if (!authed && i < 2) await new Promise(r => setTimeout(r, 2000))
        }
        if (authed) {
          setUser(authed)
          await fetchProfile(authed.id)
        }
      }
      // Warm up DB connection so first post insert is fast
      supabase.from('posts').select('id').limit(1).then(() => {})
      setLoading(false)
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data)
  }

  async function updateDisplayName(name) {
    if (!user || !name.trim()) return
    const { data } = await supabase
      .from('profiles')
      .update({ display_name: name.trim() })
      .eq('id', user.id)
      .select()
      .single()
    if (data) setProfile(data)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, updateDisplayName, refreshProfile: () => fetchProfile(user?.id) }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
