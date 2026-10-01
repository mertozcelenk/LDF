/**
 * AI tells & layout disiplini testi — reviewer-checklist.md'deki mekanik ölçülebilen
 * kuralları HTML çıktıları üzerinde 1280px desktop viewport'ta kontrol eder.
 *
 *   BLOCKER  Görünür metin / alt / aria-label içinde em-dash (—) veya en-dash (–)
 *   HIGH     CTA etiketi desktop'ta iki satıra kayıyor
 *   HIGH     Nav yüksekliği > 80px veya nav öğeleri tek satıra sığmıyor   [marketing]
 *   MEDIUM   Eyebrow sayısı > ceil(section sayısı / 3)                    [marketing]
 *   MEDIUM   screens/ altındaki dosyada <body data-page-kind> eksik
 *
 * [marketing] kontrolleri yalnızca <body data-page-kind="marketing"> olan dosyalarda çalışır.
 *
 * Kullanım:
 *   node tells.mjs                 → proje kökündeki components/ ve screens/ taranır
 *   node tells.mjs --root <dizin>  → başka bir proje kökü (test fixture'ları için)
 */

import { chromium } from 'playwright';
import { existsSync, readdirSync } from 'fs';
import { resolve, relative, join, sep } from 'path';

const rootArg = process.argv.indexOf('--root');
const PROJECT_ROOT = rootArg !== -1
  ? resolve(process.argv[rootArg + 1])
  : resolve(import.meta.dirname, '..', '..');

const VIEWPORT = { width: 1280, height: 800 };
const NAV_MAX_HEIGHT = 80;

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

// Tarayıcı içinde çalışır — tüm ölçümler tek evaluate çağrısında
function inspectPage(navMaxHeight) {
  const isVisible = el => {
    const style = getComputedStyle(el);
    return style.visibility !== 'hidden' && style.display !== 'none' && el.getClientRects().length > 0;
  };
  const describe = el => {
    const tag = el.tagName.toLowerCase();
    const cls = typeof el.className === 'string' && el.className.trim()
      ? `.${el.className.trim().split(/\s+/).join('.')}` : '';
    return `${tag}${el.id ? `#${el.id}` : ''}${cls}`;
  };
  const snippet = (text, idx) =>
    text.slice(Math.max(0, idx - 25), idx + 25).replace(/\s+/g, ' ').trim();

  // Bir elemanın metninin kaç satıra yayıldığı (satır kutularının dikey konumlarına göre)
  const lineCount = el => {
    const range = document.createRange();
    range.selectNodeContents(el);
    const rects = [...range.getClientRects()].filter(r => r.width > 0 && r.height > 0);
    if (rects.length === 0) return 0;
    const fontSize = parseFloat(getComputedStyle(el).fontSize) || 16;
    const tops = [];
    for (const r of rects) {
      if (!tops.some(t => Math.abs(t - r.top) < fontSize * 0.6)) tops.push(r.top);
    }
    return tops.length;
  };

  const findings = [];
  const pageKind = document.body.dataset.pageKind || null;

  // 1. Em-dash / en-dash — görünür metin, alt, aria-label
  const DASH = /[—–]/;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let dashCount = 0;
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const parent = node.parentElement;
    if (!parent || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName)) continue;
    const idx = node.textContent.search(DASH);
    if (idx === -1 || !isVisible(parent)) continue;
    dashCount++;
    if (dashCount <= 5) {
      findings.push({ sev: 'BLOCKER', msg: `Em/en-dash metinde: "${snippet(node.textContent, idx)}" (${describe(parent)})` });
    }
  }
  for (const el of document.querySelectorAll('[alt], [aria-label]')) {
    for (const attr of ['alt', 'aria-label']) {
      const val = el.getAttribute(attr);
      if (val && DASH.test(val)) {
        dashCount++;
        if (dashCount <= 5) {
          findings.push({ sev: 'BLOCKER', msg: `Em/en-dash ${attr} içinde: "${val}" (${describe(el)})` });
        }
      }
    }
  }
  if (dashCount > 5) {
    findings.push({ sev: 'BLOCKER', msg: `…toplam ${dashCount} em/en-dash (ilk 5 listelendi)` });
  }

  // 2. CTA satır kayması
  const ctaSelector = 'button, a[role="button"], .btn, [class*="btn-"], [class*="button"], input[type="submit"], input[type="button"]';
  const seen = new Set();
  for (const el of document.querySelectorAll(ctaSelector)) {
    if (seen.has(el) || !isVisible(el) || el.closest('nav')) continue;
    seen.add(el);
    if (el.tagName === 'INPUT') continue; // input metni tek satırda render edilir
    const label = el.textContent.replace(/\s+/g, ' ').trim();
    if (!label) continue;
    const lines = lineCount(el);
    if (lines > 1) {
      findings.push({ sev: 'HIGH', msg: `CTA ${lines} satıra kayıyor: "${label}" (${describe(el)})` });
    }
  }

  if (pageKind === 'marketing') {
    // 3. Nav — yükseklik ve tek satır
    const nav = document.querySelector('header nav, nav');
    if (nav && isVisible(nav)) {
      const bar = nav.closest('header') || nav;
      const height = Math.round(bar.getBoundingClientRect().height);
      if (height > navMaxHeight) {
        findings.push({ sev: 'HIGH', msg: `Nav yüksekliği ${height}px > ${navMaxHeight}px (${describe(bar)})` });
      }
      const items = [...nav.querySelectorAll('a, button')].filter(isVisible);
      const centers = [];
      for (const item of items) {
        const r = item.getBoundingClientRect();
        const c = r.top + r.height / 2;
        if (!centers.some(x => Math.abs(x - c) < 12)) centers.push(c);
      }
      const wrapped = items.filter(i => lineCount(i) > 1).map(i => i.textContent.trim());
      if (centers.length > 1 || wrapped.length > 0) {
        const detail = wrapped.length ? `kayan öğeler: ${wrapped.join(', ')}` : `${centers.length} satır`;
        findings.push({ sev: 'HIGH', msg: `Nav desktop'ta tek satıra sığmıyor — ${detail}` });
      }
    }

    // 4. Eyebrow sayısı — başlığın hemen önündeki küçük, büyük harfli, açık aralıklı etiketler
    const topSections = [...document.querySelectorAll('section')].filter(s => !s.parentElement.closest('section'));
    const sectionCount = Math.max(topSections.length, 1);
    const limit = Math.ceil(sectionCount / 3);
    const isHeading = el => el && (/^H[1-6]$/.test(el.tagName) || el.firstElementChild && /^H[1-6]$/.test(el.firstElementChild.tagName));
    const eyebrows = [];
    for (const el of document.body.querySelectorAll('*')) {
      if (el.children.length > 0 || !isVisible(el)) continue;
      const text = el.textContent.trim();
      if (!text || text.length > 60) continue;
      const style = getComputedStyle(el);
      const fontSize = parseFloat(style.fontSize);
      const spacing = style.letterSpacing === 'normal' ? 0 : parseFloat(style.letterSpacing);
      const upper = style.textTransform === 'uppercase' || (text === text.toLocaleUpperCase('tr') && /\p{Lu}/u.test(text));
      if (upper && fontSize <= 14 && spacing / fontSize > 0.05 && isHeading(el.nextElementSibling)) {
        eyebrows.push(text);
      }
    }
    if (eyebrows.length > limit) {
      findings.push({
        sev: 'MEDIUM',
        msg: `Eyebrow sayısı ${eyebrows.length} > ${limit} (ceil(${sectionCount} section / 3)): ${eyebrows.map(e => `"${e}"`).join(', ')}`,
      });
    }
  }

  return { pageKind, findings };
}

async function run() {
  const screenDir = join(PROJECT_ROOT, 'screens');
  const htmlFiles = [
    ...findHtmlFiles(join(PROJECT_ROOT, 'components')),
    ...findHtmlFiles(screenDir),
  ];

  if (htmlFiles.length === 0) {
    console.log('[ATLANDI] HTML dosyası bulunamadı — test çalıştırılmadı. Önce /ldf-design-strategy çalıştırın.');
    process.exit(0);
  }

  const browser = await chromium.launch();
  const summary = { BLOCKER: 0, HIGH: 0, MEDIUM: 0 };
  const issues = [];

  for (const file of htmlFiles) {
    const label = relative(PROJECT_ROOT, file);
    const page = await browser.newPage();
    await page.setViewportSize(VIEWPORT);
    await page.goto(`file://${file}`);
    await page.waitForLoadState('networkidle');

    const { pageKind, findings } = await page.evaluate(inspectPage, NAV_MAX_HEIGHT);
    await page.close();

    if (!pageKind && file.startsWith(screenDir + sep)) {
      findings.push({ sev: 'MEDIUM', msg: '<body data-page-kind="marketing|product"> eksik — [marketing] kontrolleri atlandı' });
    }

    for (const f of findings) {
      summary[f.sev]++;
      issues.push({ label, ...f });
    }
    const kind = pageKind ? ` [${pageKind}]` : '';
    console.log(`  ${findings.length ? '[SORUN] ' : '[GEÇTİ] '}  ${label}${kind}`);
  }

  await browser.close();

  if (issues.length > 0) {
    console.log('\nBulgular:');
    for (const issue of issues) {
      console.log(`  [${issue.sev}] ${issue.label}`);
      console.log(`    ${issue.msg}`);
    }
  }

  console.log('\n--- AI Tells & Layout Özeti ---');
  console.log(`Taranan dosya: ${htmlFiles.length}`);
  console.log(`Blocker:       ${summary.BLOCKER}`);
  console.log(`High:          ${summary.HIGH}`);
  console.log(`Medium:        ${summary.MEDIUM}`);

  if (summary.BLOCKER > 0 || summary.HIGH > 0) process.exit(1);
}

run().catch(err => { console.error(err); process.exit(1); });
