/**
 * Instinct Loader - SessionStart hook
 *
 * Session basinda olgun instinct'leri (confidence >= 5) okur
 * ve context'e enjekte eder. Claude bu pattern'lari bilir.
 *
 * Canavar entegrasyonu: Son 7 gunun en sik takim hatalarini da enjekte eder.
 */
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

interface MatureInstinct {
  pattern: string;
  type: string;
  count: number;
  confidence: number;
  examples: string[];
  promoted: boolean;
}

const INJECT_THRESHOLD = 5;  // Bu ve ustu context'e enjekte edilir
const MAX_INJECT = 10;       // En fazla 10 instinct enjekte et
const TEAM_ERRORS_DAYS = 7;  // Son X gunun takim hatalari
const MAX_TEAM_ERRORS = 5;   // En fazla X hata goster

interface ErrorEntry {
  ts: string;
  session: string;
  agent_id: string;
  agent_type: string;
  error_type: string;
  error_pattern: string;
  detail: string;
  file: string;
  lesson: string;
}

function main() {
  // stdin oku (SessionStart input)
  try { readFileSync(0, 'utf-8'); } catch { /* ok */ }

  const maturePath = join(homedir(), '.claude', 'mature-instincts.json');

  if (!existsSync(maturePath)) {
    console.log('{}');
    return;
  }

  let instincts: MatureInstinct[];
  try {
    instincts = JSON.parse(readFileSync(maturePath, 'utf-8'));
  } catch {
    console.log('{}');
    return;
  }

  // Olgun instinct'leri filtrele
  const mature = instincts
    .filter(i => i.confidence >= INJECT_THRESHOLD)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, MAX_INJECT);

  if (mature.length === 0) {
    console.log('{}');
    return;
  }

  // Context mesaji olustur
  const lines: string[] = [
    '--- LEARNED PATTERNS (Otomatik Ogrenilmis) ---',
    '',
  ];

  for (const inst of mature) {
    const promoted = inst.promoted ? ' [RULE]' : '';
    lines.push(`[${inst.type}] ${inst.pattern} (${inst.count}x)${promoted}`);
    if (inst.examples.length > 0) {
      lines.push(`  ornek: ${inst.examples[0]}`);
    }
  }

  lines.push('');
  lines.push(`--- ${mature.length} pattern, ${instincts.length} toplam ---`);

  // Canavar: Takim hatalarini enjekte et
  const teamErrorLines = loadTeamErrors();
  if (teamErrorLines.length > 0) {
    lines.push('');
    lines.push(...teamErrorLines);
  }

  const resultMsg = teamErrorLines.length > 0
    ? `Loaded ${mature.length} patterns + team errors`
    : `Loaded ${mature.length} learned patterns`;

  console.log(JSON.stringify({
    result: resultMsg,
    systemMessage: lines.join('\n')
  }));
}

function loadTeamErrors(): string[] {
  const ledgerPath = join(homedir(), '.claude', 'canavar', 'error-ledger.jsonl');
  if (!existsSync(ledgerPath)) return [];

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - TEAM_ERRORS_DAYS);

  const lines = readFileSync(ledgerPath, 'utf-8').split('\n').filter(l => l.trim());
  const recent: ErrorEntry[] = [];

  for (const line of lines) {
    try {
      const entry: ErrorEntry = JSON.parse(line);
      if (new Date(entry.ts) >= cutoff) {
        recent.push(entry);
      }
    } catch { /* skip */ }
  }

  if (recent.length === 0) return [];

  // Pattern + agent bazli grupla
  const grouped = new Map<string, { count: number; agent: string; lesson: string }>();
  for (const e of recent) {
    const key = `${e.agent_type}:${e.error_pattern}`;
    const existing = grouped.get(key);
    if (existing) {
      existing.count++;
    } else {
      grouped.set(key, { count: 1, agent: e.agent_type, lesson: e.lesson });
    }
  }

  // En sik hatalar
  const sorted = [...grouped.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_TEAM_ERRORS);

  const result: string[] = [
    `--- TAKIM HATALARI (Son ${TEAM_ERRORS_DAYS} Gun) ---`,
  ];

  for (const entry of sorted) {
    result.push(`[${entry.count}x] ${entry.agent}: ${entry.lesson}`);
  }

  return result;
}

main();
