/**
 * Visual regression test — HTML çıktılarının screenshot'larını alır,
 * baseline ile piksel piksel karşılaştırır, farkları raporlar.
 *
 * Kullanım:
 *   node visual.mjs                    → karşılaştırma modu (baseline yoksa [BASELINE YOK])
 *   node visual.mjs --update           → baseline oluştur veya güncelle; oluşturulan görselleri gözden geçirin
 *   node visual.mjs --max-diff 0.1     → izin verilen farklı piksel oranı, yüzde (varsayılan 0.05)
 *   node visual.mjs --snapshots <dir>  → baseline klasörü (varsayılan scripts/test/snapshots)
 *
 * Karşılaştırma pixelmatch ile çözülmüş pikseller üzerinden yapılır (kenar yumuşatma farkları sayılmaz).
 * Fark varsa <ad>.diff.png gerçek bir fark haritasıdır: değişen pikseller kırmızı, gerisi soluk.
 * Sayfa yüksekliği değiştiyse ortak alan karşılaştırılır ve boyut farkı ayrıca raporlanır.
 *
 * Ortak seçenekler (--root, --format, --json): lib/common.mjs
 * run-all.mjs içinde zorunlu değildir: görsel fark, iterate'te beklenen bir değişiklik de olabilir.
 * Fark bulguları teslimi engellemez, gözle doğrulanmalıdır.
 */

import { chromium } from 'playwright';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, relative, join } from 'path';
import { projectRoot, projectHtmlFiles, htmlPrecheck, argValue, finish, crash } from './lib/common.mjs';

const TEST = 'visual';
const PROJECT_ROOT = projectRoot();
const SNAPSHOT_DIR = resolve(argValue('--snapshots') || resolve(import.meta.dirname, 'snapshots'));
const MAX_DIFF_PERCENT = Number(argValue('--max-diff') ?? 0.05);
const UPDATE_MODE = process.argv.includes('--update');

function snapshotPath(htmlFile) {
  const rel = relative(PROJECT_ROOT, htmlFile).replace(/\//g, '__').replace('.html', '.png');
  return join(SNAPSHOT_DIR, rel);
}

// İki ekran görüntüsünü ortak alanda piksel piksel karşılaştırır, fark haritasını döndürür
function compareScreens(baselineBuf, currentBuf) {
  const base = PNG.sync.read(baselineBuf);
  const cur = PNG.sync.read(currentBuf);
  const width = Math.min(base.width, cur.width);
  const height = Math.min(base.height, cur.height);
  const crop = img => {
    if (img.width === width && img.height === height) return img.data;
    const out = Buffer.alloc(width * height * 4);
    for (let y = 0; y < height; y++) img.data.copy(out, y * width * 4, y * img.width * 4, y * img.width * 4 + width * 4);
    return out;
  };
  const diff = new PNG({ width, height });
  const changed = pixelmatch(crop(base), crop(cur), diff.data, width, height, { threshold: 0.1 });
  return {
    percent: (changed / (width * height)) * 100,
    changed,
    sizeChanged: base.width !== cur.width || base.height !== cur.height,
    sizes: `${base.width}×${base.height} → ${cur.width}×${cur.height}`,
    diffPng: PNG.sync.write(diff),
  };
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
      const cmp = compareScreens(readFileSync(snapPath), screenshot);
      const diffPath = snapPath.replace('.png', '.diff.png');

      if (cmp.percent <= MAX_DIFF_PERCENT && !cmp.sizeChanged) {
        results.passed.push(label);
        console.log(`  [GEÇTİ]   ${label}`);
      } else {
        results.failed.push(label);
        writeFileSync(diffPath, cmp.diffPng);
        const detail = `${cmp.changed} piksel (%${cmp.percent.toFixed(2)}) farklı${cmp.sizeChanged ? `, boyut ${cmp.sizes}` : ''} — fark haritası: ${relative(PROJECT_ROOT, diffPath)}`;
        findings.push({ rule: 'visual/regression', file: label, selector: null, viewport: 1280, theme: null, impact: 'Medium', blocks: false, msg: `${detail} — gözle doğrulayın` });
        console.log(`  [FARK]    ${label} — ${detail}`);
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
