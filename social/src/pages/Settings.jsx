import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const { theme, setTheme } = useTheme()
  const { profile } = useAuth()

  return (
    <div className="settings-page">
      <div className="feed-header">
        <h2>Settings</h2>
      </div>

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

      {profile && (
        <section className="settings-section">
          <h3 className="settings-heading">Account</h3>
          <p className="settings-desc">Your anonymous identity on this device.</p>
          <div className="settings-row">
            <span className="settings-row-label">Display name</span>
            <span className="settings-row-value">{profile.display_name}</span>
          </div>
          <div className="settings-row">
            <span className="settings-row-label">Username</span>
            <span className="settings-row-value">@{profile.username}</span>
          </div>
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
