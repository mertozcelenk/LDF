/**
 * Erişilebilirlik testi — axe-core ile her HTML dosyasını tarar,
 * WCAG AA ihlallerini raporlar.
 *
 * Kullanım:
 *   node accessibility.mjs
 *   node accessibility.mjs --fail-on-minor  → küçük bulgularda da çık kodu 1
 */

import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { existsSync, readdirSync } from 'fs';
import { resolve, relative, join } from 'path';

const PROJECT_ROOT = resolve(import.meta.dirname, '..', '..');
const FAIL_ON_MINOR = process.argv.includes('--fail-on-minor');

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

// axe impact → önem etiketine çevir
function impact(v) {
  if (v === 'critical' || v === 'serious') return 'ENGELLEYİCİ';
  return 'KÜÇÜK';
}

async function run() {
  const htmlFiles = [
    ...findHtmlFiles(join(PROJECT_ROOT, 'components')),
    ...findHtmlFiles(join(PROJECT_ROOT, 'screens')),
  ];

  if (htmlFiles.length === 0) {
    console.log('HTML dosyası bulunamadı. Önce /design-strategy çalıştırın.');
    process.exit(0);
  }

  const browser = await chromium.launch();
  const summary = { passed: 0, blocking: 0, minor: 0 };
  const allViolations = [];

  for (const file of htmlFiles) {
    const label = relative(PROJECT_ROOT, file);
    const page = await browser.newPage();
    await page.goto(`file://${file}`);
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    if (results.violations.length === 0) {
      summary.passed++;
      console.log(`  [GEÇTİ]   ${label}`);
    } else {
      for (const v of results.violations) {
        const sev = impact(v.impact);
        if (sev === 'ENGELLEYİCİ') summary.blocking++;
        else summary.minor++;

        allViolations.push({ label, sev, id: v.id, desc: v.description, help: v.helpUrl });
        console.log(`  [${sev}] ${label}`);
        console.log(`    Kural: ${v.id} — ${v.description}`);
        console.log(`    Detay: ${v.helpUrl}`);
      }
    }

    await page.close();
  }

  await browser.close();

  console.log('\n--- Erişilebilirlik Özeti ---');
  console.log(`Geçti:          ${summary.passed} dosya`);
  console.log(`Engelleyici:    ${summary.blocking} ihlal`);
  console.log(`Küçük:          ${summary.minor} ihlal`);

  const shouldFail = summary.blocking > 0 || (FAIL_ON_MINOR && summary.minor > 0);
  if (shouldFail) process.exit(1);
}

run().catch(err => { console.error(err); process.exit(1); });
