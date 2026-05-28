import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', username: '', display_name: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { username: form.username, display_name: form.display_name }
        }
      })
      if (error) setError(error.message)
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password
      })
      if (error) setError(error.message)
    }

    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">𝕏</div>
        <h1 className="auth-title">
          {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
        </h1>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <>
              <div className="input-wrap">
                <input
                  className="auth-input"
                  type="text"
                  placeholder="Display name"
                  value={form.display_name}
                  onChange={e => set('display_name', e.target.value)}
                  required
                />
              </div>
              <div className="input-wrap">
                <input
                  className="auth-input"
                  type="text"
                  placeholder="Username (no spaces)"
                  value={form.username}
                  onChange={e => set('username', e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  required
                />
              </div>
            </>
          )}
          <div className="input-wrap">
            <input
              className="auth-input"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              required
            />
          </div>
          <div className="input-wrap">
            <input
              className="auth-input"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? 'Loading…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            className="auth-switch-btn"
            onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError('') }}
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
