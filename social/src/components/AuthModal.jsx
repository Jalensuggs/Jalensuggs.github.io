import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export default function AuthModal() {
  const { authModalOpen, closeAuthModal, user, signInWithGoogle, sendEmailOtp, verifyEmailOtp } = useAuth()
  const [step, setStep] = useState('start')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user && authModalOpen) { closeAuthModal(); reset() }
  }, [user, authModalOpen])

  function reset() {
    setStep('start'); setEmail(''); setOtp(''); setBusy(false); setError(null)
  }

  function handleClose() { closeAuthModal(); reset() }

  async function handleSendOtp(e) {
    e.preventDefault()
    if (!email.trim()) return
    setBusy(true); setError(null)
    const { error } = await sendEmailOtp(email.trim())
    setBusy(false)
    if (error) setError(error.message)
    else setStep('otp')
  }

  async function handleVerify(e) {
    e.preventDefault()
    if (otp.length < 6) return
    setBusy(true); setError(null)
    const { error } = await verifyEmailOtp(email, otp)
    setBusy(false)
    if (error) setError('Invalid code — check your inbox and try again.')
  }

  if (!authModalOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={handleClose}>✕</button>

        <div className="auth-logo">𝕏</div>
        <h2 className="auth-title">
          {step === 'otp' ? 'Check your email' : 'Sign in to Myles Social'}
        </h2>

        {step === 'start' && (
          <>
            <button className="google-sign-in-btn" onClick={signInWithGoogle}>
              <GoogleIcon />
              Continue with Google
            </button>

            <div className="auth-or"><span>or</span></div>

            <form onSubmit={handleSendOtp} className="auth-form">
              <input
                className="auth-input"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
              {error && <p className="auth-error">{error}</p>}
              <button className="auth-submit" type="submit" disabled={busy || !email.trim()}>
                {busy ? 'Sending…' : 'Send code'}
              </button>
            </form>
          </>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerify} className="auth-form">
            <p className="auth-hint">
              We sent a 6-digit code to <strong>{email}</strong>.<br />Check your inbox.
            </p>
            <input
              className="auth-input auth-input-otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              autoFocus
            />
            {error && <p className="auth-error">{error}</p>}
            <button className="auth-submit" type="submit" disabled={busy || otp.length < 6}>
              {busy ? 'Verifying…' : 'Sign in'}
            </button>
            <button className="auth-back" type="button" onClick={() => { setStep('start'); setOtp(''); setError(null) }}>
              ← Use a different email
            </button>
          </form>
        )}

        <p className="auth-note">
          New accounts are created automatically on first sign-in.
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}
