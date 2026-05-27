import { createContext, useContext, useReducer, useRef, useEffect, useCallback } from 'react';
import { tracks } from '../data/tracks';
import { parseLRC } from '../utils/lrcParser';

const PlayerContext = createContext(null);

const initialState = {
  tracks,
  currentTrackId: tracks[0].id,
  isPlaying: false,
  progress: 0,
  duration: 0,
  volume: 0.8,
  isMuted: false,
  shuffle: false,
  repeat: 'off', // 'off' | 'all' | 'one'
  activePlaylist: 'all',
  searchQuery: '',
  showLyrics: false,
  currentLyricIndex: 0,
  // 当前曲目的歌词（由 LRC 文件或 inline 数据填充）
  lyrics: tracks[0].lyrics ?? [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'PLAY_TRACK':
      return { ...state, currentTrackId: action.id, isPlaying: true, progress: 0 };
    case 'TOGGLE_PLAY':
      return { ...state, isPlaying: !state.isPlaying };
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.value };
    case 'SET_PROGRESS':
      return { ...state, progress: action.value };
    case 'SET_DURATION':
      return { ...state, duration: action.value };
    case 'SET_VOLUME':
      return { ...state, volume: action.value, isMuted: action.value === 0 };
    case 'TOGGLE_MUTE':
      return { ...state, isMuted: !state.isMuted };
    case 'TOGGLE_SHUFFLE':
      return { ...state, shuffle: !state.shuffle };
    case 'CYCLE_REPEAT':
      return {
        ...state,
        repeat: state.repeat === 'off' ? 'all' : state.repeat === 'all' ? 'one' : 'off',
      };
    case 'SET_PLAYLIST':
      return { ...state, activePlaylist: action.id };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.value };
    case 'TOGGLE_LYRICS':
      return { ...state, showLyrics: !state.showLyrics };
    case 'SET_LYRIC_INDEX':
      return { ...state, currentLyricIndex: action.index };
    case 'SET_LYRICS':
      return { ...state, lyrics: action.lyrics, currentLyricIndex: 0 };
    default:
      return state;
  }
}

export function PlayerProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const audioRef = useRef(null);
  const analyserRef = useRef(null);
  const audioCtxRef = useRef(null);
  const sourceRef = useRef(null);
  const prevVolRef = useRef(0.8);
  const lyricsRef  = useRef([]); // 始终保持最新歌词，避免 useEffect 依赖数组变化

  const currentTrack = state.tracks.find(t => t.id === state.currentTrackId);

  // 同步 lyricsRef
  lyricsRef.current = state.lyrics;

  // Init audio element once
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = state.volume;
    }
  }, []);

  // Track change → load new src + lyrics
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    audio.src = currentTrack.src;
    audio.load();
    if (state.isPlaying) audio.play().catch(() => {});

    // 加载歌词：优先 LRC 文件，否则用 inline lyrics
    if (currentTrack.lrcSrc) {
      fetch(currentTrack.lrcSrc)
        .then(r => r.text())
        .then(text => dispatch({ type: 'SET_LYRICS', lyrics: parseLRC(text) }))
        .catch(() => dispatch({ type: 'SET_LYRICS', lyrics: currentTrack.lyrics ?? [] }));
    } else {
      dispatch({ type: 'SET_LYRICS', lyrics: currentTrack.lyrics ?? [] });
    }
  }, [state.currentTrackId]);

  // Play / pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (state.isPlaying) {
      audio.play().catch(() => dispatch({ type: 'SET_PLAYING', value: false }));
    } else {
      audio.pause();
    }
  }, [state.isPlaying]);

  // Volume / mute
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = state.isMuted ? 0 : state.volume;
  }, [state.volume, state.isMuted]);

  // Wire audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      dispatch({ type: 'SET_PROGRESS', value: audio.currentTime });
      // 通过 ref 读取歌词，避免把 state.lyrics 加进依赖数组
      const lyrics = lyricsRef.current;
      if (lyrics?.length) {
        let idx = 0;
        for (let i = 0; i < lyrics.length; i++) {
          if (audio.currentTime >= lyrics[i].time) idx = i;
        }
        dispatch({ type: 'SET_LYRIC_INDEX', index: idx });
      }
    };
    const onLoadedMeta = () => dispatch({ type: 'SET_DURATION', value: audio.duration });
    const onEnded = () => handleTrackEnd();

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMeta);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMeta);
      audio.removeEventListener('ended', onEnded);
    };
  }, [state.currentTrackId, state.repeat, state.shuffle]);

  const handleTrackEnd = useCallback(() => {
    const audio = audioRef.current;
    if (state.repeat === 'one') {
      audio.currentTime = 0;
      audio.play();
      return;
    }
    const list = getFilteredTracks(state);
    const idx = list.findIndex(t => t.id === state.currentTrackId);
    if (state.shuffle) {
      const next = list[Math.floor(Math.random() * list.length)];
      dispatch({ type: 'PLAY_TRACK', id: next.id });
    } else if (idx < list.length - 1) {
      dispatch({ type: 'PLAY_TRACK', id: list[idx + 1].id });
    } else if (state.repeat === 'all') {
      dispatch({ type: 'PLAY_TRACK', id: list[0].id });
    } else {
      dispatch({ type: 'SET_PLAYING', value: false });
    }
  }, [state]);

  // Build analyser lazily on first play
  const getAnalyser = useCallback(() => {
    if (analyserRef.current) return analyserRef.current;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      const src = ctx.createMediaElementSource(audioRef.current);
      sourceRef.current = src;
      src.connect(analyser);
      analyser.connect(ctx.destination);
    } catch (e) {
      console.warn('AudioContext not available', e);
    }
    return analyserRef.current;
  }, []);

  const seek = useCallback((time) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    dispatch({ type: 'SET_PROGRESS', value: time });
  }, []);

  const playNext = useCallback(() => {
    const list = getFilteredTracks(state);
    const idx = list.findIndex(t => t.id === state.currentTrackId);
    if (state.shuffle) {
      dispatch({ type: 'PLAY_TRACK', id: list[Math.floor(Math.random() * list.length)].id });
    } else {
      const next = list[(idx + 1) % list.length];
      dispatch({ type: 'PLAY_TRACK', id: next.id });
    }
  }, [state]);

  const playPrev = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) { seek(0); return; }
    const list = getFilteredTracks(state);
    const idx = list.findIndex(t => t.id === state.currentTrackId);
    const prev = list[(idx - 1 + list.length) % list.length];
    dispatch({ type: 'PLAY_TRACK', id: prev.id });
  }, [state, seek]);

  const toggleMute = useCallback(() => {
    if (!state.isMuted) prevVolRef.current = state.volume;
    dispatch({ type: 'TOGGLE_MUTE' });
  }, [state.isMuted, state.volume]);

  return (
    <PlayerContext.Provider value={{
      state, dispatch,
      currentTrack,
      audioRef, analyserRef,
      getAnalyser, seek, playNext, playPrev, toggleMute,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

function getFilteredTracks(state) {
  let list = state.tracks;
  if (state.activePlaylist !== 'all') {
    // genre playlists
    if (state.activePlaylist === 'hiphop') list = list.filter(t => t.genre === 'Hip-hop');
    else if (state.activePlaylist === 'rnb')   list = list.filter(t => t.genre === 'R&B');
    // artist playlists
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
  return list.length ? list : state.tracks;
}

export const usePlayer = () => useContext(PlayerContext);
