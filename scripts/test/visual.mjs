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
 *
 * Ortak seçenekler (--root, --format, --json): lib/common.mjs
 * run-all.mjs içinde zorunlu değildir: görsel fark, iterate'te beklenen bir değişiklik de olabilir.
 * Fark bulguları teslimi engellemez, gözle doğrulanmalıdır.
 */

import { chromium } from 'playwright';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, relative, join } from 'path';
import { projectRoot, projectHtmlFiles, htmlPrecheck, finish, crash } from './lib/common.mjs';

const TEST = 'visual';
const PROJECT_ROOT = projectRoot();
const SNAPSHOT_DIR = resolve(import.meta.dirname, 'snapshots');
const UPDATE_MODE = process.argv.includes('--update');

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
  const skip = htmlPrecheck(TEST, PROJECT_ROOT);
  if (skip) return finish(skip);
  const htmlFiles = projectHtmlFiles(PROJECT_ROOT);

  mkdirSync(SNAPSHOT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const results = { passed: [], failed: [], updated: [], missing: [] };
  const findings = [];

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
        results.failed.push(label);
        writeFileSync(snapPath.replace('.png', '.diff.png'), screenshot);
        findings.push({ rule: 'visual/regression', file: label, selector: null, viewport: 1280, theme: null, impact: 'Medium', blocks: false, msg: `PNG bayt farkı: ${diff.toFixed(2)}/255 — gözle doğrulayın` });
        console.log(`  [FARK]    ${label} — PNG bayt farkı: ${diff.toFixed(2)}/255`);
      }
    }

    await page.close();
  }

  await browser.close();

  if (UPDATE_MODE) {
    return finish({ test: TEST, status: 'passed', reason: `${results.updated.length} baseline güncellendi — görüntüleri gözden geçirin`, checked: htmlFiles.length, findings });
  }
  if (results.failed.length) {
    return finish({ test: TEST, status: 'failed', reason: `${results.failed.length} dosyada görsel fark`, checked: htmlFiles.length, findings });
  }
  if (results.missing.length === htmlFiles.length) {
    return finish({ test: TEST, status: 'not_run', reason: 'baseline yok — node visual.mjs --update', checked: 0, findings });
  }
  const note = results.missing.length ? `${results.missing.length} dosyada baseline yok (karşılaştırılmadı)` : null;
  finish({ test: TEST, status: 'passed', reason: note, checked: results.passed.length, findings });
}

run().catch(err => crash(TEST, err));
