/**
 * AI tells & layout disiplini testi — reviewer-checklist.md'deki mekanik ölçülebilen
 * kuralları HTML çıktıları üzerinde 1280px desktop viewport'ta kontrol eder.
 *
 *   BLOCKER  Görünür metin / alt / aria-label içinde em-dash (—) veya en-dash (–)
 *            ([data-copy="user"] içindeki kullanıcı metni muaf)
 *   HIGH     CTA etiketi desktop'ta iki satıra kayıyor
 *   HIGH     Nav yüksekliği > 80px veya nav öğeleri tek satıra sığmıyor   [marketing]
 *   HIGH     Sayfa yüklenirken yakalanmamış JS hatası
 *   HIGH     Kaydırma sonrası metnin > %20'si hâlâ görünmez (başarısız reveal)
 *   HIGH     Metnin üstüne opak bir öğe binmiş
 *   MEDIUM   Başlık üstünde eyebrow / kicker ([data-eyebrow-allowed] istisnası hariç)
 *   MEDIUM   Işık halesi / spotlight, dekoratif ızgara veya çizgili zemin, sahte yanıp sönen imleç
 *   MEDIUM   Sonsuz animasyonlu küçük durum noktası ([data-live] hariç)
 *   MEDIUM   Aynı giriş animasyonu 2'den fazla section'da
 *   MEDIUM   Başlıkların üst boşluğu alt boşluğundan küçük/eşit (2+ başlıkta)
 *   MEDIUM   Yatay kaydırmada kenara yapışık kart
 *   MEDIUM   Opak katman altında görünmeyen veya ~0 opaklıkta görsel
 *   MEDIUM   Aynı kart/panelde 3+ kez tekrarlanan metin
 *   MEDIUM   Gövde satırı > 80 karakter; 4+ ara başlıklı sayfada gezinme yok   [content]
 *   MEDIUM   screens/ altındaki dosyada <body data-page-kind> eksik
 *
 * [marketing] / [content] kontrolleri yalnızca ilgili <body data-page-kind> değerine sahip
 * dosyalarda çalışır.
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
const HIDDEN_TEXT_RATIO = 0.2;   // kaydırma sonrası görünmez metin oranı eşiği
const MAX_LINE_CHARS = 80;       // [content] gövde satırı üst sınırı (~75ch hedef + tolerans)
const SAME_ENTRANCE_LIMIT = 2;   // aynı giriş animasyonunu kullanabilecek section sayısı

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
function inspectPage({ navMaxHeight, hiddenTextRatio, maxLineChars, sameEntranceLimit }) {
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
    if (parent.closest('[data-copy="user"]')) continue;
    const idx = node.textContent.search(DASH);
    if (idx === -1 || !isVisible(parent)) continue;
    dashCount++;
    if (dashCount <= 5) {
      findings.push({ sev: 'BLOCKER', msg: `Em/en-dash metinde: "${snippet(node.textContent, idx)}" (${describe(parent)})` });
    }
  }
  for (const el of document.querySelectorAll('[alt], [aria-label]')) {
    if (el.closest('[data-copy="user"]')) continue;
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

  }

  const topSections = [...document.querySelectorAll('section')].filter(s => !s.parentElement.closest('section'));
  const vis = el => isVisible(el) && el.getBoundingClientRect().width > 0;

  // 4. Eyebrow / kicker — başlığın hemen önündeki küçük, büyük harfli, açık aralıklı etiketler.
  //    Varsayılan olarak yasak; Bağlayıcı Kararlar istisnası [data-eyebrow-allowed] ile işaretlenir.
  const isHeading = el => el && (/^H[1-6]$/.test(el.tagName) || el.firstElementChild && /^H[1-6]$/.test(el.firstElementChild.tagName));
  const eyebrows = [];
  for (const el of document.body.querySelectorAll('*')) {
    if (el.children.length > 0 || !isVisible(el) || el.closest('[data-eyebrow-allowed]')) continue;
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
  if (eyebrows.length > 0) {
    findings.push({
      sev: 'MEDIUM',
      msg: `Başlık üstünde ${eyebrows.length} eyebrow (istisna yoksa yasak): ${eyebrows.slice(0, 5).map(e => `"${e}"`).join(', ')}`,
    });
  }

  // 5. Yasak görsel desenler — ışık halesi, ızgara / çizgili zemin, sahte imleç, nabız noktası
  const isTransparentStop = bg => /transparent|rgba\([^)]*,\s*0(\.0+)?\)/.test(bg);
  for (const el of document.body.querySelectorAll('*')) {
    if (!vis(el)) continue;
    const style = getComputedStyle(el);
    const bg = style.backgroundImage;
    const r = el.getBoundingClientRect();
    if (bg && bg !== 'none') {
      if (/radial-gradient/.test(bg) && isTransparentStop(bg) && r.width >= 300 && r.height >= 200) {
        findings.push({ sev: 'MEDIUM', msg: `Işık halesi / spotlight: kenara doğru kaybolan radial-gradient (${describe(el)})` });
      }
      const linearCount = (bg.match(/linear-gradient/g) || []).length;
      const fixedCell = /\d+px/.test(style.backgroundSize) && style.backgroundRepeat !== 'no-repeat';
      if (/repeating-linear-gradient/.test(bg) && r.width >= 200) {
        findings.push({ sev: 'MEDIUM', msg: `Dekoratif çizgili desen: repeating-linear-gradient (${describe(el)})` });
      } else if (linearCount >= 2 && fixedCell && r.width >= 300) {
        findings.push({ sev: 'MEDIUM', msg: `Dekoratif ızgara zemin: ${linearCount} linear-gradient + sabit hücre ${style.backgroundSize} — işlevsel yüzey (harita/tuval) değilse kaldır (${describe(el)})` });
      }
    }
    for (const pseudo of [null, '::after', '::before']) {
      const ps = pseudo ? getComputedStyle(el, pseudo) : style;
      if (/blink|caret|cursor/i.test(ps.animationName)) {
        findings.push({ sev: 'MEDIUM', msg: `Sahte yanıp sönen imleç: animation "${ps.animationName}" (${describe(el)}${pseudo || ''})` });
        break;
      }
    }
    const round = parseFloat(style.borderTopLeftRadius) >= Math.min(r.width, r.height) / 2;
    if (r.width <= 16 && r.height <= 16 && round && style.animationIterationCount === 'infinite'
        && style.animationName !== 'none' && !el.closest('[data-live]')) {
      findings.push({ sev: 'MEDIUM', msg: `Animasyonlu durum noktası — gerçek canlı veriye bağlı değilse durağan olmalı (${describe(el)})` });
    }
  }

  // 6. Tekrarlı giriş animasyonu — aynı animation-name / reveal sınıfı en fazla 2 section'da
  const REVEAL_CLASS = /^(reveal|fade|fade-?up|fade-?in|slide-?up|animate|aos-\S+|in-?view|appear)$/i;
  const entranceUse = new Map();
  for (const sec of topSections) {
    const keys = new Set();
    for (const el of [sec, ...sec.querySelectorAll('*')]) {
      const name = getComputedStyle(el).animationName;
      if (name && name !== 'none' && getComputedStyle(el).animationIterationCount !== 'infinite') {
        name.split(',').forEach(n => keys.add(`animation:${n.trim()}`));
      }
      for (const c of el.classList) if (REVEAL_CLASS.test(c)) keys.add(`class:${c}`);
      if (el.dataset.aos) keys.add(`data-aos:${el.dataset.aos}`);
    }
    for (const k of keys) entranceUse.set(k, (entranceUse.get(k) || 0) + 1);
  }
  for (const [key, count] of entranceUse) {
    if (count > sameEntranceLimit) {
      findings.push({ sev: 'MEDIUM', msg: `Aynı giriş animasyonu ${count} section'da (${key}) — en fazla ${sameEntranceLimit}; hareketi tek imza ana topla` });
    }
  }

  // 7. Görünmeyen içerik — kaydırma sonrası hâlâ opacity 0 / visibility hidden olan metin
  const effectiveOpacity = el => {
    let o = 1;
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) o *= parseFloat(getComputedStyle(n).opacity);
    return o;
  };
  const isSrOnly = el => {
    const r = el.getBoundingClientRect();
    return r.width <= 1 && r.height <= 1;
  };
  let totalChars = 0, hiddenChars = 0;
  const textWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (textWalker.nextNode()) {
    const node = textWalker.currentNode;
    const parent = node.parentElement;
    const len = node.textContent.trim().length;
    if (!parent || !len || ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE'].includes(parent.tagName)) continue;
    if (parent.closest('[aria-hidden="true"], dialog:not([open]), details:not([open]) > :not(summary), [hidden]')) continue;
    const cs = getComputedStyle(parent);
    if (cs.display === 'none' || parent.getClientRects().length === 0 || isSrOnly(parent)) continue;
    totalChars += len;
    if (cs.visibility === 'hidden' || effectiveOpacity(parent) < 0.05) hiddenChars += len;
  }
  if (totalChars > 0 && hiddenChars / totalChars > hiddenTextRatio) {
    findings.push({ sev: 'HIGH', msg: `Kaydırma sonrası metnin %${Math.round(hiddenChars / totalChars * 100)}'i görünmez — başarısız reveal; içerik varsayılan görünür olmalı` });
  }

  // 8. Metin örtüşmesi — metnin ortasında başka bir opak öğe var mı
  const leafTexts = [...document.body.querySelectorAll('h1, h2, h3, h4, p, li, a, button, label, td, th, span')]
    .filter(el => vis(el) && [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1))
    .slice(0, 400);
  const opaque = el => {
    const c = getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
    const alpha = c ? (c.length === 4 ? parseFloat(c[3]) : 1) : 0;
    return alpha > 0.5 || getComputedStyle(el).backgroundImage !== 'none' || el.tagName === 'IMG';
  };
  let occluded = 0;
  const occludedSamples = [];
  for (const el of leafTexts) {
    el.scrollIntoView({ block: 'center', inline: 'center' });
    const range = document.createRange();
    range.selectNodeContents(el);
    const rect = [...range.getClientRects()].find(r => r.width > 4 && r.height > 4);
    if (!rect) continue;
    const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    if (!hit || el.contains(hit) || hit.contains(el)) continue;
    const hasOwnText = [...hit.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    if (opaque(hit) || hasOwnText) {
      occluded++;
      if (occludedSamples.length < 3) occludedSamples.push(`"${el.textContent.trim().slice(0, 30)}" ← ${describe(hit)}`);
    }
  }
  window.scrollTo(0, 0);
  if (occluded > 0) {
    findings.push({ sev: 'HIGH', msg: `Metin örtüşmesi: ${occluded} metnin üstüne başka öğe binmiş — ${occludedSamples.join('; ')}` });
  }

  // 9. Kenara yapışık kart — yatay kaydırıcıda baş ve son boşluk asimetrisi
  for (const el of document.body.querySelectorAll('*')) {
    const cs = getComputedStyle(el);
    if (!/(auto|scroll)/.test(cs.overflowX) || el.scrollWidth <= el.clientWidth + 1 || el.children.length < 2) continue;
    const box = el.getBoundingClientRect();
    const first = el.firstElementChild.getBoundingClientRect();
    const startGap = first.left - box.left + el.scrollLeft;
    const prev = el.scrollLeft;
    el.scrollLeft = el.scrollWidth;
    const last = el.lastElementChild.getBoundingClientRect();
    const endGap = box.right - last.right;
    el.scrollLeft = prev;
    if ((startGap <= 1 && endGap >= 8) || (endGap <= 1 && startGap >= 8)) {
      findings.push({ sev: 'MEDIUM', msg: `Kenara yapışık kart: kaydırıcıda baş boşluk ${Math.round(startGap)}px, son boşluk ${Math.round(endGap)}px (${describe(el)})` });
    }
  }

  // 10. Başlık ritmi — başlığın üstündeki boşluk altındakinden büyük olmalı
  const tightHeadings = [];
  for (const h of document.body.querySelectorAll('h2, h3, h4')) {
    const prev = h.previousElementSibling, next = h.nextElementSibling;
    if (!vis(h) || !prev || !next || !vis(prev) || !vis(next)) continue;
    const hr = h.getBoundingClientRect();
    const above = hr.top - prev.getBoundingClientRect().bottom;
    const below = next.getBoundingClientRect().top - hr.bottom;
    if (above <= below) tightHeadings.push(`"${h.textContent.trim().slice(0, 30)}" (üst ${Math.round(above)} / alt ${Math.round(below)})`);
  }
  if (tightHeadings.length >= 2) {
    findings.push({ sev: 'MEDIUM', msg: `Başlık ritmi: ${tightHeadings.length} başlığın üst boşluğu alt boşluğundan büyük değil — ${tightHeadings.slice(0, 3).join(', ')}` });
  }

  // 11. Görünmeyen görsel — opak gradient katmanı altında veya ~0 opaklıkta raster
  const layerAlphaMin = layer => {
    const colors = layer.match(/rgba?\([^)]*\)|#[0-9a-f]{3,8}\b/gi) || [];
    if (colors.length === 0) return 0;
    return Math.min(...colors.map(c => {
      const m = c.match(/rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/);
      return m ? parseFloat(m[1]) : 1;
    }));
  };
  for (const el of document.body.querySelectorAll('*')) {
    if (!vis(el)) continue;
    const bg = getComputedStyle(el).backgroundImage;
    const isImg = el.tagName === 'IMG' || el.tagName === 'PICTURE';
    if ((isImg || /url\(/.test(bg)) && effectiveOpacity(el) < 0.1) {
      findings.push({ sev: 'MEDIUM', msg: `Görünmeyen görsel: opaklık ~0 (${describe(el)})` });
      continue;
    }
    if (!/url\(/.test(bg)) continue;
    const layers = bg.split(/,(?![^(]*\))/);
    const urlIdx = layers.findIndex(l => /url\(/.test(l));
    const covering = layers.slice(0, urlIdx).filter(l => /gradient/.test(l));
    if (covering.some(l => layerAlphaMin(l) >= 0.9)) {
      findings.push({ sev: 'MEDIUM', msg: `Görünmeyen görsel: arka plan görseli ≥ 0.9 opak gradient katmanının altında (${describe(el)})` });
    }
  }

  // 12. Tekrarlı metin — aynı kart/panelde 3+ farklı yerde aynı metin
  const containers = document.body.querySelectorAll('article, li, [class*="card"], [class*="panel"], [class*="tile"]');
  for (const box of containers) {
    if (!vis(box) || box.querySelector('article, [class*="card"]')) continue;
    const counts = new Map();
    for (const el of box.querySelectorAll('*')) {
      if (el.children.length > 0 || !vis(el)) continue;
      const t = el.textContent.replace(/\s+/g, ' ').trim().toLocaleLowerCase('tr');
      if (t.length < 2 || t.length > 40) continue;
      counts.set(t, (counts.get(t) || 0) + 1);
    }
    for (const [t, n] of counts) {
      if (n >= 3) findings.push({ sev: 'MEDIUM', msg: `Tekrarlı metin: "${t}" aynı kartta ${n} kez (${describe(box)})` });
    }
  }

  // 13. [content] — satır genişliği ve uzun sayfada gezinme
  if (pageKind === 'content') {
    let widest = null;
    for (const p of document.body.querySelectorAll('p')) {
      if (!vis(p) || p.textContent.trim().length < 120) continue;
      const probe = document.createElement('span');
      probe.textContent = '0'.repeat(20);
      probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap';
      p.appendChild(probe);
      const ch = probe.getBoundingClientRect().width / 20;
      probe.remove();
      const chars = Math.round(p.clientWidth / ch);
      if (chars > maxLineChars && (!widest || chars > widest.chars)) widest = { chars, el: p };
    }
    if (widest) {
      findings.push({ sev: 'MEDIUM', msg: `Satır genişliği ~${widest.chars} karakter > ${maxLineChars} — gövdeyi 60–75ch ile sınırla (${describe(widest.el)})` });
    }
    const h2s = [...document.body.querySelectorAll('h2')].filter(vis);
    const hasToc = document.querySelector('main nav, article nav, aside nav, [class*="toc"], [aria-label*="içindekiler" i], [aria-label*="contents" i]');
    if (h2s.length >= 4 && !hasToc) {
      findings.push({ sev: 'MEDIUM', msg: `${h2s.length} ara başlıklı uzun sayfada içindekiler / bölüm gezinmesi yok` });
    }
  }

  return { pageKind, findings };
}

// Reveal işleyicilerinin çalışması için sayfayı adım adım sonuna kadar kaydırır, sonra başa döner
async function scrollThrough(page) {
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(400);
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
    const scriptErrors = [];
    page.on('pageerror', err => scriptErrors.push(err.message.split('\n')[0]));
    await page.goto(`file://${file}`);
    await page.waitForLoadState('networkidle');
    await scrollThrough(page);

    const { pageKind, findings } = await page.evaluate(inspectPage, {
      navMaxHeight: NAV_MAX_HEIGHT,
      hiddenTextRatio: HIDDEN_TEXT_RATIO,
      maxLineChars: MAX_LINE_CHARS,
      sameEntranceLimit: SAME_ENTRANCE_LIMIT,
    });
    await page.close();

    for (const msg of scriptErrors.slice(0, 3)) {
      findings.unshift({ sev: 'HIGH', msg: `JS hatası: ${msg} — önce bunu düzelt, diğer bulgular etkilenebilir` });
    }
    if (!pageKind && file.startsWith(screenDir + sep)) {
      findings.push({ sev: 'MEDIUM', msg: '<body data-page-kind="marketing|product|content"> eksik — [marketing] / [content] kontrolleri atlandı' });
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
