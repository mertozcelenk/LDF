/**
 * Token conformance testi — HTML dosyalarındaki CSS custom property değerlerini
 * token JSON ile karşılaştırır, uyumsuzlukları raporlar.
 *
 * Kullanım:
 *   node tokens.mjs                          → token JSON otomatik bulunur
 *   node tokens.mjs --tokens myproject.json  → dosya belirt
 *   Ortak seçenekler (--root, --format, --json): lib/common.mjs
 *
 * Token dosyası yoksa: project-state.md → token_dosyasi: yok (token'sız sunum modu) ise uygulanamaz,
 * aksi halde çalıştırılamadı.
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve, relative, join, basename } from 'path';
import { projectRoot, projectHtmlFiles, htmlPrecheck, readProjectState, statusFrom, finish, crash } from './lib/common.mjs';

const TEST = 'tokens';
const PROJECT_ROOT = projectRoot();

// Token JSON'u bul
function findTokenFile() {
  const arg = process.argv.indexOf('--tokens');
  if (arg !== -1) return resolve(process.argv[arg + 1]);

  for (const entry of readdirSync(PROJECT_ROOT)) {
    if (entry.endsWith('-tokens.json')) return join(PROJECT_ROOT, entry);
  }
  return null;
}

// W3C DTCG token JSON'dan düz değer haritası çıkar
// "Color.primary.$value" → { key: "--color-primary", value: "#1A1A2E" }
function flattenTokens(obj, path = []) {
  const map = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith('_')) continue; // _meta vb. atla
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      if ('$value' in v) {
        // CSS custom property adına çevir: Color.primary → --color-primary
        const cssVar = '--' + [...path, k]
          .join('-')
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, '-')
          .replace(/-+/g, '-');
        map[cssVar] = String(v.$value).toLowerCase().trim();
      } else {
        Object.assign(map, flattenTokens(v, [...path, k]));
      }
    }
  }
  return map;
}

// HTML dosyasından CSS custom property tanımlarını çıkar
// :root { --color-primary: #1A1A2E; } → { "--color-primary": "#1a1a2e" }
function extractCssVars(html) {
  const map = {};
  const rootBlock = html.match(/:root\s*\{([^}]+)\}/g) || [];
  for (const block of rootBlock) {
    const props = block.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g);
    for (const [, name, value] of props) {
      map[`--${name}`] = value.toLowerCase().trim();
    }
  }
  // :root dışındaki inline style'larda da ara
  const inlineProps = html.matchAll(/style="[^"]*--([\w-]+)\s*:\s*([^;"]+)/g);
  for (const [, name, value] of inlineProps) {
    map[`--${name}`] = value.toLowerCase().trim();
  }
  return map;
}

function normalizeColor(val) {
  // #000 → #000000, rgb(0,0,0) → rgb(0, 0, 0) gibi basit normalizasyon
  return val.replace(/\s+/g, ' ').trim();
}

async function run() {
  const skip = htmlPrecheck(TEST, PROJECT_ROOT);
  if (skip) return finish(skip);

  const tokenFile = findTokenFile();
  if (!tokenFile || !existsSync(tokenFile)) {
    const declared = (readProjectState(PROJECT_ROOT)?.token_dosyasi || '').toLowerCase();
    if (declared === 'yok') {
      return finish({ test: TEST, status: 'not_applicable', reason: "project-state.md → token_dosyasi: yok (token'sız sunum modu)", findings: [] });
    }
    return finish({ test: TEST, status: 'not_run', reason: 'Token JSON bulunamadı — /ldf-token-generator çalıştırın veya --tokens ile belirtin', findings: [] });
  }

  const tokenData = JSON.parse(readFileSync(tokenFile, 'utf8'));
  const tokenMap = flattenTokens(tokenData);
  console.log(`Token dosyası: ${basename(tokenFile)} — ${Object.keys(tokenMap).length} token`);

  const htmlFiles = projectHtmlFiles(PROJECT_ROOT);
  const findings = [];

  for (const file of htmlFiles) {
    const label = relative(PROJECT_ROOT, file);
    const cssVars = extractCssVars(readFileSync(file, 'utf8'));
    const before = findings.length;

    for (const [cssVar, cssVal] of Object.entries(cssVars)) {
      const tokenVal = tokenMap[cssVar];
      const base = { file: label, selector: ':root', viewport: null, theme: null };
      if (!tokenVal) {
        findings.push({ ...base, rule: 'tokens/undeclared-variable', impact: 'Medium', blocks: false, msg: `Serbest değer: ${cssVar}: ${cssVal} (token'da tanımlı değil)` });
      } else if (normalizeColor(cssVal) !== normalizeColor(tokenVal)) {
        findings.push({ ...base, rule: 'tokens/value-mismatch', impact: 'High', blocks: true, msg: `Uyumsuz: ${cssVar} — HTML: "${cssVal}", Token: "${tokenVal}"` });
      }
    }
    console.log(`  ${findings.length > before ? '[SORUN]' : '[GEÇTİ]'}   ${label}`);
  }

  for (const f of findings) console.log(`  [${f.impact}] ${f.file} — ${f.msg}`);
  finish({ test: TEST, status: statusFrom(findings), checked: htmlFiles.length, findings });
}

run().catch(err => crash(TEST, err));
