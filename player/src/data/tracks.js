// 音乐曲目数据
export const tracks = [
  {
    id: 1,
    title: "Cloud City",
    artist: "Myles",
    album: "Originals Vol.1",
    genre: "Lo-fi",
    duration: 0, // 运行时动态读取
    src: "/music/CC.mp3",
    cover: null,
    lyrics: [
      { time: 0,   text: "☁️  Cloud City — instrumental" },
      { time: 5,   text: "Drifting through the skyline..." },
      { time: 12,  text: "Neon lights below the clouds..." },
      { time: 20,  text: "Lost in the haze of tomorrow..." },
      { time: 30,  text: "Finding peace above the noise..." },
    ],
  },
  {
    id: 2,
    title: "D",
    artist: "Myles",
    album: "Originals Vol.1",
    genre: "Beats",
    duration: 0,
    src: "/music/D.mp3",
    cover: null,
    lyrics: [
      { time: 0,  text: "🎹  D — instrumental" },
      { time: 6,  text: "Keys echo through empty halls..." },
      { time: 14, text: "A melody remembered..." },
      { time: 22, text: "The note that never fades..." },
      { time: 32, text: "Resonating endlessly..." },
    ],
  },
  {
    id: 3,
    title: "KL",
    artist: "Myles",
    album: "Originals Vol.1",
    genre: "Chill",
    duration: 0,
    src: "/music/KL.mp3",
    cover: null,
    lyrics: [
      { time: 0,  text: "🌙  KL — instrumental" },
      { time: 7,  text: "Midnight city whispers..." },
      { time: 15, text: "Streets glow amber and gold..." },
      { time: 24, text: "The world slows down..." },
      { time: 34, text: "Everything feels alive..." },
    ],
  },
  {
    id: 4,
    title: "KW",
    artist: "Myles",
    album: "Originals Vol.1",
    genre: "Hip-hop",
    duration: 0,
    src: "/music/KW.mp3",
    cover: null,
    lyrics: [
      { time: 0,  text: "🔥  KW — instrumental" },
      { time: 5,  text: "Bass hits heavy, feel the vibe..." },
      { time: 13, text: "808s knock through the night..." },
      { time: 22, text: "Energy rising, no holding back..." },
      { time: 31, text: "This is the sound of now..." },
    ],
  },
];

export const playlists = [
  { id: "all",    name: "All Tracks",  genre: null },
  { id: "lofi",   name: "Lo-fi Vibes", genre: "Lo-fi" },
  { id: "beats",  name: "Hard Beats",  genre: "Beats" },
  { id: "chill",  name: "Chill Out",   genre: "Chill" },
  { id: "hiphop", name: "Hip-hop",     genre: "Hip-hop" },
];
