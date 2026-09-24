/**
 * Visual regression test — HTML çıktılarının screenshot'larını alır,
 * baseline ile karşılaştırır, farkları raporlar.
 *
 * Kullanım:
 *   node visual.mjs           → karşılaştırma modu (baseline yoksa [BASELINE YOK] uyarısı verir)
 *   node visual.mjs --update  → baseline oluştur veya güncelle; oluşturulan görselleri gözden geçirin
 *
 * Not: Karşılaştırma ham PNG bayt ortalaması üzerinden yapılır (eşik: 2/255).
 * Aynı görsel farklı PNG kodlamasıyla farklı bayt üretebilir; false-positive durumunda
 * --update ile baseline'ı yenileyip farkın gerçek olup olmadığını gözle doğrulayın.
 */

import { chromium } from 'playwright';
import { createHash } from 'crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { resolve, relative, join, basename } from 'path';

const PROJECT_ROOT = resolve(import.meta.dirname, '..', '..');
const SNAPSHOT_DIR = resolve(import.meta.dirname, 'snapshots');
const UPDATE_MODE = process.argv.includes('--update');

// Proje kökünden tüm HTML dosyalarını bul
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

function snapshotPath(htmlFile) {
  const rel = relative(PROJECT_ROOT, htmlFile).replace(/\//g, '__').replace('.html', '.png');
  return join(SNAPSHOT_DIR, rel);
}

// Ham PNG bayt ortalaması — piksel decode edilmez; PNG metadata/sıkıştırma farkı sonucu etkileyebilir
function pngByteDiff(buf1, buf2) {
  if (buf1.length !== buf2.length) return Infinity;
  let diff = 0;
  for (let i = 0; i < buf1.length; i++) diff += Math.abs(buf1[i] - buf2[i]);
  return diff / buf1.length;
}

async function run() {
  const htmlFiles = [
    ...findHtmlFiles(join(PROJECT_ROOT, 'components')),
    ...findHtmlFiles(join(PROJECT_ROOT, 'screens')),
  ];

  if (htmlFiles.length === 0) {
    console.log('[ATLANDI] HTML dosyası bulunamadı — test çalıştırılmadı. Önce /ldf-design-strategy çalıştırın.');
    process.exit(0);
  }

  mkdirSync(SNAPSHOT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const results = { passed: [], failed: [], updated: [], missing: [] };

  for (const file of htmlFiles) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`file://${file}`);
    await page.waitForLoadState('networkidle');

    const screenshot = await page.screenshot({ fullPage: true });
    const snapPath = snapshotPath(file);
    const label = relative(PROJECT_ROOT, file);

    if (UPDATE_MODE) {
      writeFileSync(snapPath, screenshot);
      results.updated.push(label);
      console.log(`  [GÜNCELLENDİ] ${label}`);
    } else if (!existsSync(snapPath)) {
      results.missing.push(label);
      console.log(`  [BASELINE YOK] ${label} — oluşturmak için: node visual.mjs --update`);
    } else {
      const baseline = readFileSync(snapPath);
      const diff = pngByteDiff(baseline, screenshot);
      const threshold = 2; // ham PNG bayt ortalaması eşiği (0–255)

      if (diff <= threshold) {
        results.passed.push(label);
        console.log(`  [GEÇTİ]   ${label}`);
      } else {
        results.failed.push({ label, diff: diff.toFixed(2) });
        writeFileSync(snapPath.replace('.png', '.diff.png'), screenshot);
        console.log(`  [BAŞARISIZ] ${label} — PNG bayt farkı: ${diff.toFixed(2)}/255`);
      }
    }

    await page.close();
  }

  await browser.close();

  console.log('\n--- Visual Regression Özeti ---');
  console.log(`Geçti:           ${results.passed.length}`);
  console.log(`Başarısız:       ${results.failed.length}`);
  console.log(`Güncellendi:     ${results.updated.length}`);
  console.log(`Baseline yok:    ${results.missing.length}`);

  if (results.missing.length > 0) {
    console.log('\nBaseline eksik dosyalar (test çalıştırılmadı):');
    results.missing.forEach(f => console.log(`  ${f}`));
    console.log('  → Baseline oluşturmak için: node visual.mjs --update');
  }

  if (results.failed.length > 0) {
    console.log('\nBaşarısız dosyalar:');
    results.failed.forEach(f => console.log(`  ${f.label} (fark: ${f.diff})`));
    process.exit(1);
  }
}

run().catch(err => { console.error(err); process.exit(1); });
