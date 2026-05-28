import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const { theme, setTheme } = useTheme()
  const { user, profile, signOut, updateDisplayName, updateUsername, uploadAvatar, deleteAccount, openAuthModal } = useAuth()

  const [nameInput, setNameInput] = useState('')
  const [usernameInput, setUsernameInput] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [savingUsername, setSavingUsername] = useState(false)
  const [usernameError, setUsernameError] = useState(null)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const avatarRef = useRef()

  useEffect(() => {
    if (profile) {
      setNameInput(profile.display_name || '')
      setUsernameInput(profile.username || '')
    }
  }, [profile])

  async function handleAvatarChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setAvatarLoading(true)
    await uploadAvatar(file)
    setAvatarLoading(false)
    e.target.value = ''
  }

  async function handleSaveName(e) {
    e.preventDefault()
    if (!nameInput.trim() || nameInput === profile?.display_name) return
    setSavingName(true)
    await updateDisplayName(nameInput)
    setSavingName(false)
  }

  async function handleSaveUsername(e) {
    e.preventDefault()
    const clean = usernameInput.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 30)
    if (!clean || clean === profile?.username) return
    setSavingUsername(true)
    setUsernameError(null)
    const { error } = await updateUsername(clean)
    setSavingUsername(false)
    if (error) setUsernameError('Username already taken or invalid.')
  }

  async function handleDeleteAccount() {
    if (!confirm('Delete your account? All your posts will be permanently removed.')) return
    if (!confirm('This cannot be undone. Are you absolutely sure?')) return
    await deleteAccount()
  }

  return (
    <div className="settings-page">
      <div className="feed-header">
        <h2>Settings</h2>
      </div>

      {/* Appearance */}
      <section className="settings-section">
        <h3 className="settings-heading">Appearance</h3>
        <p className="settings-desc">Choose how your timeline looks.</p>
        <div className="theme-options">
          <button
            className={`theme-option${theme === 'dark' ? ' selected' : ''}`}
            onClick={() => setTheme('dark')}
          >
            <span className="theme-swatch dark-swatch" />
            <span className="theme-label">Dark</span>
            {theme === 'dark' && <CheckIcon />}
          </button>
          <button
            className={`theme-option${theme === 'light' ? ' selected' : ''}`}
            onClick={() => setTheme('light')}
          >
            <span className="theme-swatch light-swatch" />
            <span className="theme-label">Light</span>
            {theme === 'light' && <CheckIcon />}
          </button>
        </div>
      </section>

      {/* Profile — only when logged in */}
      {user && profile && (
        <>
          <section className="settings-section">
            <h3 className="settings-heading">Profile</h3>

            {/* Avatar */}
            <div className="settings-avatar-row">
              <div
                className="avatar xl settings-avatar"
                onClick={() => avatarRef.current?.click()}
                title="Click to change photo"
              >
                {avatarLoading ? (
                  <div className="avatar-uploading"><div className="spinner" /></div>
                ) : profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" />
                ) : (
                  <span>{profile.display_name?.[0]?.toUpperCase()}</span>
                )}
                <div className="avatar-edit-overlay">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff">
                    <path d="M12 15.5a3.5 3.5 0 110-7 3.5 3.5 0 010 7zm7.438-9.938A1.5 1.5 0 0118 5h-1.5l-1.063-2H8.562L7.5 5H6a1.5 1.5 0 00-1.5 1.5v11A1.5 1.5 0 006 19h12a1.5 1.5 0 001.5-1.5v-11a1.5 1.5 0 00-1.062-1.438z"/>
                  </svg>
                </div>
              </div>
              <input
                ref={avatarRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />
              <p className="settings-desc" style={{ marginBottom: 0 }}>
                Click photo to upload a new one.<br />JPG or PNG, max 5 MB.
              </p>
            </div>

            {/* Display name */}
            <form onSubmit={handleSaveName} className="settings-edit-row">
              <label className="settings-row-label">Display name</label>
              <div className="settings-edit-field">
                <input
                  className="settings-input"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  maxLength={32}
                  placeholder="Your name"
                />
                <button
                  className="settings-save-btn"
                  type="submit"
                  disabled={savingName || !nameInput.trim() || nameInput === profile.display_name}
                >
                  {savingName ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>

            {/* Username */}
            <form onSubmit={handleSaveUsername} className="settings-edit-row">
              <label className="settings-row-label">Username</label>
              <div className="settings-edit-field">
                <input
                  className="settings-input"
                  value={usernameInput}
                  onChange={e => setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 30))}
                  placeholder="username"
                />
                <button
                  className="settings-save-btn"
                  type="submit"
                  disabled={savingUsername || !usernameInput.trim() || usernameInput === profile.username}
                >
                  {savingUsername ? 'Saving…' : 'Save'}
                </button>
              </div>
              {usernameError && <p className="settings-error">{usernameError}</p>}
            </form>
          </section>

          {/* Account */}
          <section className="settings-section">
            <h3 className="settings-heading">Account</h3>

            {user.email && (
              <div className="settings-row">
                <span className="settings-row-label">Email</span>
                <span className="settings-row-value">{user.email}</span>
              </div>
            )}

            <div className="settings-actions">
              <button className="settings-action-btn" onClick={signOut}>
                Sign out
              </button>
              <button className="settings-action-btn danger" onClick={handleDeleteAccount}>
                Delete account
              </button>
            </div>
          </section>
        </>
      )}

      {/* Not logged in */}
      {!user && (
        <section className="settings-section">
          <p className="settings-desc">
            <button className="inline-link" onClick={openAuthModal}>Sign in</button>
            {' '}to manage your profile and account settings.
          </p>
        </section>
      )}
    </div>
  )
}

function CheckIcon() {
  return (
    <svg className="theme-check" viewBox="0 0 24 24" width="20" height="20">
      <path d="M9 20l-7-7 1.41-1.41L9 17.17 20.59 5.59 22 7z" fill="var(--blue)" />
    </svg>
  )
}
