import { useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';

export default function LyricsPanel() {
  const { state, currentTrack, dispatch } = usePlayer();
  const activeRef = useRef(null);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [state.currentLyricIndex]);

  if (!state.showLyrics) return null;

  const lyrics = currentTrack?.lyrics || [];

  return (
    <div className="lyrics-panel">
      <div className="lyrics-header">
        <h3>Lyrics</h3>
        <button
          className="icon-btn"
          onClick={() => dispatch({ type: 'TOGGLE_LYRICS' })}
          title="Close lyrics"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      <div className="lyrics-track-info">
        <div className="lyrics-cover">
          <CoverArt track={currentTrack} size={80} />
        </div>
        <div>
          <p className="lyrics-song-title">{currentTrack?.title}</p>
          <p className="lyrics-artist">{currentTrack?.artist}</p>
        </div>
      </div>

      <div className="lyrics-lines">
        {lyrics.length === 0 ? (
          <p className="lyrics-empty">No lyrics available</p>
        ) : (
          lyrics.map((line, i) => (
            <p
              key={i}
              ref={i === state.currentLyricIndex ? activeRef : null}
              className={`lyrics-line ${i === state.currentLyricIndex ? 'active' : ''} ${i < state.currentLyricIndex ? 'past' : ''}`}
            >
              {line.text}
            </p>
          ))
        )}
      </div>
    </div>
  );
}

function CoverArt({ track, size = 56 }) {
  const colors = ['#1db954', '#e91e63', '#ff9800', '#2196f3', '#9c27b0'];
  const color = colors[(track?.id ?? 0) % colors.length];
  const initials = track?.title?.slice(0, 2).toUpperCase() ?? '??';

  return (
    <div
      className="cover-art"
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${color}44, ${color}22)`, border: `1px solid ${color}55` }}
    >
      <span style={{ color, fontSize: size * 0.3, fontWeight: 800 }}>{initials}</span>
    </div>
  );
}

export { CoverArt };
