import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  const fetchProfile = useCallback(async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data ?? null)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  async function signInWithGoogle() {
    const redirectTo = `${window.location.origin}${window.location.pathname}`
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })
  }

  async function sendEmailOtp(email) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })
    return { error }
  }

  async function verifyEmailOtp(email, token) {
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
    return { error }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function updateDisplayName(name) {
    if (!user || !name.trim()) return
    const { data } = await supabase
      .from('profiles').update({ display_name: name.trim() })
      .eq('id', user.id).select().single()
    if (data) setProfile(data)
  }

  async function updateUsername(username) {
    if (!user || !username.trim()) return { error: null }
    const clean = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 30)
    const { data, error } = await supabase
      .from('profiles').update({ username: clean })
      .eq('id', user.id).select().single()
    if (data) setProfile(data)
    return { error }
  }

  async function uploadAvatar(file) {
    if (!user || !file) return { error: 'No file' }
    const ext = file.name.split('.').pop().toLowerCase()
    const path = `${user.id}/avatar.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('media').upload(path, file, { upsert: true })
    if (uploadError) return { error: uploadError }
    const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path)
    const avatarUrl = `${publicUrl}?t=${Date.now()}`
    const { data, error } = await supabase
      .from('profiles').update({ avatar_url: avatarUrl })
      .eq('id', user.id).select().single()
    if (data) setProfile(data)
    return { error }
  }

  async function deleteAccount() {
    if (!user) return
    await supabase.from('likes').delete().eq('user_id', user.id)
    await supabase.from('comments').delete().eq('user_id', user.id)
    await supabase.from('posts').delete().eq('user_id', user.id)
    await supabase.from('follows').delete().eq('follower_id', user.id)
    await supabase.from('follows').delete().eq('following_id', user.id)
    await supabase.from('profiles')
      .update({ display_name: 'Deleted User', avatar_url: null })
      .eq('id', user.id)
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      authModalOpen,
      openAuthModal: () => setAuthModalOpen(true),
      closeAuthModal: () => setAuthModalOpen(false),
      signInWithGoogle, sendEmailOtp, verifyEmailOtp,
      signOut, updateDisplayName, updateUsername, uploadAvatar, deleteAccount,
      refreshProfile: () => fetchProfile(user?.id),
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
