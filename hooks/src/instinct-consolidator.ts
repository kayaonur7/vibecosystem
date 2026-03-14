/**
 * Instinct Consolidator - Stop hook
 *
 * Session sonunda:
 * 1. instincts.jsonl'den ham instinct'leri oku
 * 2. Pattern bazinda grupla
 * 3. Tekrarlayan pattern'larin confidence'ini arttir
 * 4. Olgun instinct'leri (confidence >= 5) mature-instincts.json'a yaz
 * 5. Cok olgun olanlari (confidence >= 10) otomatik rule dosyasina donustur
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { notify } from './shared/notify.js';

interface RawInstinct {
  ts: string;
  session: string;
  type: 'file_pattern' | 'edit_pattern' | 'error_fix';
  pattern: string;
  detail: string;
  confidence: number;
}

interface MatureInstinct {
  pattern: string;
  type: string;
  count: number;
  confidence: number;
  first_seen: string;
  last_seen: string;
  examples: string[];
  promoted: boolean;
}

const MATURE_THRESHOLD = 5;    // Bu sayiya ulasinca context'e enjekte et
const PROMOTE_THRESHOLD = 10;  // Bu sayiya ulasinca rule dosyasina donustur
const MAX_EXAMPLES = 3;

function main() {
  // stdin'i oku ama kullanmayiz (Stop hook formati icin)
  try { readFileSync(0, 'utf-8'); } catch { /* ok */ }

  const claudeDir = join(homedir(), '.claude');
  const instinctsPath = join(claudeDir, 'instincts.jsonl');
  const maturePath = join(claudeDir, 'mature-instincts.json');

  // instincts.jsonl yoksa cikis
  if (!existsSync(instinctsPath)) {
    console.log('{}');
    return;
  }

  // Ham instinct'leri oku
  const lines = readFileSync(instinctsPath, 'utf-8').split('\n').filter(l => l.trim());
  if (lines.length === 0) {
    console.log('{}');
    return;
  }

  const rawInstincts: RawInstinct[] = [];
  for (const line of lines) {
    try {
      rawInstincts.push(JSON.parse(line));
    } catch { /* skip malformed */ }
  }

  // Mevcut mature instinct'leri oku
  let matureMap = new Map<string, MatureInstinct>();
  if (existsSync(maturePath)) {
    try {
      const existing: MatureInstinct[] = JSON.parse(readFileSync(maturePath, 'utf-8'));
      for (const m of existing) {
        matureMap.set(m.pattern, m);
      }
    } catch { /* fresh start */ }
  }

  // Ham instinct'leri grupla ve say
  for (const inst of rawInstincts) {
    const key = inst.pattern;
    const existing = matureMap.get(key);

    if (existing) {
      existing.count++;
      existing.last_seen = inst.ts;
      existing.confidence = existing.count;
      if (existing.examples.length < MAX_EXAMPLES && !existing.examples.includes(inst.detail)) {
        existing.examples.push(inst.detail);
      }
    } else {
      matureMap.set(key, {
        pattern: inst.pattern,
        type: inst.type,
        count: 1,
        confidence: 1,
        first_seen: inst.ts,
        last_seen: inst.ts,
        examples: [inst.detail],
        promoted: false,
      });
    }
  }

  // Mature instinct'leri yaz
  const matureList = [...matureMap.values()].sort((a, b) => b.confidence - a.confidence);
  writeFileSync(maturePath, JSON.stringify(matureList, null, 2));

  // Cok olgun olanlari rule'a donustur
  const newlyPromoted: MatureInstinct[] = [];
  for (const m of matureList) {
    if (m.confidence >= PROMOTE_THRESHOLD && !m.promoted) {
      promoteToRule(m, claudeDir);
      m.promoted = true;
      newlyPromoted.push(m);
    }
  }

  // Promoted flag'leri kaydet
  if (newlyPromoted.length > 0) {
    writeFileSync(maturePath, JSON.stringify(matureList, null, 2));
  }

  // Promote edilen instinct'ler icin bildirim
  if (newlyPromoted.length > 0) {
    notify('Hizir: Instinct Promoted', `${newlyPromoted.length} pattern rule oldu: ${newlyPromoted.map(p => p.pattern).join(', ')}`, 'info');
  }

  // instincts.jsonl'i temizle (sadece mature basarili yazildiysa)
  try {
    // mature-instincts.json'in dogru yazildigini dogrula
    const verifyContent = readFileSync(maturePath, 'utf-8');
    JSON.parse(verifyContent); // parse edilebildiyse guvenli
    writeFileSync(instinctsPath, '');
  } catch {
    // mature yazilamadiysa instincts'i kaybetme
  }

  const matureCount = matureList.filter(m => m.confidence >= MATURE_THRESHOLD).length;
  const msg = newlyPromoted.length > 0
    ? `Instincts: ${rawInstincts.length} consolidated, ${matureCount} mature, ${newlyPromoted.length} promoted to rules`
    : `Instincts: ${rawInstincts.length} consolidated, ${matureCount} mature`;

  console.log(JSON.stringify({ result: msg }));
}

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100);
}

function promoteToRule(instinct: MatureInstinct, claudeDir: string): void {
  const rulesDir = join(claudeDir, 'rules', 'archive');
  if (!existsSync(rulesDir)) mkdirSync(rulesDir, { recursive: true });

  const safeName = sanitizeFilename(instinct.pattern);
  const fileName = `learned-${safeName}.md`;
  const filePath = join(rulesDir, fileName);

  // Path traversal guard
  if (!filePath.startsWith(rulesDir)) return;

  // Zaten varsa skip
  if (existsSync(filePath)) return;

  const content = `# Learned: ${instinct.pattern}

> Bu kural otomatik olusturuldu (${instinct.count} tekrar, ${instinct.type} tipi).

## Pattern
${instinct.pattern}

## Ornekler
${instinct.examples.map(e => `- ${e}`).join('\n')}

## Ilk gorulme
${instinct.first_seen}

## Son gorulme
${instinct.last_seen}
`;

  writeFileSync(filePath, content);

  // Log
  const logPath = join(claudeDir, 'learning-log.txt');
  const logLine = `[${new Date().toISOString()}] PROMOTED: ${instinct.pattern} (${instinct.count} occurrences) → ${fileName}\n`;
  appendFileSync(logPath, logLine);
}

main();
