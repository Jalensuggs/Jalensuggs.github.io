// ============================================================
// 歌手信息
// ============================================================
export const artists = [
  {
    id: 'KW',
    name: 'KW',
    genre: 'Hip-hop',
    photo: '/images/singers/Kw.jpeg',
    bio: 'Hip-hop producer & rapper',
  },
  {
    id: 'AS',
    name: 'AS',
    genre: 'Hip-hop',
    photo: '/images/singers/As.jpeg',
    bio: 'Hip-hop artist & songwriter',
  },
  {
    id: 'LGZ',
    name: 'LGZ',
    genre: 'R&B',
    photo: '/images/singers/LGZ.jpeg',
    bio: 'R&B singer & composer',
  },
  {
    id: 'GT',
    name: 'GT',
    genre: 'R&B',
    photo: '/images/singers/Gt.jpeg',
    bio: 'R&B vocalist & producer',
  },
];

// ============================================================
// 曲目数据
// ============================================================
export const tracks = [
  // ── KW · Hip-hop ──────────────────────────────────────────
  {
    id: 1,
    title: 'July',
    artist: 'KW',
    album: 'KW Originals',
    genre: 'Hip-hop',
    src: '/music/KW/July.mp3',
    cover: '/images/singers/Kw.jpeg',
    lyrics: [
      { time: 0,  text: '🌞  July — KW' },
      { time: 5,  text: 'Summer heat on the concrete...' },
      { time: 12, text: 'July never felt so real...' },
      { time: 20, text: 'Every moment, every feel...' },
      { time: 30, text: 'This is July, this is me...' },
    ],
  },
  {
    id: 2,
    title: 'November Rain',
    artist: 'KW',
    album: 'KW Originals',
    genre: 'Hip-hop',
    src: '/music/KW/NovemberRain.mp3',
    cover: '/images/singers/Kw.jpeg',
    lyrics: [
      { time: 0,  text: '🌧  November Rain — KW' },
      { time: 5,  text: 'Cold drops on my window pane...' },
      { time: 13, text: 'November rain keeps falling down...' },
      { time: 22, text: 'Thoughts drift like the grey clouds...' },
      { time: 32, text: 'Still here, still standing tall...' },
    ],
  },
  {
    id: 3,
    title: '想你',
    artist: 'KW',
    album: 'KW Originals',
    genre: 'Hip-hop',
    src: '/music/KW/想你.mp3',
    cover: '/images/singers/Kw.jpeg',
    lyrics: [
      { time: 0,  text: '💭  想你 — KW' },
      { time: 5,  text: '闭上眼睛，脑海里是你的脸...' },
      { time: 13, text: '每一个夜晚都在想你...' },
      { time: 22, text: '时间慢慢流逝，心还在原地...' },
      { time: 32, text: '我只是在默默地想你...' },
    ],
  },

  // ── AS · Hip-hop ──────────────────────────────────────────
  {
    id: 4,
    title: 'Butterflies',
    artist: 'AS',
    album: 'AS Collection',
    genre: 'Hip-hop',
    src: '/music/AS/Butterflies.mp3',
    cover: '/images/singers/As.jpeg',
    lyrics: [
      { time: 0,  text: '🦋  Butterflies — AS' },
      { time: 5,  text: 'Butterflies in my stomach again...' },
      { time: 12, text: 'Every time you walk in the room...' },
      { time: 20, text: 'Wings flutter, heart flutters too...' },
      { time: 30, text: 'Chasing you like summer wind...' },
    ],
  },
  {
    id: 5,
    title: 'day1',
    artist: 'AS',
    album: 'AS Collection',
    genre: 'Hip-hop',
    src: '/music/AS/day1.mp3',
    cover: '/images/singers/As.jpeg',
    lyrics: [
      { time: 0,  text: '🔥  day1 — AS' },
      { time: 5,  text: 'From day one I knew it was real...' },
      { time: 13, text: 'Loyalty runs deeper than the ocean...' },
      { time: 22, text: 'Day one, still holding it down...' },
      { time: 31, text: 'We built this from the ground up...' },
    ],
  },
  {
    id: 6,
    title: 'dongbu',
    artist: 'AS',
    album: 'AS Collection',
    genre: 'Hip-hop',
    src: '/music/AS/dongbu.mp3',
    cover: '/images/singers/As.jpeg',
    lyrics: [
      { time: 0,  text: '🌃  dongbu — AS' },
      { time: 5,  text: 'East side vibes hitting different...' },
      { time: 13, text: 'Streets never sleep out here...' },
      { time: 22, text: 'Moving through the city lights...' },
      { time: 31, text: 'Dongbu, where the story starts...' },
    ],
  },

  // ── LGZ · R&B ─────────────────────────────────────────────
  {
    id: 7,
    title: '100 kinds of life',
    artist: 'LGZ',
    album: 'LGZ Sessions',
    genre: 'R&B',
    src: '/music/LGZ/100 kinds of life.mp3',
    cover: '/images/singers/LGZ.jpeg',
    lyrics: [
      { time: 0,  text: '🌈  100 kinds of life — LGZ' },
      { time: 5,  text: 'A hundred ways to live, a hundred ways to feel...' },
      { time: 13, text: 'Every sunrise brings a new kind of life...' },
      { time: 22, text: 'I choose the path that makes my soul shine...' },
      { time: 32, text: '100 kinds of life, I want them all...' },
    ],
  },
  {
    id: 8,
    title: 'What fraction',
    artist: 'LGZ',
    album: 'LGZ Sessions',
    genre: 'R&B',
    src: '/music/LGZ/What fraction.mp3',
    cover: '/images/singers/LGZ.jpeg',
    lyrics: [
      { time: 0,  text: '🔢  What fraction — LGZ' },
      { time: 5,  text: 'What fraction of my heart is left for you...' },
      { time: 13, text: 'Half of me is missing when you\'re gone...' },
      { time: 22, text: 'Counting every moment, every piece...' },
      { time: 32, text: 'You complete the whole equation...' },
    ],
  },
  {
    id: 9,
    title: 'earth and sun',
    artist: 'LGZ',
    album: 'LGZ Sessions',
    genre: 'R&B',
    src: '/music/LGZ/earth and sun.mp3',
    cover: '/images/singers/LGZ.jpeg',
    lyrics: [
      { time: 0,  text: '☀️  earth and sun — LGZ' },
      { time: 5,  text: 'Like the earth revolves around the sun...' },
      { time: 13, text: 'I orbit around your gravity...' },
      { time: 22, text: 'Warm like sunlight on my face...' },
      { time: 32, text: 'Earth and sun, perfectly aligned...' },
    ],
  },

  // ── GT · R&B ──────────────────────────────────────────────
  {
    id: 10,
    title: 'Emergency Contact',
    artist: 'GT',
    album: 'GT Works',
    genre: 'R&B',
    src: '/music/GT/Emergency Contact.mp3',
    cover: '/images/singers/Gt.jpeg',
    lyrics: [
      { time: 0,  text: '📱  Emergency Contact — GT' },
      { time: 5,  text: 'You\'re the first name I call when it hurts...' },
      { time: 13, text: 'My emergency contact, always there...' },
      { time: 22, text: 'Through every crisis, every fall...' },
      { time: 32, text: 'You answer before the second ring...' },
    ],
  },
  {
    id: 11,
    title: 'color',
    artist: 'GT',
    album: 'GT Works',
    genre: 'R&B',
    src: '/music/GT/color.mp3',
    cover: '/images/singers/Gt.jpeg',
    lyrics: [
      { time: 0,  text: '🎨  color — GT' },
      { time: 5,  text: 'You paint my world with color...' },
      { time: 13, text: 'Every hue, every shade of you...' },
      { time: 22, text: 'Before you, everything was grey...' },
      { time: 32, text: 'Now I see the whole spectrum...' },
    ],
  },
  {
    id: 12,
    title: '背脊',
    artist: 'GT',
    album: 'GT Works',
    genre: 'R&B',
    src: '/music/GT/背脊.mp3',
    cover: '/images/singers/Gt.jpeg',
    lyrics: [
      { time: 0,  text: '🌊  背脊 — GT' },
      { time: 5,  text: '你转身离去的背影...' },
      { time: 13, text: '刻在我记忆最深的地方...' },
      { time: 22, text: '那道背脊，如此熟悉...' },
      { time: 32, text: '却再也无法触碰...' },
    ],
  },
];

// ============================================================
// 歌单 / 分类
// ============================================================
export const playlists = [
  { id: 'all',    name: 'All Tracks',  type: 'genre',  value: null },
  { id: 'hiphop', name: 'Hip-hop',     type: 'genre',  value: 'Hip-hop' },
  { id: 'rnb',    name: 'R&B',         type: 'genre',  value: 'R&B' },
  { id: 'KW',     name: 'KW',          type: 'artist', value: 'KW' },
  { id: 'AS',     name: 'AS',          type: 'artist', value: 'AS' },
  { id: 'LGZ',    name: 'LGZ',         type: 'artist', value: 'LGZ' },
  { id: 'GT',     name: 'GT',          type: 'artist', value: 'GT' },
];
