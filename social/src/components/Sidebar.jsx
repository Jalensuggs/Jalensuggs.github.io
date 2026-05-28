import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Sidebar() {
  const { profile, updateDisplayName } = useAuth()
  const { pathname } = useLocation()
  const [editing, setEditing] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const inputRef = useRef()

  const nav = [
    { to: '/', icon: <HomeIcon />, label: 'Home' },
    ...(profile ? [{ to: `/profile/${profile.username}`, icon: <UserIcon />, label: 'Profile' }] : []),
  ]

  function startEdit() {
    setNameInput(profile?.display_name || '')
    setEditing(true)
  }

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  async function saveName(e) {
    e.preventDefault()
    await updateDisplayName(nameInput)
    setEditing(false)
  }

  return (
    <nav className="sidebar">
      <Link to="/" className="sidebar-logo">𝕏</Link>

      <div className="sidebar-nav">
        {nav.map(({ to, icon, label }) => (
          <Link
            key={to}
            to={to}
            className={`nav-item${pathname === to || (to !== '/' && pathname.startsWith(to)) ? ' active' : ''}`}
          >
            {icon}
            <span>{label}</span>
          </Link>
        ))}
      </div>

      {profile && (
        <div className="sidebar-profile">
          <div className="avatar sm">
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt="" />
              : <span>{profile.display_name?.[0]?.toUpperCase()}</span>
            }
          </div>

          <div className="sidebar-profile-info">
            {editing ? (
              <form onSubmit={saveName} className="name-edit-form">
                <input
                  ref={inputRef}
                  className="name-edit-input"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onBlur={saveName}
                  maxLength={32}
                />
              </form>
            ) : (
              <>
                <span className="display-name">{profile.display_name}</span>
                <span className="handle">@{profile.username}</span>
              </>
            )}
          </div>

          <button className="edit-name-btn" onClick={startEdit} title="Change display name">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M3 17.46v3.04h3.04L17.19 9.35l-3.04-3.04L3 17.46zm14.37-8.31c.3-.3.3-.77 0-1.07l-1.97-1.97c-.3-.3-.77-.3-1.07 0l-1.54 1.54 3.04 3.04 1.54-1.54z"/>
            </svg>
          </button>
        </div>
      )}
    </nav>
  )
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24">
      <path d="M21.591 7.146L12.52 1.157c-.316-.21-.724-.21-1.04 0l-9.071 5.99c-.26.172-.42.46-.42.773v13.23c0 .51.41.92.92.92H9.08c.51 0 .92-.41.92-.92v-5.765h3.998v5.765c0 .51.41.92.92.92h7.171c.51 0 .92-.41.92-.92V7.919c0-.313-.16-.601-.42-.773z"/>
    </svg>
  )
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24">
      <path d="M5.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C15.318 13.65 13.838 13 12 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C7.627 11.85 9.648 11 12 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H3.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46zM12 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM8 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4z"/>
    </svg>
  )
}
