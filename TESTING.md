# LDF — Test Rehberi

## Ortam Gereksinimleri

| Gereksinim | Zorunlu mu | Notlar |
|------------|------------|--------|
| Claude Code (claude CLI) | Evet | |
| Git | Evet | |
| Figma desktop uygulaması | Hayır | Sadece Figma çıktısı için |
| Figma Claude Code eklentisi | Hayır | Figma → Plugins → Claude Code |
| Figma MCP sunucusu (Claude Code ayarları) | Hayır | Eklentiyle birlikte etkinleştirilir |

Figma kurulu değilse tüm senaryolar HTML/CSS çıktısıyla çalışır.

---

## Test Projesi Kurulumu

```bash
mkdir ldf-test && cd ldf-test
git clone https://github.com/mertozcelenk/LDF.git .
claude .
```

---

## Senaryo 1 — Spec Intake (Temel)

**Amaç:** spec-intake'in soruları doğru sorduğunu ve spec.md ürettiğini doğrula.

**Adımlar:**
1. `/ldf-spec-intake` çalıştır
2. Soruları yanıtla — en az şunlara cevap ver:
   - Proje adı
   - Platform (web)
   - Renk şeması (sadece açık tema)
   - Design system kaynağı (sıfırdan kurulacak)
   - S1-S5 estetik yön soruları
3. Referans girdi sormadan tamamla

**Başarı kriterleri:**
- [ ] `spec.md` proje kökünde oluştu
- [ ] `spec.md` içinde `<!-- BEGIN:token_directives -->` bloğu var
- [ ] `source_label` ve `trust_profile` alanları dolu veya boş ama blok mevcut
- [ ] S1, S2 ve S5 seçenekleri açıklama ve örnek ürünle gösterildi
- [ ] `token_directives` içinde `selected_options.motion`, `color_scheme` ve boş `dials` bloğu var
- [ ] "Devam etmek için `/token-generator` komutunu çalıştırın" mesajı gösterildi
- [ ] Açık Sorular bölümü yalnızca gerçekten sorulmuş ama cevaplanmamış alanları içeriyor

---

## Senaryo 2 — Spec Intake + Referans Girdi

**Amaç:** reference-ingest zincirinin çalıştığını ve 9 alanlı formatı ürettiğini doğrula.

**Adımlar:**
1. `/ldf-spec-intake` çalıştır
2. Referans girdi sorusunda bir Figma linki veya görsel sağla
3. Tamamla

**Başarı kriterleri:**
- [ ] `spec.md` içinde Referans Girdiler bölümü 9 alanlı formatla dolu
  (`kaynak`, `tür`, `label`, `güven`, `içerik_özeti`, `tespit_edilen_değerler`, `bilinen_sorunlar`, `işleme_notu`, `ingest_durumu`)
- [ ] `ingest_durumu` değeri `tamamlandı`, `kısmi` veya `araç_erişim_hatası` — boş değil
- [ ] `inspiration_images_trust` alanı `token_directives` bloğunda yazılmış

---

## Senaryo 3 — Token Üretimi

**Amaç:** Spec.md'den token JSON üretildiğini doğrula.

**Ön koşul:** Senaryo 1 tamamlanmış, `spec.md` mevcut.

**Adımlar:**
1. `/ldf-token-generator` çalıştır

**Başarı kriterleri:**
- [ ] `[proje-adı]-tokens.json` proje kökünde oluştu
- [ ] JSON içinde şu koleksiyonlar var: `Primitives`, `Layout`, `Color`, `Typography`, `Component`
- [ ] Her token'da `$type`, `$value`, `$description` alanları mevcut
- [ ] `_meta` bloğu var ve kaynak bilgisini içeriyor

---

## Senaryo 4 — Design Strategy (Quick Mod, HTML)

**Amaç:** Pipeline'ın quick modda HTML çıktısı ürettiğini doğrula.

**Ön koşul:** Senaryo 1 tamamlanmış, `spec.md` mevcut. Token JSON opsiyonel.

**Adımlar:**
1. `/ldf-design-strategy` çalıştır
2. "Hızlı yap" veya "quick mod" de
3. Tek bir küçük component iste (örn. "sadece bir button yap")

**Başarı kriterleri:**
- [ ] design-strategist brief döndürdü (Kapsam, Persona, Style Direction, Mod)
- [ ] design-planner çalıştırılmadı (quick modda atlanır)
- [ ] `components/atoms/button.html` veya benzeri bir dosya oluştu
- [ ] HTML dosyası CSS custom properties kullanıyor (`--color-*`, `--spacing-*` vb.)
- [ ] Dosya tarayıcıda açılabiliyor
- [ ] Design Read satırında `VARIANCE n · MOTION n · DENSITY n` var; değiştirme fırsatı soruldu
- [ ] Onaydan sonra `spec.md → token_directives.dials` dolduruldu
- [ ] Builder özetinde `## Pre-flight` raporu var

---

## Senaryo 5 — Design Strategy (Deep Mod, HTML)

**Amaç:** Pipeline'ın deep modda planlama yapıp HTML ürettiğini doğrula.

**Ön koşul:** Senaryo 3 tamamlanmış, token JSON mevcut.

**Adımlar:**
1. `/ldf-design-strategy` çalıştır
2. "Deep mod" de veya hiçbir şey söyleme (strategist karar versin)
3. 2-3 component içeren küçük bir kapsam belirt

**Başarı kriterleri:**
- [ ] design-strategist brief döndürdü
- [ ] `design-plan.md` proje kökünde oluştu
- [ ] `design-plan.md` katman sırasına göre görev listesi içeriyor (TASK-001, TASK-002 ...)
- [ ] Her görevde `Çıktı hedefi` alanı dolu
- [ ] design-builder belirtilen HTML dosyalarını üretti
- [ ] design-reviewer bulgu raporu döndürdü (boş veya dolu — önemli değil, raporlaması yeterli)
- [ ] Bulgu varsa design-builder tek bir revision pass yaptı

---

## Senaryo 6 — Design Strategy (Figma Çıktısı)

**Ön koşul:** Figma desktop açık, Claude Code eklentisi kurulu ve MCP etkin.

**Adımlar:**
1. `/ldf-design-strategy` çalıştır
2. "Figma'ya yaz" de
3. Tek bir component iste

**Başarı kriterleri:**
- [ ] design-builder `use_figma` kullandı (Figma modunda çalıştı)
- [ ] Figma'da ilgili sayfa/frame oluştu
- [ ] Oluşturulan node ID'leri döndürüldü

---

## Senaryo 7 — Figma Kurulu Değilken Fallback

**Amaç:** use_figma olmadan HTML'e düştüğünü ve kurulum mesajı gösterdiğini doğrula.

**Ön koşul:** Figma eklentisi kurulu DEĞİL.

**Adımlar:**
1. `/ldf-design-strategy` çalıştır
2. "Figma'ya yaz" de

**Başarı kriterleri:**
- [ ] Kurulum rehberi mesajı gösterildi ("Figma Claude Code eklentisinin kurulu olması gerekiyor...")
- [ ] Pipeline durmadı, HTML çıktısına geçti
- [ ] HTML dosyası üretildi

---

## Senaryo 8 — Dark Mode Çıktısı

**Amaç:** `color_scheme: both` iken token, HTML ve kontrast kontrolünün iki temayı kapsadığını doğrula.

**Adımlar:**
1. `/ldf-spec-intake` — Renk şeması: "ikisi de"
2. `/ldf-token-generator`
3. `/ldf-design-strategy` → quick mod, HTML, tek bir ekran

**Başarı kriterleri:**
- [ ] Token JSON'da semantic renklerde `$value` + `$extensions.mode.dark` var
- [ ] Token-generator kontrast raporu iki mod için ayrı satırlar içeriyor
- [ ] HTML'de `:root`, `[data-theme="dark"]` ve `@media (prefers-color-scheme: dark)` blokları var
- [ ] `index.html` sidebar'ında tema anahtarı çalışıyor

---

## Senaryo 9 — Redesign Koruma

**Amaç:** Var olan bir projede korunan öğelerin kayda geçtiğini ve onaysız değişmediğini doğrula.

**Ön koşul:** `spec.md` olmayan, `screens/` altında nav ve form içeren bir HTML projesi.

**Adımlar:**
1. `/ldf-import` → Senaryo 2 (dışarıdan HTML/CSS)
2. Çalışma modu sorusunda "Redesign – Koruyarak" seç, Korunacaklar listesini onayla
3. Akış bittikten sonra `/ldf-iterate` → "Ana menüdeki [etiket] yazısını değiştir"

**Başarı kriterleri:**
- [ ] `context-scan.md` "Korunacaklar Envanteri" ve "Mevcut dial okuması" bölümlerini içeriyor
- [ ] Modernizasyon kapsamı soruldu
- [ ] `spec.md → Bağlayıcı Kararlar` altında `[Korunan]` satırları var
- [ ] `/ldf-iterate` değişiklikten önce korunan öğe onayı istedi
- [ ] "Hayır" seçilince nav etiketi değişmedi

---

## Senaryo 10 — Check ve Inspect Tutarlılık Kuralları

**Amaç:** `/ldf-check`'in sayfalar arası kilitleri ve korunan öğeleri, `/ldf-inspect`'in element bazlı yeni kuralları raporladığını doğrula.

**Ön koşul:** `spec.md` (Bağlayıcı Kararlar'da en az bir `[Korunan]` nav etiketi) ve `screens/` altında iki sayfa:
- `home.html` — CTA `var(--color-accent)`, etiket "Bize ulaşın", nav korunan etiketle aynı
- `about.html` — CTA `#2563eb`, etiket "Konuşalım", korunan nav etiketi değiştirilmiş

**Adımlar:**
1. `/ldf-check`
2. `/ldf-inspect` → Butonlar

**Başarı kriterleri:**
- [ ] Check raporunda korunan nav etiketi için Blocker var
- [ ] Check raporunda accent (about.html) ve iletişim CTA etiketi için High var
- [ ] Check raporunda `major` / küçük harfli seviye yok
- [ ] Inspect raporunda iletişim niyeti için iki farklı etiket High olarak raporlandı
- [ ] Playwright varsa CTA satır kayması tells.mjs'ten alındı; yoksa "Kontrol edilmedi" bölümünde

---

## Tasarım Testleri (Otomatik)

`scripts/test/` altında beş otomatik test scripti bulunur. design-reviewer bunları
her çalışmada otomatik tetikler. Elle çalıştırmak için:

```bash
cd scripts/test
npm install
```

| Komut | Ne test eder |
|-------|-------------|
| `npm run visual` | Screenshot al, baseline ile karşılaştır — layout bozukluğu, visual regression |
| `npm run a11y` | axe-core ile WCAG 2.1 AA + WCAG 2.2 AA ihlallerini raporlar (otomatik kapsam); WCAG 2.2 POUR'un manuel gerektiren kuralları ux-reviewer tarafından ayrıca denetlenir |
| `npm run tokens` | CSS custom property değerlerini token JSON ile karşılaştır |
| `npm run responsive` | 375 / 768 / 1280 px viewport'ta yatay overflow ve içerik taşması kontrolü |
| `npm run tells` | 1280 px'te em/en-dash, CTA satır kayması; marketing ekranlarda nav yüksekliği/tek satır ve eyebrow sayısı |
| `npm run all` | Beşini sırayla çalıştır |

**Visual baseline oluşturma (ilk çalıştırma):**
```bash
node visual.mjs --update  # Baseline oluşturur veya günceller; oluşturulan görüntüleri gözden geçirin
```

> **Not:** `node visual.mjs` (--update olmadan) baseline yoksa karşılaştırma yapamaz ve
> `[BASELINE YOK]` uyarısı verir. İlk baseline oluşturma her zaman `--update` ile ayrı bir
> açık adım olarak yapılmalıdır.

**Çıkış kodları:**
- `0` → tüm testler geçti
- `1` → engelleyici bulgu var (`tells.mjs` için: Blocker veya High)

`tells.mjs` başka bir proje kökünde çalıştırılabilir: `node tells.mjs --root <dizin>`.

**Gereksinimler:** Node.js 18+, Playwright, `@axe-core/playwright`

---

## Bilinen Sınırlamalar

- **design-reviewer HTML render:** Playwright kurulu değilse reviewer kaynak analizi yapar — görsel doğrulama yapamaz, bunu açıkça belirtir.
- **Figma token aktarımı:** Token JSON'dan Figma değişkenlerine aktarım `use_figma` ile yapılır; büyük token setlerinde birden fazla `use_figma` çağrısı gerekebilir.
- **Token JSON yokken design-strategy:** Pipeline devam eder ama design-builder tahmini CSS değerleri kullanır ve bunları açık soru olarak işaretler.
