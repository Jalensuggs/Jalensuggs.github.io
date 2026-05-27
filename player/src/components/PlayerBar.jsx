import { useCallback } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { CoverArt } from './LyricsPanel';
import Visualizer from './Visualizer';

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function PlayerBar() {
  const { state, dispatch, currentTrack, seek, playNext, playPrev, toggleMute, getAnalyser } = usePlayer();

  const handleProgressClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    seek(ratio * state.duration);
  }, [state.duration, seek]);

  const handleVolumeClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    dispatch({ type: 'SET_VOLUME', value: ratio });
  }, [dispatch]);

  const handlePlayClick = useCallback(() => {
    // Resume AudioContext on user gesture
    getAnalyser();
    dispatch({ type: 'TOGGLE_PLAY' });
  }, [dispatch, getAnalyser]);

  const progress = state.duration ? (state.progress / state.duration) * 100 : 0;

  return (
    <div className="player-bar">
      {/* Left: track info */}
      <div className="player-left">
        <CoverArt track={currentTrack} size={56} />
        <div className="player-track-info">
          <span className="player-track-title">{currentTrack?.title ?? '—'}</span>
          <span className="player-track-artist">{currentTrack?.artist ?? '—'}</span>
        </div>
        <button
          className={`icon-btn heart-btn ${state.showLyrics ? 'active' : ''}`}
          onClick={() => dispatch({ type: 'TOGGLE_LYRICS' })}
          title="Lyrics"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zM6 20V4h5v7h7v9H6z"/>
          </svg>
        </button>
      </div>

      {/* Center: controls + progress */}
      <div className="player-center">
        <div className="player-controls">
          {/* Shuffle */}
          <button
            className={`icon-btn ${state.shuffle ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'TOGGLE_SHUFFLE' })}
            title="Shuffle"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
            </svg>
          </button>

          {/* Prev */}
          <button className="icon-btn" onClick={playPrev} title="Previous">
            <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
            </svg>
          </button>

          {/* Play/Pause */}
          <button className="play-btn" onClick={handlePlayClick} title={state.isPlaying ? 'Pause' : 'Play'}>
            {state.isPlaying ? (
              <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>

          {/* Next */}
          <button className="icon-btn" onClick={playNext} title="Next">
            <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
          </button>

          {/* Repeat */}
          <button
            className={`icon-btn ${state.repeat !== 'off' ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'CYCLE_REPEAT' })}
            title={`Repeat: ${state.repeat}`}
          >
            {state.repeat === 'one' ? (
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
              </svg>
            )}
          </button>
        </div>

        {/* Progress bar */}
        <div className="progress-wrap">
          <span className="time-label">{formatTime(state.progress)}</span>
          <div className="progress-track" onClick={handleProgressClick}>
            <div className="progress-fill" style={{ width: `${progress}%` }}>
              <div className="progress-thumb" />
            </div>
          </div>
          <span className="time-label">{formatTime(state.duration)}</span>
        </div>

        {/* Visualizer */}
        <Visualizer />
      </div>

      {/* Right: volume */}
      <div className="player-right">
        <button className="icon-btn" onClick={toggleMute} title="Mute">
          {state.isMuted || state.volume === 0 ? (
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
            </svg>
          ) : state.volume < 0.5 ? (
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
          )}
        </button>
        <div className="volume-track" onClick={handleVolumeClick}>
          <div
            className="volume-fill"
            style={{ width: `${state.isMuted ? 0 : state.volume * 100}%` }}
          >
            <div className="volume-thumb" />
          </div>
        </div>
      </div>
    </div>
  );
}
