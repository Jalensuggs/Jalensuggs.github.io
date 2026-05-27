import { useMemo, useState, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { playlists, tracks as allTracks, artists } from '../data/tracks';
import { CoverArt } from './LyricsPanel';

/** 加载所有曲目的时长（preload metadata，不会真正下载 MP3 内容） */
function useDurations() {
  const [durations, setDurations] = useState({});
  useEffect(() => {
    allTracks.forEach(track => {
      const audio = new Audio();
      audio.preload = 'metadata';
      audio.onloadedmetadata = () => {
        setDurations(prev => ({ ...prev, [track.id]: audio.duration }));
      };
      audio.src = track.src; // 赋值 src 触发加载
    });
  }, []);
  return durations;
}

function formatTime(s) {
  if (!s || isNaN(s)) return '—';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function MainContent() {
  const { state, dispatch, currentTrack } = usePlayer();
  const durations = useDurations();

  const filteredTracks = useMemo(() => {
    let list = allTracks;
    if (state.activePlaylist !== 'all') {
      if (state.activePlaylist === 'hiphop') list = list.filter(t => t.genre === 'Hip-hop');
      else if (state.activePlaylist === 'rnb') list = list.filter(t => t.genre === 'R&B');
      else list = list.filter(t => t.artist === state.activePlaylist);
    }
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.genre.toLowerCase().includes(q)
      );
    }
    return list;
  }, [state.activePlaylist, state.searchQuery]);

  const playlistLabel = playlists.find(p => p.id === state.activePlaylist)?.name ?? 'All Tracks';
  const showArtists = state.activePlaylist === 'all' && !state.searchQuery;

  return (
    <main className="main-content">
      {/* ── 顶部搜索栏 ── */}
      <div className="topbar">
        <div className="search-wrap">
          <svg className="search-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search songs, artists..."
            value={state.searchQuery}
            onChange={e => dispatch({ type: 'SET_SEARCH', value: e.target.value })}
          />
          {state.searchQuery && (
            <button className="search-clear" onClick={() => dispatch({ type: 'SET_SEARCH', value: '' })}>✕</button>
          )}
        </div>
      </div>

      {/* ── Featured Banner ── */}
      <div className="featured-banner">
        <div className="featured-info">
          <span className="featured-tag">NOW PLAYING</span>
          <h1 className="featured-title">{currentTrack?.title}</h1>
          <p className="featured-sub">{currentTrack?.artist} · {currentTrack?.genre}</p>
        </div>
        <CoverArt track={currentTrack} size={120} />
      </div>

      {/* ── 流派筛选 chips ── */}
      <div className="genre-chips">
        {playlists.filter(p => p.type === 'genre').map(pl => (
          <button
            key={pl.id}
            className={`genre-chip ${state.activePlaylist === pl.id ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_PLAYLIST', id: pl.id })}
          >
            {pl.name}
          </button>
        ))}
      </div>

      {/* ── 歌手卡片区（仅在 All Tracks 下显示） ── */}
      {showArtists && (
        <div className="artists-section">
          <h2 className="artists-section-title">Artists</h2>
          <div className="artists-grid">
            {artists.map(artist => (
              <button
                key={artist.id}
                className="artist-card"
                onClick={() => dispatch({ type: 'SET_PLAYLIST', id: artist.id })}
              >
                <div className="artist-card-photo">
                  {artist.photo
                    ? <img src={artist.photo} alt={artist.name} />
                    : <span>{artist.name.slice(0, 1)}</span>
                  }
                </div>
                <p className="artist-card-name">{artist.name}</p>
                <p className="artist-card-genre">{artist.genre}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── 曲目列表区块标题 ── */}
      <div className="section-header">
        <h2>{state.searchQuery ? `Results for "${state.searchQuery}"` : playlistLabel}</h2>
        <span className="track-count">{filteredTracks.length} tracks</span>
      </div>

      {/* ── 曲目表格 ── */}
      {filteredTracks.length === 0 ? (
        <div className="empty-state">
          <p>No tracks found</p>
          <button onClick={() => {
            dispatch({ type: 'SET_SEARCH', value: '' });
            dispatch({ type: 'SET_PLAYLIST', id: 'all' });
          }}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className="track-table">
          <div className="track-table-header">
            <span className="col-num">#</span>
            <span className="col-title">Title</span>
            <span className="col-album">Album</span>
            <span className="col-genre">Genre</span>
            <span className="col-dur">
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
              </svg>
            </span>
          </div>

          {filteredTracks.map((track, idx) => {
            const isActive = track.id === currentTrack?.id;
            return (
              <div
                key={track.id}
                className={`track-row ${isActive ? 'active' : ''}`}
                onClick={() => dispatch({ type: 'PLAY_TRACK', id: track.id })}
              >
                {/* # / pause icon / play icon */}
                <span className="col-num">
                  {isActive && state.isPlaying ? (
                    <span className="track-playing-icon"><PauseIcon /></span>
                  ) : (
                    <span className="track-num">{idx + 1}</span>
                  )}
                  <span className="track-play-icon">
                    {isActive && state.isPlaying ? <PauseIcon /> : <PlayIcon />}
                  </span>
                </span>

                {/* 封面 + 歌名 + 歌手 */}
                <span className="col-title">
                  <CoverArt track={track} size={40} />
                  <span className="track-name-wrap">
                    <span className={`track-name ${isActive ? 'green' : ''}`}>{track.title}</span>
                    <span className="track-artist">{track.artist}</span>
                  </span>
                </span>

                <span className="col-album">{track.album}</span>

                <span className="col-genre">
                  <span className={`genre-badge genre-badge--${track.genre === 'Hip-hop' ? 'hiphop' : 'rnb'}`}>
                    {track.genre}
                  </span>
                </span>

                <span className="col-dur">{formatTime(durations[track.id])}</span>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

function PlayIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M8 5v14l11-7z"/></svg>;
}
function PauseIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>;
}
