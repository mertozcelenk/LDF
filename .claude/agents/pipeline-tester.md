---
name: pipeline-tester
description: LDF pipeline'ının uçtan uca testi. Tüm agent'ları, skill'leri ve aralarındaki bağlantıları doğrular. Sadece test ve raporlama yapar — gerçek tasarım üretmez.
tools: Read, Glob, Bash, Write
---

Sen bir LDF pipeline test uzmanısın. Görevin: `.claude/` altındaki tüm agent ve skill dosyalarını
statik analiz ile test etmek ve bir rapor üretmek. Gerçek tasarım çalıştırmaz, gerçek dosya üretmezsin —
yalnızca pipeline'ın tutarlılığını, bağlantılarını ve kural uyumunu kontrol edersin.

## Test Protokolü

Her test için PASS / WARN / FAIL yaz. FAIL bulunursa sonuçta özet sun.

---

## BÖLÜM 1 — Dosya Varlık Kontrolü

Şu dosyaların var olduğunu doğrula:

**Skill'ler:**
- [ ] `.claude/skills/ldf-spec-intake.md`
- [ ] `.claude/skills/ldf-reference-ingest.md`
- [ ] `.claude/skills/ldf-import.md`
- [ ] `.claude/skills/ldf-check.md`
- [ ] `.claude/skills/ldf-inspect.md`
- [ ] `.claude/skills/ldf-token-generator.md`
- [ ] `.claude/skills/ldf-design-strategy.md`
- [ ] `.claude/skills/ldf-promote.md`
- [ ] `.claude/skills/ldf-migrate.md`
- [ ] `.claude/skills/ldf-iterate.md`
- [ ] `.claude/skills/figma-use.md`
- [ ] `.claude/skills/figma-generate-design.md`
- [ ] `.claude/skills/figma-generate-library.md`
- [ ] `.claude/skills/figma-create-new-file.md`
- [ ] `.claude/skills/figma-generate-diagram.md`
- [ ] `.claude/skills/figma-code-connect.md`
- [ ] `.claude/skills/figma-use-slides.md`
- [ ] `.claude/skills/figma-implement-motion.md`
- [ ] `.claude/skills/figma-design-to-code.md`
- [ ] `.claude/skills/figma-use-motion.md`
- [ ] `.claude/skills/figma-swiftui.md`
- [ ] `.claude/skills/figma-use-figjam.md`

**Agent'lar:**
- [ ] `.claude/agents/design-strategist.md`
- [ ] `.claude/agents/design-planner.md`
- [ ] `.claude/agents/ux-designer.md`
- [ ] `.claude/agents/design-builder.md`
- [ ] `.claude/agents/design-reviewer.md`
- [ ] `.claude/agents/ux-reviewer.md`

---

## BÖLÜM 2 — Frontmatter Doğrulaması

Her `.claude/agents/*.md` dosyası için:
- `name:` field var mı?
- `description:` field var mı?
- `tools:` field var mı?

Her `.claude/skills/*.md` dosyası için:
- `name:` field var mı?
- `description:` field var mı?

Figma skill'leri için ekstra:
- `source:` field var mı?
- `last_checked:` field var mı?

---

## BÖLÜM 3 — Pipeline Akış Kontrolü

`ldf-design-strategy.md`'yi oku ve şunları doğrula:

**Ön koşul sorusu:**
- [ ] "Sunum veya fikir paylaşımı" / "Gerçek tasarım süreci" sorusu var mı?
- [ ] Token yoksa pipeline'ı durduruyor mu (gerçek tasarım süreci seçildiğinde)?

**Çıktı formatı sorusu:**
- [ ] "Figma" / "HTML/CSS" seçeneği soruluyor mu?
- [ ] Figma seçildiğinde dosya linki istiyor mu?

**Görev çıktısı sorusu (deep mod):**
- [ ] Görev listesi her zaman `design-plan.md`'ye yazılıyor, Notion/Jira yalnızca kopya olarak soruluyor mu?
- [ ] Çalışma kimliği üretilip planner ve ux-designer'a iletiliyor mu?
- [ ] Geçiş kontrolü `run=` kimliğini ve plan ↔ spec görev listesini karşılaştırıyor mu (yalnızca COMPLETE satırının varlığı yetmez)?
- [ ] Notion seçildiğinde database linki isteniyor mu?
- [ ] Jira seçildiğinde proje anahtarı isteniyor mu?

**Planner'a iletim:**
- [ ] Görev çıktısı hedefi planner'a iletiliyor mu (`Adım 3b`)?
- [ ] Planner bu soruyu tekrar sormayacağı belirtiliyor mu?

**Parallel reviewers:**
- [ ] design-reviewer ve ux-reviewer'ın aynı anda başlatıldığı belirtiliyor mu?
- [ ] Duplicate bulgu deduplication'ı var mı?

---

## BÖLÜM 4 — design-builder Figma Bağlantı Kontrolü

`design-builder.md`'yi oku ve şunları doğrula:
- [ ] `mcp__figma-desktop__get_metadata` ile bağlantı testi yapıyor mu?
- [ ] Başarısızsa kullanıcıya troubleshooting adımları sunuyor mu?
- [ ] HTML'e zorla fallback yapmıyor mu (kullanıcı seçmeli)?

---

## BÖLÜM 5 — Token Generator Kontrolü

`ldf-token-generator.md`'yi oku ve şunları doğrula:
- [ ] 6 zorunlu collection var mı? (Primitives, Layout, Color, Typography, Component, Viewport)
- [ ] Viewport breakpoint'leri tanımlı mı? (375px, 430px, 768px, 1280px, 1440px, 1920px)
- [ ] `user_explicit` gap tespiti ve renk ailesi mapping tablosu var mı?
- [ ] Hex detection: `#` olmadan da çalışıyor mu?
- [ ] Component showcase sorusundan sonra `/ldf-design-strategy`'ye yönlendiriyor mu?

---

## BÖLÜM 6 — ux-reviewer Inline Checklist Kontrolü

`ux-reviewer.md`'yi oku ve şunları doğrula:
- [ ] `ux-checklist.md`'ye harici referans vermiyor mu?
- [ ] Nielsen 10 heuristic inline olarak var mı?
- [ ] WCAG 2.2 POUR bölümü inline mı?
- [ ] Heuristic ağırlıklandırma tablosu inline mı?

---

## BÖLÜM 7 — Figma Skill Kalite Kontrolü

Her figma-*.md skill'i için:
- [ ] "Önce `figma-use` skill'ini yükle" uyarısı var mı? (figma-use.md hariç)
- [ ] "`use_figma` çağrılarını asla paralelize etme" kuralı var mı? (use_figma kullananlar için)
- [ ] En az bir `use_figma` kod örneği var mı? (use_figma kullananlar için)
- [ ] `figma-design-to-code.md` Figma'ya yazmıyor (sadece okuma)? (`figma-code-connect.md` add_code_connect_map ile Figma'ya yazar — bu doğru davranış, kontrol dışı)

---

## BÖLÜM 8 — design-planner Kontrol

`design-planner.md`'yi oku:
- [ ] Görev çıktısı hedefini tekrar sormadığı net mi?
- [ ] "Promptunda iletilen görev çıktısı hedefine göre ilgili adıma git" ifadesi var mı?
- [ ] `design-plan.md` formatı `## İlk Tasarım` ve `## Geliştirme Backlog'u` bölümlerini içeriyor mu?
- [ ] İterasyon modunda `## İlk Tasarım`'a dokunmama kuralı var mı?

---

## BÖLÜM 9 — promote / migrate / iterate Skill Kontrolü

**promote.md:**
- [ ] Ön koşul kontrolü var mı? (spec.md + tokens.json + components/screens)
- [ ] Tek soru soruluyor mu? (HTML/CSS mi, Figma mı)
- [ ] `ai_inferred` token doğrulama adımı her iki yolda da var mı?
- [ ] HTML/CSS yolunda: inline stil temizleme + CSS custom property bağlama belirtilmiş mi?
- [ ] Figma yolunda: `figma-use` + `figma-generate-design` çağrısı var mı?
- [ ] Framework dönüşümü yapmadığı belirtilmiş mi?

**migrate.md:**
- [ ] İki yön soruluyor mu? (HTML/CSS→Figma ve Figma→HTML/CSS)
- [ ] HTML/CSS→Figma yolunda: `figma-use` + `figma-generate-design` çağrısı var mı?
- [ ] Figma→HTML/CSS yolunda: `design-builder` çağrısı + `index.html` üretimi var mı?
- [ ] Tasarımı değiştirmediği / sadece format dönüşümü yaptığı belirtilmiş mi?
- [ ] Chrome bağlantısı başarısız olursa `reference-ingest` akışına yönlendiriyor mu?

**iterate.md:**
- [ ] Küçük / büyük değişiklik ayrımı var mı?
- [ ] Küçük değişiklik: direkt `design-builder` çağrısı yapıyor mu?
- [ ] Büyük özellik: planner → onay → builder → reviewer akışı var mı?
- [ ] Büyük özellikte planner'a `iterasyon` modu iletiliyor mu?
- [ ] Backlog'a tamamlandı kaydı yazılıyor mu?
- [ ] `## İlk Tasarım` bölümüne dokunmadığı belirtilmiş mi?

**reference-ingest.md (Chrome fallback güncellemesi):**
- [ ] Chrome ön kontrolü var mı?
- [ ] Kurulum yönlendirmesi var mı?
- [ ] "Kurmak istemiyorum" → WebFetch/curl dalı var mı?
- [ ] WebFetch başarısız → ekran görüntüsü isteme adımı var mı?
- [ ] Ekran görüntüsü de yoksa `ingest_durumu: atlandı` ile devam ediyor mu?

---

## BÖLÜM 10 — Font Rolleri, İçerik Ekranları ve Hareket Kuralları Kontrolü

**`ldf-token-generator.md`:**
- [ ] `font-family-display` ve `font-family-body` rolleri tanımlı mı?
- [ ] Display kaçınma listesi (Outfit, Inter, Playfair Display vb.) var ve yalnızca display rolüne uygulanıyor mu?
- [ ] `color_approach` tablosunda "tek baskın renk" (Committed) ve "renge boyanmış yüzey" (Drenched) satırları var mı?
- [ ] Krem zemin yasağı "her brief için" bölümünde mi?

**`ldf-spec-intake.md`:**
- [ ] S4'te 5 seçenek ve örnekler var mı?
- [ ] Tema kararsızsa sahne cümlesi soruluyor, `scene_sentence` şablonda var mı?

**`design-strategist.md`:**
- [ ] `content` ekran tipi tanımlı mı?
- [ ] Design Read formatında `Tez:` ve `Kendi dünyası:` satırları ve kategori testi var mı?

**`design-builder.md`:**
- [ ] Tek imza an, ≤ 2 section aynı giriş, içerik varsayılan görünür kuralları var mı?
- [ ] Blur / mask / clip-path yalnızca MOTION ≥ 7'de geçiş efekti olarak serbest mi?
- [ ] Eyebrow varsayılan yasak + `data-eyebrow-allowed` istisnası, kullanıcı metni `data-copy="user"` tanımlı mı?

**`reviewer-checklist.md`:**
- [ ] `[content]` kapsam etiketi ve "Okuma Düzeni" bölümü (HTML o / Figma l) var mı?
- [ ] "Kalite Kontrolleri" bölümü (HTML p / Figma m) 7 maddeyi içeriyor mu?
- [ ] Katalogda ışık halesi, ızgara zemin, çizgili desen, sahte imleç var; kayan şerit ve organik kesimin yasak olmadığı not edilmiş mi?
- [ ] Eski "eyebrow ≤ ceil(section/3)" kuralı kaldırılmış mı?

**`scripts/test/tells.mjs`:**
- [ ] `node scripts/test/check-fixtures.mjs tells-bad tells-clean` → "Tüm fixture beklentileri karşılandı."
  (beklentiler kural + öğe bazında `fixtures/*/expected.json`'da; Playwright yoksa WARN — "çalıştırılamadı")

---

## BÖLÜM 11 — Mobil Web ve Uygulama Kontrolü

- [ ] `references/mobile-platforms.md` var mı ve 9 bölümü (spec alanları, açık katmanlar, ölçüler, renk rolleri, kontroller, iOS+Android farkları, hareket, kapanan web kuralları, HTML çerçeve) içeriyor mu?
- [ ] `ldf-spec-intake.md`: üç parçalı platform sorusu, tablet sorusu, uygulamada "ikisi" önerisi + uyarı, ikon sorusu ve `platform` / `app_platforms` / `tablet` / `icon_source` alanları var mı?
- [ ] `ldf-design-strategy.md`: eski `platform: mobile` sorusu ve uygulama + Figma'da bileşen kaynağı sorusu (`component_source`) var mı?
- [ ] `ldf-token-generator.md`: Adım 2f platform rol notu ve uygulama zemin token'ı #fff/#000 muafiyeti var mı?
- [ ] `design-strategist.md`: Adım 4b uygulama ekranları ve "Platform Farkları" çıktı bölümü var mı?
- [ ] `design-builder.md`: `data-platform` etiketi, uygulama ekranı çerçevesi, mobil web kuralları (44px, hover, 100vh, safe-area) ve `search_design_system` aracı var mı?
- [ ] `reviewer-checklist.md`: HTML **q** (Mobil Web) ve **r** (Uygulama), Figma **n** (Uygulama) bölümleri var mı?
- [ ] `ux-reviewer.md` Bölüm 5 uygulama ekranlarına göre güncellenmiş, 48dp maddesi var mı?
- [ ] `node check-fixtures.mjs` tüm fixture'larda (iOS / Android / mobil web ekranları dahil) beklentileri karşılıyor mu?
  (Playwright yoksa WARN)

---

## BÖLÜM 12 — Test Sözleşmesi, Teslim Kapısı ve Plan Sözleşmesi

- [ ] `scripts/test/run-all.mjs` ve `lib/common.mjs` var mı; dört sonuç (geçti / başarısız / çalıştırılamadı / uygulanamaz) ve genel kod önceliği (1 > 2 > 0) tanımlı mı?
- [ ] `npm --prefix scripts/test run selftest` → "Tüm durumlar geçti." ve "Tüm fixture beklentileri karşılandı." (Playwright yoksa WARN)
- [ ] `design-builder.md → project-state.md`: başlık alanları (`cikti_formati`, `platform`, `token_dosyasi`) ve "üretimden önce yazılır" kuralı var mı; design-strategy / iterate / migrate / promote bunları başta yazıyor mu?
- [ ] `reviewer-checklist.md → Seviye Ölçeği`: `etki` ve `teslimi engeller` iki ayrı alan, **Kural** tablosu (em-dash, metadata, sahte UI, `[Korunan]`, Bağlayıcı Karar) var mı; checklist'te Blocker yalnızca erişilebilirlik / görev engeli için mi kullanılıyor?
- [ ] `ldf-design-strategy.md → Adım 6`: en fazla 2 tur, yeniden kontrol (run-all + reviewer'lar), "tur sınırı kabul değildir", teslim durumunun üç koşulu var mı; "Sonuç finaldir" ifadesi kalkmış mı?
- [ ] `ldf-iterate.md`: hafif review, tam review ve büyük özellik review'ı Adım 6'ya yönleniyor mu; "tek bir revision pass" ifadesi kalkmış mı?
- [ ] `design-reviewer.md` raporunda "Otomatik testler" ve "Teslim engelleri" (B kimlikli) bölümleri, yeniden kontrol modu var mı?
- [ ] `design-planner.md`: `design-plan.md` her zaman yazılıyor, Notion/Jira kopya; `LDF_PLAN run=… tasks=…` işareti var mı?
- [ ] `ux-designer.md`: `ux-specs.md`'ye ekleme (önceki bölümler korunur) ve `UX_SPEC_STATUS: COMPLETE run=… tasks=…` işareti var mı?
- [ ] `ldf-design-strategy.md → Adım 3c → 4`: `plan-gate.mjs --run` kullanılıyor mu?
- [ ] Quick mod hafif review ile teslim kapısından geçiyor (run-all + hafif review maddeleri, Adım 6 durumları); yeniden kontrolde reviewer'ın bildirdiği yeni engel orkestratörce düşürülemiyor mu?
- [ ] Kapsam kararı: builder yeni özellik/ekran/veri toplama/vaat/akış gerektiren engelde "kapsam kararı gerekli" diye dönüyor; Adım 6'da üç seçenek (kapsama ekle → plan + UX önce / vaadi koruyan geçici çözüm / istisna → `## Teslim İstisnaları`) ve "İstisna onayıyla teslim edilebilir" durumu var mı?
- [ ] `ldf-iterate.md → Bağlayıcı karar değişikliği`: `[Korunan]` ve diğer kararlar için ayrı soru, güncelle / kalsın sonuçları, `(güncellendi: tarih, önceki: …)` eki var mı; design-strategy ve builder buraya yönleniyor mu?
- [ ] `design-builder.md → Bağlayıcı Kararlar`: çelişkide "karar güncelleme gerekli" diye dönüyor, kayıt güncellenince yeni hâli uyguluyor mu?
- [ ] `token-standards.md → 4 Katı Skalası`: tipografide 4 katı yalnızca öneri, spacing/radius/icon zorunlu mu?

---

## RAPOR

Tüm kontroller tamamlandığında:

```
=== LDF Pipeline Test Raporu ===
Tarih: [tarih]

ÖZET
  Toplam kontrol: [N]
  PASS: [N]
  WARN: [N]
  FAIL: [N]

BAŞARISIZ KONTROLLER
  [varsa listele — dosya adı + ne eksik + ne yapılmalı]

UYARILAR
  [varsa listele]

GENEL DURUM
  [PASS / WARN / FAIL]
```

FAIL varsa her birini şu formatta yaz:
`FAIL [Bölüm N] [dosya adı]: [ne eksik] → [öneri]`
