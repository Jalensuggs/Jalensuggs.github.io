// 解析 LRC 文件内容 → [{ time: 秒数, text: 歌词 }]
// 过滤掉作词/作曲/编曲/监制/Written by/Prod by 等元数据行

const META_RE = /^(作词|作曲|编曲|制作人|主唱|混音|监制|出品|词|曲|Written\s*by|Produced?\s*by|Prod\.?\s*by|Mix(?:ed)?\s*by|Master(?:ed)?\s*by)\s*[：:.\s]/i;

// 纯曲名/艺术家标题行，例如 "艾志恒 - Butterflies" 或 "吴亦凡 - November Rain"
const TITLE_RE = /^[^[\]]+\s+-\s+[^[\]]+$/;

const TIME_RE = /\[(\d{1,2}):(\d{2})\.(\d{2,3})\](.*)/;

export function parseLRC(rawText) {
  const lines = rawText.split('\n');
  const result = [];

  for (const line of lines) {
    const match = line.match(TIME_RE);
    if (!match) continue;

    const min   = parseInt(match[1], 10);
    const sec   = parseInt(match[2], 10);
    const msRaw = match[3].padEnd(3, '0').slice(0, 3);
    const ms    = parseInt(msRaw, 10);
    const time  = min * 60 + sec + ms / 1000;
    const text  = match[4].trim();

    // 跳过空行
    if (!text) continue;
    // 跳过元数据（作词/作曲/Written by/Prod by ...）
    if (META_RE.test(text)) continue;
    // 跳过纯标题行（"曲名 - 艺术家"）
    if (TITLE_RE.test(text)) continue;

    result.push({ time, text });
  }

  return result;
}
