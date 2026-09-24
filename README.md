# LDF — Large Design Framework

Claude Code skill ve agent kütüphanesi. Tasarımcıların sıfırdan veya mevcut
bir proje üzerinde tasarım sistemi kurmasını, token üretmesini ve bileşen
çıktısı almasını standartlaştırır. Çıktılar AI'dan çıkmış gibi görünmez —
anti-AI-tells sistemi ve tasarımcı onay döngüleri bunu engeller.

## Kurulum

```bash
# Yeni bir projeye LDF ekle
git clone --depth 1 https://github.com/mertozcelenk/LDF.git /tmp/ldf && cp -r /tmp/ldf/.claude . && rm -rf /tmp/ldf && cp -r .claude/skills/. .claude/commands/
```

> **Klasör yapısı hakkında:** `.claude/skills/` skill dokümantasyonunu barındırır.
> `.claude/commands/` ise Claude Code'un slash komutlarını (`/ldf-*`) keşfettiği dizindir.
> Kurulum komutu skill'leri her ikisine de kopyalar — bu kasıtlıdır.

```bash
# Mevcut projedeki LDF'yi güncelle
# Önce yerel değişikliklerinizi yedekleyin — güncelleme .claude/ içeriğini üstüne yazar
cp -r .claude .claude.bak
git clone --depth 1 https://github.com/mertozcelenk/LDF.git /tmp/ldf && cp -r /tmp/ldf/.claude . && rm -rf /tmp/ldf && cp -r .claude/skills/. .claude/commands/
# Kendi özelleştirmeleriniz varsa .claude.bak'tan geri alın
```

## Hızlı Başlangıç

**Sıfırdan başlıyorsan:**
```
/ldf-spec-intake          # Proje brief'ini topla
/ldf-token-generator      # Design token seti üret
/ldf-design-strategy      # Tasarım pipeline'ını başlat (quick veya deep mod)
```

**Hali hazırda bir projen varsa:**
```
/ldf-import               # Projeyi otomatik tespit eder ve doğru akışı başlatır
```

**Figma çıktısı için:** Figma Desktop'ta Plugins → Claude Code eklentisini aç.
Kurulu değilse pipeline otomatik olarak HTML/CSS moduna geçer.

**Onaylanan bir sunumu gerçek projeye taşımak için:**
```
/ldf-promote
```

**Format değiştirmek için (HTML/CSS ↔ Figma):**
```
/ldf-migrate
```

**Mevcut projeyi geliştirmek için:**
```
/ldf-iterate
```

## Pipeline

### Sıfırdan proje

```
/ldf-spec-intake
  ├── S1-S4 estetik yön soruları (dil, yoğunluk, tipografi, renk)
  ├── Kullanıcı yolculuğu (happy path)
  └── reference-ingest (referans varsa)
        ↓
/ldf-token-generator
  ├── Source assignment (user_explicit / reference_derived / ai_inferred)
  ├── AI tells filtresi (ai_inferred token'larda)
  └── Brand-guide modu (kurumsal kimlik kılavuzu varsa)
        ↓
/ldf-design-strategy
  ├── quick mod → strategist → builder
  └── deep mod  → strategist → planner → builder → design-reviewer → ux-reviewer → revision
```

### Mevcut sisteme ekleme

```
/ldf-context-scanner → /ldf-impact-analysis → /ldf-design-strategy
```

### Component library oluşturma

```
/ldf-component-library
  ├── components/ varsa oradan alır
  ├── yoksa screens/'dan tekrar eden UI parçalarını çıkarır
  ├── HTML → components/ klasörüne referans dosyalar yazar
  └── Figma → figma-generate-library ile tam kütüphane kurar (variable binding, variant'lar)
```

### Onaylanan sunumu gerçek projeye taşıma

```
/ldf-promote
  ├── HTML/CSS olarak devam → inline stiller temizlenir, token'lara bağlanır
  └── Figma'ya aktar → token'lar değişkenlere, ekranlar frame'lere taşınır
```

### Format değiştirme

```
/ldf-migrate
  ├── HTML/CSS → Figma
  └── Figma → HTML/CSS
```

### Mevcut projeyi geliştirme

```
/ldf-iterate
  ├── Küçük değişiklik → uygular → hafif review (kontrast + token + AI tells) → re-check
  └── Büyük özellik → planlar (design-plan.md Geliştirme Backlog'u) → uygular → tam review → revision → re-check
```

## Deep Mod Pipeline — Adım Adım

| Adım | Agent | Ne yapar |
|------|-------|----------|
| 1 | design-strategist | Estetik çakışma tespiti, alternatif yönler, Design Read, kritik heuristic'ler |
| 2 | design-planner | Component listesi, user flow genişletme + UX validation, tasarımcı onayı, görev çıktısı |
| 3 | ux-designer | Her component için UX pattern seçimi ve spec üretimi |
| 4 | design-builder | Figma veya HTML/CSS üretir |
| 5 | design-reviewer | Spec/token/a11y/AI tells mekanik kontrolü |
| 6 | ux-reviewer | Nielsen heuristic'leri, component binding, WCAG 2.2 POUR manuel kontrol |
| 7 | design-builder | Revision pass (her iki reviewer bulgularıyla) |

## Öne Çıkan Özellikler

**Anti-AI-tells sistemi**
LLM'in varsayılan desenlerini (Inter font, beige+brass paleti, 3-eşit-kart layout,
em-dash, placeholder isimler) üç katmanda engeller: token üretiminde, builder'da
ve reviewer'larda.

**user_explicit override**
Kullanıcı yasaklı bir değeri (font adı, renk kodu) açıkça belirtirse
`source: "user_explicit"` olarak işaretlenir ve tüm filtrelerden muaf tutulur.

**Estetik yön soruları (S1-S4)**
spec-intake tasarımcıya 4 soru sorar: genel dil, görsel yoğunluk, tipografi karakteri,
renk yaklaşımı. Seçim veya serbest metin kabul edilir. Seçimler token üretimini yönlendirir.

**Tasarımcı onay döngüleri**
Strategist estetik çakışmaları tespit edip sorar. Planner user flow boşluklarını
bulup onaylatır. Tasarımcı yanıt vermeden pipeline ilerlemez.

**UX katmanı**
Her task tanımı interaction spec, copy (hata/boş state metinleri) ve
a11y annotation (ARIA, tab sırası, touch target) içerir.

**Görev yönetimi entegrasyonu**
Planner görev listesini MD dosyası, Notion board veya Jira'ya yazabilir.

**Bağlayıcı Kararlar**
Konuşma sırasında verilen kalıcı tasarım kararları (`spec.md → Bağlayıcı Kararlar`) otomatik olarak kaydedilir.
Sonraki konuşmalarda tüm agent'lar bu kararları sert kısıtlama olarak uygular — design-reviewer ihlalleri Blocker olarak raporlar.

**Designed by: adesso Turkey**
Her üretilen HTML dosyasının `<head>` bölümüne `<!-- Designed by: adesso Turkey -->` ve `<meta name="author" content="adesso Turkey">` eklenir.
Figma çıktısında her frame/component'ın `description` alanına `"Designed by: adesso Turkey"` yazılır.
Yapay zeka kökenini ima eden her türlü meta tag, yorum veya özellik tüm çıktılarda kesinlikle yasaktır.
Reviewer ve ldf-check bu kuralı Blocker seviyesinde denetler.

**Token Standartları — Merkezi Referans**
Token'a dokunan tüm skill'ler (token-generator, promote, iterate, migrate, check) başlamadan önce
`.claude/references/token-standards.md` dosyasını okur. Geçerli source değerleri yalnızca üçtür:
`user_explicit`, `reference_derived`, `ai_inferred`. Bunlar dışında hiçbir source değeri yazılamaz.

**4 Katı Ölçek Sistemi**
Spec'te aksi belirtilmedikçe spacing, border-radius, font-size ve icon boyutları
otomatik olarak 4'ün katı değerlerde (4, 8, 12, 16, 20, 24…) üretilir.
`user_explicit` token'lar ve spec'te açıkça belirtilen grid sistemleri bu kuraldan muaftır.
Reviewer aynı kuralı denetler — ihlaller Medium bulgu olarak raporlanır.

## Dosya Yapısı

```
.claude/
├── skills/
│   ├── ldf-spec-intake.md
│   ├── ldf-token-generator.md
│   ├── ldf-design-strategy.md
│   ├── ldf-promote.md
│   ├── ldf-migrate.md
│   ├── ldf-iterate.md
│   ├── ldf-context-scanner.md
│   ├── ldf-impact-analysis.md
│   ├── ldf-reference-ingest.md
│   ├── ldf-token-layer-builder.md
│   ├── ldf-check.md
│   ├── ldf-inspect.md
│   └── figma-*.md             # 12 Figma skill
├── agents/
│   ├── design-strategist.md
│   ├── design-planner.md
│   ├── design-builder.md      # HTML: <!-- Designed by: adesso Turkey --> + meta author zorunlu
│   ├── design-reviewer.md
│   ├── ux-reviewer.md
│   ├── ux-designer.md
│   ├── token-generator-worker.md
│   ├── context-scanner-worker.md
│   └── pipeline-tester.md
└── references/
    ├── reviewer-checklist.md   # AI tells kataloğu + HTML/Figma kontrol listeleri
    └── token-standards.md      # Geçerli source değerleri, $value kuralı, zorunlu koleksiyonlar

# Proje kökünde üretilen dosyalar
spec.md                         # spec-intake çıktısı
[proje-adı]-tokens.json         # token-generator çıktısı
project-state.md                # design-builder çıktısı — proje durumu ve dosya listesi
design-plan.md                  # design-planner çıktısı — İlk Tasarım + Geliştirme Backlog'u
components/[katman]/[ad].html   # design-builder HTML çıktısı
screens/[ad].html               # design-builder ekran çıktısı
index.html                      # design-builder navigasyon sayfası
```

## Skill'ler

| Skill | Komut | Açıklama |
|-------|-------|----------|
| `ldf-spec-intake` | `/ldf-spec-intake` | Yeni projeye başlarken yapılandırılmış design spec toplar |
| `ldf-token-generator` | `/ldf-token-generator` | spec.md'den W3C DTCG token seti üretir |
| `ldf-design-strategy` | `/ldf-design-strategy` | Tasarım pipeline'ını orkestre eder |
| `ldf-promote` | `/ldf-promote` | Onaylanan sunumu gerçek projeye taşır (HTML/CSS veya Figma) |
| `ldf-migrate` | `/ldf-migrate` | Çıktı formatını değiştirir (HTML/CSS ↔ Figma) |
| `ldf-iterate` | `/ldf-iterate` | Mevcut projeyi düzenler veya yeni özellik ekler |
| `ldf-context-scanner` | `/ldf-context-scanner` | Var olan bir sistemi (web/Figma) tarar |
| `ldf-impact-analysis` | `/ldf-impact-analysis` | Var olan sisteme ekleme senaryosunda etki analizi yapar |
| `ldf-reference-ingest` | ldf-spec-intake tarafından çağrılır | Referans girdileri 9 alanlı formatta çıktı üretir |
| `ldf-import` | `/ldf-import` | Mevcut projeyi pipeline'a dahil eder (LDF / HTML/CSS / Figma) |
| `ldf-check` | `/ldf-check` | Çapraz sayfa tutarlılık kontrolü — nav, header, footer, token bağlantıları |
| `ldf-inspect` | `/ldf-inspect` | Element bazlı mekanik kontrol — buton, tipografi, form, nav, kart |
| `ldf-token-layer-builder` | `/ldf-token-layer-builder` | Token katmanlarını adım adım inşa eder |
| `ldf-component-library` | `/ldf-component-library` | Component library oluşturur — HTML (referans) veya Figma (tam kütüphane) |

## Agent'lar

| Agent | Çağıran | Açıklama |
|-------|---------|----------|
| `design-strategist` | design-strategy | Estetik çakışma, alternatif yönler, Design Read, tek cesur element ilkesi, heuristic uyarıları |
| `design-planner` | design-strategy (deep) | Flow genişletme, UX validation, görev listesi (MD/Notion/Jira) |
| `ux-designer` | design-strategy (deep) + iterate | UX pattern seçimi, etkileşim spec, animasyon zamanlama, ikon disiplini, anti-generic kontrol |
| `design-builder` | design-strategy | Figma veya HTML/CSS çıktısı üretir |
| `design-reviewer` | design-strategy (deep) | Spec/token/a11y/AI tells kontrolü — Blocker/High/Medium/Nitpick/Ne iyi raporu |
| `ux-reviewer` | design-strategy (deep) | Heuristic, binding, WCAG 2.2 POUR manuel kontrol |
| `token-generator-worker` | token-generator | Figma'dan ham token verisi çeker |
| `context-scanner-worker` | context-scanner | Web ve Figma kaynaklarını tarar |
