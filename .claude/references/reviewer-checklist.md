# Reviewer Checklist

Design-reviewer'ın ihtiyaç duyduğunda okuduğu tam kontrol listesi.
Workflow ve çıktı formatı için `agents/design-reviewer.md`'ye bak.
Builder'ın teslim öncesi öz-kontrolü bu listenin kısaltılmış hâlidir: `references/preflight-checklist.md`.

---

## Seviye Ölçeği

Tüm bulgular dört seviyeden biriyle raporlanır:

| Seviye | Ne zaman |
|---|---|
| **Blocker** | Kullanıcı görevi tamamlayamaz, erişilebilirlik ihlali, `[Korunan]` öğe ihlali, em-dash / en-dash, div ile sahte ürün UI, metadata ihlali |
| **High** | Tutarlılık kilidi ihlali, CTA sorunları, hero ve nav kuralları |
| **Medium** | AI tells (aşağıdaki katalogdaki diğer maddeler), layout tekrarı, bento, split-header, eksik mobil düzen, 4 katı skalası |
| **Nitpick** | Çok küçük, isteğe bağlı |

## Kapsam Etiketleri

- **[her ekran]** — tüm ekran ve component'larda uygulanır
- **[marketing]** — yalnızca strategist'in `marketing` olarak etiketlediği ekranlarda uygulanır
  (HTML'de `<body data-page-kind="marketing">`, Figma'da frame description'ında `page_kind: marketing`).
  `product` ekranlarda bu maddeleri atla, "N/A — product ekran" yaz.

## Bağlam Girdileri

Kontrole başlamadan önce şunları topla:
- **Dial'lar:** VARIANCE / MOTION / DENSITY — stratejist brief'inden veya `spec.md → token_directives.dials`'tan
- **`color_scheme`:** `spec.md → token_directives` (`light` / `dark` / `both`)
- **`[Korunan]` kararlar:** `spec.md → ## Bağlayıcı Kararlar` (veya `extension-spec.md → ## Korunacaklar`)
- **`user_explicit` token'lar:** token JSON — AI tells kontrollerinde muaf

---

## HTML Modu Kontrolleri

### a. Otomatik Testler

`scripts/test/` mevcutsa sırayla çalıştır (biri başarısız olsa bile diğerlerine devam et):

```bash
cd scripts/test && npm install --silent 2>&1 | tail -1
cd scripts/test && node visual.mjs 2>&1
cd scripts/test && node accessibility.mjs 2>&1
cd scripts/test && node tokens.mjs 2>&1
cd scripts/test && node tells.mjs 2>&1
```

`tells.mjs` em/en-dash, CTA satır kayması, nav yüksekliği ve eyebrow sayısını mekanik olarak ölçer;
bulgularını aşağıdaki ilgili bölümlerde kendi seviyesiyle raporla.

`scripts/test/` yoksa veya `npm install` başarısız olursa kaynak analiziyle devam et — bunu açıkça belirt.

### b. Spec Uyumu

- Her component brief'in kapsam listesinde var mı?
- Eksik state var mı? (boş, hata, yükleniyor — brief'te geçiyorsa kontrol et)

### c. Token Uyumu

Token JSON mevcutsa:
- CSS custom property değerleri token değerleriyle eşleşiyor mu?
- Yaklaştırma yapılmış değer var mı? (örn. `#1A1B1C` yerine `#000` kullanılmış)
- **4 katı skalası:** Spacing, border-radius ve font-size değerleri 4'ün katı mı?
  (4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 64…) — `user_explicit` token'lar muaf,
  diğerleri 4 katı değilse **Medium** bulgu olarak raporla

### d. Erişilebilirlik

- spec.md'deki erişilebilirlik gereksinimi karşılanıyor mu? (varsayılan: WCAG AA)
- **Kontrast oranı (WCAG AA zorunlu):**
  - Normal metin (< 18px normal veya < 14px bold) → ≥ 4.5:1
  - Büyük metin (≥ 18px normal veya ≥ 14px bold) → ≥ 3:1
  - UI bileşen kenarlıkları / ikonlar → ≥ 3:1
  - Token JSON varsa ön plan ve arka plan renk token değerlerinden hesapla; yoksa CSS'ten oku
- **Minimum font-size:**
  - Body / label metinleri ≥ 14px (önerilen ≥ 16px)
  - Caption / yardımcı metin ≥ 12px — 12px altı Blocker
  - Değer `em`/`rem` ise tarayıcı varsayılanı 16px üzerinden px karşılığını hesapla

### e. Animasyon

- Yalnızca `transform` / `opacity` kullanılmış mı?
- Statik elemanlarda gereksiz transition var mı?
- `prefers-reduced-motion` guard eklenmiş mi?
- `window.addEventListener('scroll', …)` kullanılmış mı? → **Medium** (IntersectionObserver veya CSS scroll-driven animation kullanılmalı)

### f. Responsive

`scripts/test/` mevcutsa:

```bash
cd scripts/test && node responsive.mjs 2>&1
```

- [ ] `responsive.mjs` çalıştı ve tüm kontroller geçti mi?

`scripts/test/` yoksa veya `npm install` başarısızsa: "responsive.mjs çalıştırılamadı, manuel doğrulama gerekiyor" notu ekle — bu kontrol atlanır.

---

### g. Metadata Kontrolü

Her HTML dosyasının `<head>` bölümünde:

- [ ] `<!-- Designed by: adesso Turkey -->` yorumu mevcut mu? → yoksa **Blocker**
- [ ] `<meta name="author" content="adesso Turkey">` etiketi mevcut mu? → yoksa **Blocker**
- [ ] `generator`, `ai`, `claude`, `artificial intelligence` içeren `<meta>` etiketi var mı? → varsa **Blocker**
- [ ] Yapay zeka kökenini ima eden HTML yorumu var mı? (`<!-- AI generated -->`, `<!-- Claude -->` vb.) → varsa **Blocker**
- [ ] `data-ai`, `data-generated`, `data-claude` gibi özel veri özelliği var mı? → varsa **Blocker**
- [ ] Ekran dosyalarında `<body data-page-kind="marketing|product">` mevcut mu? → yoksa **Medium**
  (landing kuralları uygulanamaz — ekranı stratejist kapsamından eşleştirip devam et)

---

### h. AI Tells Kontrolü [her ekran]

Token JSON'dan `"source": "user_explicit"` olan token'ları oku — bu token'lara
karşılık gelen değerler aşağıdaki kontrollerde atlanır.

Geri kalan (`ai_inferred` ve `reference_derived`) çıktıda, sayfanın tamamında
(başlık, eyebrow, pill, gövde metni, alıntı, atıf, caption, buton, `alt`, `aria-label`) kontrol et:

- [ ] Em-dash (`—`) veya ayraç olarak en-dash (`–`) var mı? → **Blocker**
  (aralıklar dahil: `2018-2026`, `₺40-80` tire ile yazılır)
- [ ] Div-based fake screenshot / sahte ürün UI (div'lerden görev listesi, terminal, dashboard) var mı? → **Blocker**
- [ ] `Inter` font `user_explicit` olmadan kullanılmış mı? → **Medium**
- [ ] 3 eşit genişlikte yan yana feature card var mı? → **Medium**
- [ ] Beige+brass+espresso renk ailesi (`#f5f1ea` / `#b08947` / `#1a1714` tonları)
  `user_explicit` olmadan premium-consumer brief'te kullanılmış mı? → **Medium**
- [ ] Placeholder isim (`John Doe`, `Acme Corp` vb.) var mı? → **Medium**
- [ ] Pure `#000000` veya `#ffffff` kullanılmış mı? → **Medium**
- [ ] Katalogdaki "Süs ve Meta Metinler" maddelerinden biri var mı? → **Medium** (her biri ayrı bulgu)

Token JSON yoksa bu kontrol kaynak analizi üzerinden yapılır. Yapılamayan kontrolleri
"Token JSON sağlanmadı, manuel doğrulama gerekiyor" notu ile işaretle.

---

### i. Tutarlılık Kilitleri [her ekran]

- [ ] **Accent kilidi:** Tek bir accent rengi tüm ekranlarda aynı şekilde kullanılıyor mu?
  Bir section'da beliren farklı accent (örn. gri-turuncu sitede mavi CTA) → **High**
- [ ] **Radius kilidi:** Tek bir köşe yuvarlama sistemi mi var (hepsi keskin / hepsi yumuşak /
  etkileşimli öğeler pill)? Karışık sistem ancak belgelenmiş bir kuralla mümkün
  ("butonlar pill, kartlar 16, input'lar 8") ve kural her yerde uygulanmalı → ihlal **High**
- [ ] **Aynı amaçlı çift CTA:** Aynı niyete iki farklı etiket ("Bize ulaşın" + "Konuşalım",
  "Ücretsiz dene" + "Hemen başla") → **High**. Her niyet için tek etiket, nav/hero/footer'da aynı.
- [ ] **CTA satır kayması:** Desktop'ta (1280px) bir CTA etiketi iki satıra kayıyor mu? → **High**
  (birincil CTA'lar en fazla 3 kelime)
- [ ] **Buton ve form kontrastı:** Her CTA metni, input, placeholder, focus ring, helper ve hata metni
  bulunduğu section arka planına karşı WCAG AA geçiyor mu? Fotoğraf üstündeki ghost butonlarda
  scrim/stroke var mı? → ihlal **Blocker** (erişilebilirlik)

### j. Layout Disiplini [marketing]

- [ ] **Hero:** başlık desktop'ta ≤ 2 satır; alt metin ≤ 20 kelime ve ≤ 4 satır; toplam ≤ 4 metin öğesi
  (eyebrow *veya* marka şeridi, başlık, alt metin, CTA'lar); CTA ilk görünümde (scroll'suz);
  üst padding ≤ 96px → ihlal **High**
- [ ] **Hero'da yasak:** CTA altında küçük tagline, güven mikro-şeridi, fiyat teaser'ı, madde listesi,
  avatar sırası → **High**
- [ ] **VARIANCE > 4** iken ortalanmış hero → **Medium** (editorial / manifesto brief'leri hariç)
- [ ] **Logo wall** hero'nun altında ayrı bir section mı, gerçek logolar mı (düz metin wordmark değil)? → ihlal **Medium**
- [ ] **Nav:** desktop'ta tek satır ve yükseklik ≤ 80px → ihlal **High**
- [ ] **Eyebrow sayısı** ≤ `ceil(section sayısı / 3)` (hero 1 sayılır) → aşım **Medium**
- [ ] **Layout ailesi çeşitliliği:** aynı layout ailesi sayfada bir kez; 8 section'da en az 4 farklı aile → ihlal **Medium**
- [ ] **Zigzag:** art arda en fazla 2 görsel+metin split section → 3. tekrar **Medium**
- [ ] **Bento:** hücre sayısı = içerik sayısı (boş hücre yok); en az 2 hücrede görsel çeşitlilik
  (görsel, desen, ton farkı — hepsi aynı zeminde düz metin değil) → ihlal **Medium**
- [ ] **Split-header:** "solda büyük başlık + sağda küçük açıklama paragrafı" section başlığı → **Medium**
  (sağ kolon gerçek bir görsel/etkileşim taşıyorsa geçerli)

### k. Mobil Düzen [her ekran]

- [ ] Her çok kolonlu section'ın 375px düzeni CSS'te açıkça tanımlı mı (kolonların nasıl
  yığıldığı belli mi)? "Kendiliğinden sarar" varsayımı → **Medium**

### l. Dark Mode [`color_scheme: both` veya `dark`]

`color_scheme: light` ise bu bölümü atla ("N/A — yalnızca açık tema").

- [ ] Koyu tema token blokları mevcut mu (`[data-theme="dark"]` ve
  `@media (prefers-color-scheme: dark)`)? `both` ise yoksa → **High**
- [ ] Kontrast kontrolleri (d ve i) **her iki temada** ayrı ayrı yapıldı mı? Koyu temada ihlal → **Blocker**
- [ ] Koyu temada hiyerarşi korunuyor mu (birincil/ikincil metin ve yüzey farkları seçilebiliyor mu)? → ihlal **High**
- [ ] Koyu tema renkleri token'a bağlı mı (koyu tema için hardcode değer yok)? → ihlal **Medium**
- [ ] Sayfa ortasında tek bir section'ın ters temaya geçmesi var mı? → **Medium**

### m. Redesign Koruma [her ekran]

`spec.md → ## Bağlayıcı Kararlar` içindeki her `[Korunan]` maddeyi çıktıyla karşılaştır:

- [ ] URL / dosya slug'ları, nav etiketleri, form alanı adları ve sırası, logo/wordmark,
  yasal/KVKK/çerez metinleri, analytics'e bağlı ID ve `data-*` özellikleri değişmemiş mi? → ihlal **Blocker**
- [ ] Mevcut erişilebilirlik kazanımları (focus state, alt metin, klavye navigasyonu) gerilememiş mi? → ihlal **Blocker**

`[Korunan]` madde yoksa bu bölümü atla.

### n. Motion Uyumu [her ekran]

Stratejist brief'indeki MOTION değerini kullan:

| MOTION | Beklenen |
|---|---|
| 1-3 | Yalnızca durum geçişleri (hover, focus, açılma/kapanma). Giriş/scroll animasyonu varsa → **Medium** |
| 4-6 | Durum geçişleri + hover + yumuşak giriş animasyonları. Scroll'a bağlı anlatım varsa → **Medium** |
| 7-10 | Scroll ile açılan / scroll'a bağlı bölümler bekleniyor. Hiç hareket yoksa ("iddia edilen ama gösterilmeyen motion") → **Medium** |

- [ ] MOTION > 3 ise her animasyon `prefers-reduced-motion: reduce` altında kapatılıyor/sadeleşiyor mu? → yoksa **High**
- [ ] Her animasyon tek cümleyle gerekçelendirilebiliyor mu (hiyerarşi, geri bildirim, durum geçişi, anlatım)? Süs amaçlı sonsuz döngüler → **Medium**

---

## Figma Modu Kontrolleri

### a. Frame İçeriğini Oku

`get_design_context` ve `get_screenshot` ile her frame'i incele.
Frame description'larından `page_kind` değerini oku.

### b. Spec Uyumu

- Kapsam listesindeki her component / ekran mevcut mu?
- Eksik state var mı?

### c. Token Uyumu

Token JSON mevcutsa:
- Renk, tipografi ve boşluk değerleri token'larla eşleşiyor mu?
- Serbest değer (token'a bağlı olmayan renk, font boyutu vb.) kullanılmış mı?
- **4 katı skalası:** Spacing, corner radius ve font size değerleri 4'ün katı mı?
  (4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 64…) — `user_explicit` token'lar muaf,
  diğerleri 4 katı değilse **Medium** bulgu olarak raporla

### d. Erişilebilirlik

- **Kontrast oranı (WCAG AA zorunlu):**
  - Normal metin (< 18px normal veya < 14px bold) → ≥ 4.5:1
  - Büyük metin (≥ 18px normal veya ≥ 14px bold) → ≥ 3:1
  - UI bileşen kenarlıkları / ikonlar → ≥ 3:1
  - `get_design_context` çıktısından fill renklerini oku; token JSON varsa değerleri oradan hesapla
- **Minimum font-size:**
  - Body / label metinleri ≥ 14 (Figma px birimi)
  - Caption / yardımcı metin ≥ 12 — 12 altı Blocker

### e. Metadata Kontrolü

`get_design_context` çıktısında:

- [ ] Herhangi bir frame veya component'ın `description` alanında "Designed by: adesso Turkey" yazıyor mu? → yoksa **Blocker** — design-builder'ın bunu eklemiş olması gerekir
- [ ] Herhangi bir `description` alanında `AI`, `Claude`, `generated` gibi yapay zeka iması var mı? → varsa **Blocker**
- [ ] Ekran frame'lerinin description'ında `page_kind: marketing|product` satırı var mı? → yoksa **Medium**

---

### f. AI Tells Kontrolü [her ekran]

Token JSON'dan `"source": "user_explicit"` olan token'ları oku — bu token'lara
karşılık gelen değerler aşağıdaki kontrollerde atlanır.

`get_design_context` ve `get_screenshot` çıktısı üzerinden kontrol et:

- [ ] Em-dash (`—`) veya ayraç olarak en-dash (`–`) herhangi bir text layer'da var mı? → **Blocker**
- [ ] Sahte ürün UI (dikdörtgenlerden yapılmış görev listesi / dashboard / terminal) var mı? → **Blocker**
- [ ] `Inter` font `user_explicit` olmadan kullanılmış mı? → **Medium**
- [ ] 3 eşit genişlikte yan yana feature card var mı? → **Medium**
- [ ] Beige+brass+espresso renk ailesi `user_explicit` olmadan
  premium-consumer brief'te kullanılmış mı? → **Medium**
- [ ] Placeholder isim (`John Doe`, `Acme Corp` vb.) bir text layer'da var mı? → **Medium**
- [ ] Pure `#000000` veya `#ffffff` fill kullanılmış mı? → **Medium**
- [ ] Katalogdaki "Süs ve Meta Metinler" maddelerinden biri var mı? → **Medium**

### g. Tutarlılık Kilitleri [her ekran]

HTML bölüm **i** ile aynı kurallar; frame'ler ve text layer'lar üzerinden değerlendir
(CTA satır kayması: 1280 genişlikteki frame'de buton metni tek satır mı).

### h. Layout Disiplini [marketing]

HTML bölüm **j** ile aynı kurallar; 1280 (veya en yakın desktop) genişlikteki ekran frame'leri üzerinden.

### i. Dark Mode [`color_scheme: both` veya `dark`]

- [ ] `Color` variable koleksiyonunda `Light` ve `Dark` modları var mı? `both` ise yoksa → **High**
- [ ] Ekranların fill'leri variable'a bağlı mı (mod değişince renk değişiyor mu)? Bağlı olmayan fill → **Medium**
- [ ] Kontrast her iki modda geçiyor mu? Koyu modda ihlal → **Blocker**

### j. Redesign Koruma [her ekran]

HTML bölüm **m** ile aynı kurallar; nav etiketleri, form alanları, logo ve yasal metinler text layer'lardan okunur.

### k. Mobil Düzen [her ekran]

- [ ] Kapsamdaki her ekranın mobil (375) frame'i var mı veya auto-layout ile mobilde nasıl yığıldığı tanımlı mı? → yoksa **Medium**

---

## AI Tells — Yasak Desenler Kataloğu

Design-builder tarafından da referans alınır. Reviewer bu listeye göre HTML **h** / Figma **f** kontrolünü yapar.
Seviyeler yukarıdaki ölçeğe göredir; işaretlenmemiş maddeler **Medium**.

### Layout

| Yasak | Alternatif |
|---|---|
| 3 eşit sütun feature card | 2-kolon zig-zag, asimetrik grid, yatay scroll, bento |
| Her section'a eyebrow [marketing] | Max ceil(section / 3); çoğu section başlığı eyebrow gerektirmez |
| Zigzag image+text 3+ tekrar [marketing] | 3. tekrarda farklı layout ailesi kullan |
| Her brief için centered hero [marketing] | VARIANCE > 4 ise split screen, sola yaslı veya asimetrik; editorial/manifesto'da centered geçerli |
| Uzun listelerde her satıra `border-top` + `border-bottom` | Tek yönlü ayraç veya farklı bir liste component'i |
| Dolu arka plan izli skor/progress bar'ları karşılaştırma görseli olarak [marketing] | Sayı + küçük ikon veya izsiz ince bar |

### İçerik

| Yasak | Alternatif |
|---|---|
| Em-dash (`—`) — **Blocker** | Virgül, nokta, iki nokta, parantez veya iki ayrı cümle |
| Ayraç olarak en-dash (`–`) — **Blocker** | Normal tire (`-`); aralıklar `2018-2026` |
| "John Doe", "Acme Corp" | Brief'e uygun, gerçekçi isimler |
| "Elevate", "Seamless", "Unleash", "Next-Gen", "Revolutionize" | Somut, işlevsel kelimeler |
| `99.99%`, `50%`, `1,234,567` | Organik değerler (`47.2%`, `1,381`) veya sayıyı kaldır |
| Scroll cue ("↓ scroll", "Keşfetmek için kaydır", animasyonlu fare ikonu) | Yok — kullanıcı scroll'u bilir |
| Genel adım etiketleri ("Step 1 / Step 2", "Adım 1", "Phase 01", "Aşama 1") | Adımın kendisi etiket olur: "Kur", "Ayarla", "Yayınla" |

### Süs ve Meta Metinler

| Yasak | Alternatif |
|---|---|
| Hero'da versiyon etiketi (`V0.6`, `BETA`, `INVITE-ONLY PREVIEW`, `EARLY ACCESS`) | Kaldır — yalnızca brief gerçekten bir lansman/önizleme ise |
| Numaralı section eyebrow'ları (`00 / INDEX`, `001 · Capabilities`, `06 · how it works`) | Konuyu düz dille adlandır veya eyebrow'u kaldır |
| Görsel/bento üzerinde `01 / 4` tarzı sayfalama | Kaldır |
| `·` ayracının her yerde kullanılması ("foo · bar · baz · qux") | Satır başına en fazla 1 `·`; satır sonu, ince çizgi veya kolon |
| Süs amaçlı renkli durum noktaları (her nav öğesi, liste satırı, badge önünde) | Yalnızca gerçek durum bilgisi (canlı sunucu durumu vb.), section başına en fazla 1 |
| Görsel üstüne bindirilmiş pill/etiketler (`Brand · 02`, `PLATE · BRAND`) | Görseli yalnız bırak veya görselin altına tek satır işlevsel caption |
| Süs amaçlı fotoğraf kredileri (`Field study no. 12 · Ines Caetano`) | Yalnızca gerçek fotoğrafçıya gerçek atıf; yoksa kaldır |
| Şehir / saat / hava durumu şeritleri (`İstanbul 14:23 · 18°C`) | Kaldır — yalnızca dağıtık stüdyo, seyahat veya fiziksel mekân brief'lerinde |
| Eyebrow/başlık altında mikro açıklama cümleleri ("Bunların her biri bugün sunduğumuz bir özellik, yol haritası vaadi değil.") | Eyebrow + başlık + gövde yeterli; cümleyi kaldır |
| Hero altında dekoratif metin şeridi (`MARKA. HAREKET. MEKÂN.`) | Kaldır — gerçek link/durum taşımıyorsa |
| Pazarlama sayfasında versiyon footer'ı (`v1.4.2`, `Build 0048`) | Kaldır |
| Section başlığında sağ üst köşede yüzen küçük açıklama metni | Metni başlığın altına al veya hizalı 2 kolonlu başlık kur |
| "Quietly trusted by", "From the field", "Field notes" gibi şiirsel etiketler | "Müşterilerimiz", "Son yazılar" gibi işlevsel etiket veya etiketsiz |
| Gerçek veri olmadan "800'den 412. rezervasyon" tarzı sayaçlar | Kaldır |

### Görsel

| Yasak | Alternatif |
|---|---|
| Div-based fake screenshot / sahte ürün UI — **Blocker** | Gerçek component, gerçek görsel veya açık placeholder |
| Hand-rolled SVG icon | Phosphor, HugeIcons, Radix, Tabler |
| Elle çizilmiş süs SVG'leri (varsayılan olarak) | Gerçek görsel, `https://picsum.photos/seed/{açıklayıcı-kelime}/{w}/{h}` veya açık placeholder alanı |
| Emoji as icon (🔔 ✅ ❌ 🏠 vb.) | Gerçek ikon kütüphanesi — aksi spec'te belirtilmedikçe yasak |
| Inter + slate-900 + AI-purple gradient stack'i | Brief'ten türetilmiş font + renk seçimi |
| Pure `#000000` / `#ffffff` | Off-black (`#111111`) / off-white (`#fafafa`) |

### Font Yasakları (ai_inferred token'larda)

- `Inter` — varsayılan olarak yasak. Yerine: `Geist`, `Satoshi`, `Cabinet Grotesk`, `Outfit`
- `Fraunces`, `Instrument_Serif` — LLM'in en yaygın serif default'ları

### Renk Yasakları (ai_inferred token'larda)

Her brief'te:
- Pure `#000000` → `#111111` veya `zinc-950`
- Pure `#ffffff` → `#fafafa` veya `#f8f8f8`

Premium-consumer brief'lerde (cookware, wellness, artisan, luxury) ek olarak:
- Background: `#f5f1ea`, `#fbf8f1`, `#faf7f1`, `#ece6db`, `#efeae0` ailesi (warm cream/bone)
- Accent: `#b08947`, `#b6553a`, `#9a2436`, `#9c6e2a`, `#bc7c3a` ailesi (brass/clay/oxblood)
- Varsayılan AI-purple: `#7c3aed`, `#8b5cf6`, `#a855f7` — brief açıkça istemiyorsa yasak

**Override:** Token JSON'da `"source": "user_explicit"` olan değerler bu listeden muaftır.
