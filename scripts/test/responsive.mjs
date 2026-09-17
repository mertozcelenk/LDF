/**
 * Responsive test — HTML çıktılarını 3 kritik viewport'ta açar,
 * yatay overflow ve içerik taşmasını kontrol eder.
 *
 * Kullanım:
 *   node responsive.mjs
 */

import { chromium } from 'playwright';
import { existsSync, readdirSync } from 'fs';
import { resolve, relative, join } from 'path';

const PROJECT_ROOT = resolve(import.meta.dirname, '..', '..');

const VIEWPORTS = [
  { label: 'mobile',  width: 375,  height: 812 },
  { label: 'tablet',  width: 768,  height: 1024 },
  { label: 'desktop', width: 1280, height: 800 },
];

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

async function checkOverflow(page) {
  return page.evaluate(() => {
    const bodyWidth = document.body.scrollWidth;
    const viewportWidth = window.innerWidth;
    const overflowingEls = [];

    document.querySelectorAll('*').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.right > viewportWidth + 1) {
        const tag = el.tagName.toLowerCase();
        const id = el.id ? `#${el.id}` : '';
        const cls = el.className && typeof el.className === 'string'
          ? `.${el.className.trim().split(/\s+/).join('.')}`
          : '';
        overflowingEls.push(`${tag}${id}${cls}`);
      }
    });

    return {
      hasHorizontalScroll: bodyWidth > viewportWidth,
      bodyScrollWidth: bodyWidth,
      viewportWidth,
      overflowingElements: [...new Set(overflowingEls)].slice(0, 5),
    };
  });
}

async function run() {
  // index.html varsa onu test et; yoksa tüm component/screen HTML'lerini test et
  const indexPath = join(PROJECT_ROOT, 'index.html');
  const htmlFiles = existsSync(indexPath)
    ? [indexPath]
    : [
        ...findHtmlFiles(join(PROJECT_ROOT, 'components')),
        ...findHtmlFiles(join(PROJECT_ROOT, 'screens')),
      ];

  if (htmlFiles.length === 0) {
    console.log('HTML dosyası bulunamadı. Önce /design-strategy çalıştırın.');
    process.exit(0);
  }

  const browser = await chromium.launch();
  const failures = [];

  for (const file of htmlFiles) {
    const label = relative(PROJECT_ROOT, file);

    for (const vp of VIEWPORTS) {
      const page = await browser.newPage();
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(`file://${file}`);
      await page.waitForLoadState('networkidle');

      const result = await checkOverflow(page);
      await page.close();

      if (result.hasHorizontalScroll) {
        const detail = result.overflowingElements.length
          ? `taşan: ${result.overflowingElements.join(', ')}`
          : `scrollWidth=${result.bodyScrollWidth}px > ${vp.width}px`;
        failures.push({ label, viewport: vp.label, width: vp.width, detail });
        console.log(`  [BAŞARISIZ] ${label} @ ${vp.label} (${vp.width}px) — ${detail}`);
      } else {
        console.log(`  [GEÇTİ]    ${label} @ ${vp.label} (${vp.width}px)`);
      }
    }
  }

  await browser.close();

  console.log('\n--- Responsive Test Özeti ---');
  console.log(`Toplam kontrol: ${htmlFiles.length * VIEWPORTS.length}`);
  console.log(`Başarısız:      ${failures.length}`);

  if (failures.length > 0) {
    console.log('\nDüzeltilmesi gereken dosyalar:');
    failures.forEach(f =>
      console.log(`  ${f.label} @ ${f.viewport} (${f.width}px) — ${f.detail}`)
    );
    process.exit(1);
  }
}

run().catch(err => { console.error(err); process.exit(1); });
