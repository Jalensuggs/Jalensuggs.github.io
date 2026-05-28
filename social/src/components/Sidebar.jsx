import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Sidebar() {
  const { profile, user, signOut, openAuthModal } = useAuth()
  const { pathname } = useLocation()

  const nav = [
    { to: '/', icon: <HomeIcon />, label: 'Home' },
    { to: '/explore', icon: <SearchIcon />, label: 'Explore' },
    ...(profile ? [{ to: `/profile/${profile.username}`, icon: <UserIcon />, label: 'Profile' }] : []),
    { to: '/settings', icon: <SettingsIcon />, label: 'Settings' },
  ]

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

      {user && profile ? (
        <div className="sidebar-profile">
          <div className="avatar sm">
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt="" />
              : <span>{profile.display_name?.[0]?.toUpperCase()}</span>
            }
          </div>
          <div className="sidebar-profile-info">
            <span className="display-name">{profile.display_name}</span>
            <span className="handle">@{profile.username}</span>
          </div>
          <button className="signout-btn" onClick={signOut} title="Sign out">
            <SignOutIcon />
          </button>
        </div>
      ) : !user ? (
        <div className="sidebar-login">
          <button className="login-btn" onClick={openAuthModal}>
            Log in / Sign up
          </button>
        </div>
      ) : null}
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

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24">
      <path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.814 5.262l4.276 4.276-1.414 1.414-4.276-4.276c-1.448 1.133-3.278 1.814-5.272 1.814-4.694 0-8.5-3.806-8.5-8.5z"/>
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24">
      <path d="M10.54 1.75h2.92l1.57 2.36c.11.17.32.25.53.21l2.53-.59 2.17 2.17-.58 2.53c-.05.21.04.42.21.53l2.36 1.57v2.92l-2.36 1.57c-.17.11-.26.32-.21.53l.58 2.53-2.17 2.17-2.53-.58c-.21-.05-.42.04-.53.21l-1.57 2.36h-2.92l-1.57-2.36c-.11-.17-.32-.26-.53-.21l-2.53.58-2.17-2.17.59-2.53c.04-.21-.04-.42-.21-.53L1.75 13.46v-2.92l2.36-1.57c.17-.11.25-.32.21-.53l-.59-2.53 2.17-2.17 2.53.59c.21.04.42-.04.53-.21l1.57-2.36zm1.46 6.5a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z"/>
    </svg>
  )
}

function SignOutIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
    </svg>
  )
}
