// ============================================================
// 歌手信息
// ============================================================
export const artists = [
  { id: 'KW',  name: 'KW',  genre: 'Hip-hop', photo: 'images/singers/Kw.jpeg',  bio: 'Hip-hop producer & rapper' },
  { id: 'AS',  name: 'AS',  genre: 'Hip-hop', photo: 'images/singers/As.jpeg',  bio: 'Hip-hop artist & songwriter' },
  { id: 'Dra', name: 'Dra', genre: 'Hip-hop', photo: 'images/singers/Dra.jpg',  bio: 'Hip-hop artist & lyricist' },
  { id: 'LGZ', name: 'LGZ', genre: 'R&B',     photo: 'images/singers/LGZ.jpeg', bio: 'R&B singer & composer' },
  { id: 'GT',  name: 'GT',  genre: 'R&B',     photo: 'images/singers/Gt.jpeg',  bio: 'R&B vocalist & producer' },
];

// ============================================================
// 辅助：为纯文本歌词自动生成均匀时间轴
// start: 开始秒数, interval: 每行间隔秒数
// ============================================================
function makeLyrics(lines, start = 12, interval = 4) {
  return lines
    .map(l => l.trim())
    .filter(l => l.length > 0)
    .map((text, i) => ({ time: start + i * interval, text }));
}

// ============================================================
// 曲目数据
// lrcSrc: 有则运行时动态加载 LRC 文件
// lyrics:  无 lrcSrc 时使用的内联歌词
// ============================================================
export const tracks = [

  // ── KW · Hip-hop ──────────────────────────────────────────
  {
    id: 1,
    title: 'July',
    artist: 'KW',
    album: 'KW Originals',
    genre: 'Hip-hop',
    src: 'music/KW/July.mp3',
    cover: 'images/singers/Kw.jpeg',
    lrcSrc: 'lyrics/July.lrc',
    lyrics: [],
  },
  {
    id: 2,
    title: 'November Rain',
    artist: 'KW',
    album: 'KW Originals',
    genre: 'Hip-hop',
    src: 'music/KW/NovemberRain.mp3',
    cover: 'images/singers/Kw.jpeg',
    lrcSrc: 'lyrics/NovemberRain.lrc',
    lyrics: [],
  },
  {
    id: 3,
    title: '想你',
    artist: 'KW',
    album: 'KW Originals',
    genre: 'Hip-hop',
    src: 'music/KW/想你.mp3',
    cover: 'images/singers/Kw.jpeg',
    lrcSrc: 'lyrics/想你.lrc',
    lyrics: [],
  },

  // ── AS · Hip-hop ──────────────────────────────────────────
  {
    id: 4,
    title: 'Butterflies',
    artist: 'AS',
    album: 'AS Collection',
    genre: 'Hip-hop',
    src: 'music/AS/Butterflies.mp3',
    cover: 'images/singers/As.jpeg',
    lrcSrc: 'lyrics/Butterflies.lrc',
    lyrics: [],
  },
  {
    id: 5,
    title: 'day1',
    artist: 'AS',
    album: 'AS Collection',
    genre: 'Hip-hop',
    src: 'music/AS/day1.mp3',
    cover: 'images/singers/As.jpeg',
    lrcSrc: 'lyrics/day1.lrc',
    lyrics: [],
  },
  {
    id: 6,
    title: 'dongbu',
    artist: 'AS',
    album: 'AS Collection',
    genre: 'Hip-hop',
    src: 'music/AS/dongbu.mp3',
    cover: 'images/singers/As.jpeg',
    lrcSrc: 'lyrics/dongbu.lrc',
    lyrics: [],
  },

  // ── LGZ · R&B ─────────────────────────────────────────────
  {
    id: 7,
    title: '100 kinds of life',
    artist: 'LGZ',
    album: 'LGZ Sessions',
    genre: 'R&B',
    src: 'music/LGZ/100 kinds of life.mp3',
    cover: 'images/singers/LGZ.jpeg',
    lrcSrc: 'lyrics/100 kinds of life.lrc',
    lyrics: [],
  },
  {
    id: 8,
    title: 'What fraction',
    artist: 'LGZ',
    album: 'LGZ Sessions',
    genre: 'R&B',
    src: 'music/LGZ/What fraction.mp3',
    cover: 'images/singers/LGZ.jpeg',
    lrcSrc: 'lyrics/What fraction.lrc',
    lyrics: [],
  },
  {
    id: 9,
    title: 'earth and sun',
    artist: 'LGZ',
    album: 'LGZ Sessions',
    genre: 'R&B',
    src: 'music/LGZ/earth and sun.mp3',
    cover: 'images/singers/LGZ.jpeg',
    lrcSrc: 'lyrics/earth and sun.lrc',
    lyrics: [],
  },

  // ── Dra · Hip-hop ─────────────────────────────────────────
  {
    id: 13,
    title: '2 Hard 4 The Radio',
    artist: 'Dra',
    album: 'Dra Originals',
    genre: 'Hip-hop',
    src: 'music/Dra/2 Hard 4 The Radio.mp3',
    cover: 'images/singers/Dra.jpg',
    lrcSrc: 'lyrics/2 Hard 4 The Radio.lrc',
    lyrics: [],
  },
  {
    id: 14,
    title: "B's On The Table",
    artist: 'Dra',
    album: 'Dra Originals',
    genre: 'Hip-hop',
    src: "music/Dra/B's On The Table.mp3",
    cover: 'images/singers/Dra.jpg',
    lrcSrc: "lyrics/B's On The Table.lrc",
    lyrics: [],
  },
  {
    id: 15,
    title: 'Make Them Cry',
    artist: 'Dra',
    album: 'Dra Originals',
    genre: 'Hip-hop',
    src: 'music/Dra/Make Them Cry.mp3',
    cover: 'images/singers/Dra.jpg',
    lrcSrc: 'lyrics/Make Them Cry.lrc',
    lyrics: [],
  },

  // ── GT · R&B ──────────────────────────────────────────────
  {
    id: 10,
    title: 'Emergency Contact',
    artist: 'GT',
    album: 'GT Works',
    genre: 'R&B',
    src: 'music/GT/Emergency Contact.mp3',
    cover: 'images/singers/Gt.jpeg',
    lrcSrc: 'lyrics/Emergency Contact.lrc',
    lyrics: [],
  },
  {
    id: 11,
    title: 'color',
    artist: 'GT',
    album: 'GT Works',
    genre: 'R&B',
    src: 'music/GT/color.mp3',
    cover: 'images/singers/Gt.jpeg',
    lrcSrc: 'lyrics/color.lrc',
    lyrics: [],
  },
  {
    id: 12,
    title: '背脊',
    artist: 'GT',
    album: 'GT Works',
    genre: 'R&B',
    src: 'music/GT/背脊.mp3',
    cover: 'images/singers/Gt.jpeg',
    lrcSrc: 'lyrics/背脊.lrc',
    lyrics: [],
  },
];

// ============================================================
// 歌单 / 分类
// ============================================================
export const playlists = [
  { id: 'all',    name: 'All Tracks', type: 'genre',  value: null },
  { id: 'hiphop', name: 'Hip-hop',    type: 'genre',  value: 'Hip-hop' },
  { id: 'rnb',    name: 'R&B',        type: 'genre',  value: 'R&B' },
  { id: 'KW',     name: 'KW',         type: 'artist', value: 'KW' },
  { id: 'AS',     name: 'AS',         type: 'artist', value: 'AS' },
  { id: 'Dra',    name: 'Dra',        type: 'artist', value: 'Dra' },
  { id: 'LGZ',    name: 'LGZ',        type: 'artist', value: 'LGZ' },
  { id: 'GT',     name: 'GT',         type: 'artist', value: 'GT' },
];
