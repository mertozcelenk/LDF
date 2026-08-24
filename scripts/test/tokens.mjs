/**
 * Token conformance testi — HTML dosyalarındaki CSS custom property değerlerini
 * token JSON ile karşılaştırır, uyumsuzlukları raporlar.
 *
 * Kullanım:
 *   node tokens.mjs                          → token JSON otomatik bulunur
 *   node tokens.mjs --tokens myproject.json  → dosya belirt
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve, relative, join, basename } from 'path';

const PROJECT_ROOT = resolve(import.meta.dirname, '..', '..');

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

function findHtmlFiles(dir) {
  const results = [];
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) results.push(...findHtmlFiles(full));
    else if (entry.name.endsWith('.html')) results.push(full);
  }
  return results;
}

function normalizeColor(val) {
  // #000 → #000000, rgb(0,0,0) → rgb(0, 0, 0) gibi basit normalizasyon
  return val.replace(/\s+/g, ' ').trim();
}

async function run() {
  const tokenFile = findTokenFile();
  if (!tokenFile || !existsSync(tokenFile)) {
    console.log('Token JSON bulunamadı. Önce /token-generator çalıştırın veya --tokens ile belirtin.');
    process.exit(0);
  }

  const tokenData = JSON.parse(readFileSync(tokenFile, 'utf8'));
  const tokenMap = flattenTokens(tokenData);
  console.log(`Token dosyası: ${basename(tokenFile)} — ${Object.keys(tokenMap).length} token`);

  const htmlFiles = [
    ...findHtmlFiles(join(PROJECT_ROOT, 'components')),
    ...findHtmlFiles(join(PROJECT_ROOT, 'screens')),
  ];

  if (htmlFiles.length === 0) {
    console.log('HTML dosyası bulunamadı. Önce /design-strategy çalıştırın.');
    process.exit(0);
  }

  const summary = { passed: 0, mismatched: 0, unknown: 0 };
  const issues = [];

  for (const file of htmlFiles) {
    const label = relative(PROJECT_ROOT, file);
    const html = readFileSync(file, 'utf8');
    const cssVars = extractCssVars(html);

    let filePassed = true;

    for (const [cssVar, cssVal] of Object.entries(cssVars)) {
      const tokenVal = tokenMap[cssVar];

      if (!tokenVal) {
        // Token'da tanımlı değil — serbest değer kullanılmış
        summary.unknown++;
        issues.push({ label, sev: 'KÜÇÜK', msg: `Serbest değer: ${cssVar}: ${cssVal} (token'da tanımlı değil)` });
        filePassed = false;
      } else if (normalizeColor(cssVal) !== normalizeColor(tokenVal)) {
        // Token'da var ama değer uyuşmuyor
        summary.mismatched++;
        issues.push({ label, sev: 'ENGELLEYİCİ', msg: `Uyumsuz: ${cssVar} — HTML: "${cssVal}", Token: "${tokenVal}"` });
        filePassed = false;
      }
    }

    if (filePassed) {
      summary.passed++;
      console.log(`  [GEÇTİ]   ${label}`);
    } else {
      console.log(`  [SORUN]   ${label}`);
    }
  }

  if (issues.length > 0) {
    console.log('\nBulgular:');
    for (const issue of issues) {
      console.log(`  [${issue.sev}] ${issue.label}`);
      console.log(`    ${issue.msg}`);
    }
  }

  console.log('\n--- Token Conformance Özeti ---');
  console.log(`Geçti:          ${summary.passed} dosya`);
  console.log(`Uyumsuz değer:  ${summary.mismatched} ihlal`);
  console.log(`Serbest değer:  ${summary.unknown} uyarı`);

  if (summary.mismatched > 0) process.exit(1);
}

run().catch(err => { console.error(err); process.exit(1); });
