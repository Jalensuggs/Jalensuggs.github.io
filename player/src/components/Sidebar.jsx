import { usePlayer } from '../context/PlayerContext';
import { playlists } from '../data/tracks';

const NAV_ITEMS = [
  {
    id: 'home', label: 'Home', icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
      </svg>
    )
  },
  {
    id: 'search', label: 'Search', icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
      </svg>
    )
  },
  {
    id: 'library', label: 'Your Library', icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
      </svg>
    )
  },
];

export default function Sidebar() {
  const { state, dispatch } = usePlayer();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <svg viewBox="0 0 24 24" fill="var(--green)" width="32" height="32">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
        </svg>
        <span>MyMusic</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <button key={item.id} className="nav-item active">
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-divider" />

      <div className="sidebar-section">
        <p className="sidebar-section-title">PLAYLISTS</p>
        {playlists.map(pl => (
          <button
            key={pl.id}
            className={`playlist-item ${state.activePlaylist === pl.id ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_PLAYLIST', id: pl.id })}
          >
            <span className="playlist-dot" />
            {pl.name}
          </button>
        ))}
      </div>

      <div className="sidebar-footer">
        <a href="../index.html" className="back-link">
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Back to Blog
        </a>
      </div>
    </aside>
  );
}
