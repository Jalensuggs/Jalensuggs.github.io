// 解析 LRC 文件内容 → [{ time: 秒数, text: 歌词 }]
// 过滤掉作词/作曲/编曲等元数据行

const META_RE = /^(作词|作曲|编曲|制作人|主唱|混音|词|曲)\s*[：:]/;
const TIME_RE = /\[(\d{1,2}):(\d{2})\.(\d{2,3})\](.*)/;

export function parseLRC(rawText) {
  const lines = rawText.split('\n');
  const result = [];

  for (const line of lines) {
    const match = line.match(TIME_RE);
    if (!match) continue;

    const min  = parseInt(match[1], 10);
    const sec  = parseInt(match[2], 10);
    const msRaw = match[3].padEnd(3, '0').slice(0, 3);
    const ms   = parseInt(msRaw, 10);
    const time = min * 60 + sec + ms / 1000;
    const text = match[4].trim();

    // 跳过元数据行
    if (META_RE.test(text)) continue;

    result.push({ time, text });
  }

  // 过滤掉纯空行（保留有实际文字的行）
  return result.filter(l => l.text.length > 0);
}
