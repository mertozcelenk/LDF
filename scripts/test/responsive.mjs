/**
 * Responsive test — HTML çıktılarını 3 kritik viewport'ta açar,
 * yatay overflow ve içerik taşmasını kontrol eder.
 *
 * Kullanım:
 *   node responsive.mjs
 *   Ortak seçenekler (--root, --format, --json): lib/common.mjs
 */

import { chromium } from 'playwright';
import { existsSync } from 'fs';
import { relative, join } from 'path';
import { projectRoot, projectHtmlFiles, htmlPrecheck, finish, crash } from './lib/common.mjs';

const TEST = 'responsive';
const PROJECT_ROOT = projectRoot();

const VIEWPORTS = [
  { label: 'mobile',  width: 375,  height: 812 },
  { label: 'tablet',  width: 768,  height: 1024 },
  { label: 'desktop', width: 1280, height: 800 },
];

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
  const skip = htmlPrecheck(TEST, PROJECT_ROOT);
  if (skip) return finish(skip);

  // index.html varsa onu test et; yoksa tüm component/screen HTML'lerini test et
  const indexPath = join(PROJECT_ROOT, 'index.html');
  const htmlFiles = existsSync(indexPath) ? [indexPath] : projectHtmlFiles(PROJECT_ROOT);

  const browser = await chromium.launch();
  const findings = [];

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
        findings.push({
          rule: 'responsive/horizontal-overflow',
          file: label,
          selector: result.overflowingElements[0] || 'body',
          viewport: vp.width,
          theme: null,
          impact: 'High',
          blocks: true,
          msg: `Yatay kaydırma — ${detail}`,
        });
        console.log(`  [BAŞARISIZ] ${label} @ ${vp.label} (${vp.width}px) — ${detail}`);
      } else {
        console.log(`  [GEÇTİ]    ${label} @ ${vp.label} (${vp.width}px)`);
      }
    }
  }

  await browser.close();
  finish({ test: TEST, status: findings.length ? 'failed' : 'passed', checked: htmlFiles.length * VIEWPORTS.length, findings });
}

run().catch(err => crash(TEST, err));
