# Reviewer Checklist

Design-reviewer'ın ihtiyaç duyduğunda okuduğu tam kontrol listesi.
Workflow ve çıktı formatı için `agents/design-reviewer.md`'ye bak.

---

## HTML Modu Kontrolleri

### a. Otomatik Testler

`scripts/test/` mevcutsa sırayla çalıştır (biri başarısız olsa bile diğerlerine devam et):

```bash
cd scripts/test && npm install --silent 2>&1 | tail -1
cd scripts/test && node visual.mjs 2>&1
cd scripts/test && node accessibility.mjs 2>&1
cd scripts/test && node tokens.mjs 2>&1
```

`scripts/test/` yoksa veya `npm install` başarısız olursa kaynak analiziyle devam et — bunu açıkça belirt.

### b. Spec Uyumu

- Her component brief'in kapsam listesinde var mı?
- Eksik state var mı? (boş, hata, yükleniyor — brief'te geçiyorsa kontrol et)

### c. Token Uyumu

Token JSON mevcutsa:
- CSS custom property değerleri token değerleriyle eşleşiyor mu?
- Yaklaştırma yapılmış değer var mı? (örn. `#1A1B1C` yerine `#000` kullanılmış)

### d. Erişilebilirlik

- spec.md'deki erişilebilirlik gereksinimi karşılanıyor mu? (varsayılan: WCAG AA)
- Metin/arkaplan kontrast oranı yeterli mi?

### e. Animasyon

- Yalnızca `transform` / `opacity` kullanılmış mı?
- Statik elemanlarda gereksiz transition var mı?
- `prefers-reduced-motion` guard eklenmiş mi?

### f. AI Tells Kontrolü

Token JSON'dan `"source": "user_explicit"` olan token'ları oku — bu token'lara
karşılık gelen değerler aşağıdaki kontrollerde atlanır.

Geri kalan (`ai_inferred` ve `reference_derived`) çıktıda kontrol et:

- [ ] Em-dash (`—`) herhangi bir metin içinde var mı? → **engelleyici**
- [ ] `Inter` font `user_explicit` olmadan kullanılmış mı? → minor
- [ ] 3 eşit genişlikte yan yana feature card var mı? → minor
- [ ] Eyebrow sayısı `ceil(section sayısı / 3)`'ü aşıyor mu? → minor
- [ ] Beige+brass+espresso renk ailesi (`#f5f1ea` / `#b08947` / `#1a1714` tonları)
  `user_explicit` olmadan premium-consumer brief'te kullanılmış mı? → minor
- [ ] Div-based fake screenshot var mı? → **engelleyici**
- [ ] Placeholder isim (`John Doe`, `Acme Corp` vb.) var mı? → minor
- [ ] Pure `#000000` veya `#ffffff` kullanılmış mı? → minor

Token JSON yoksa bu kontrol kaynak analizi üzerinden yapılır. Yapılamayan kontrolleri
"Token JSON sağlanmadı, manuel doğrulama gerekiyor" notu ile işaretle.

---

## Figma Modu Kontrolleri

### a. Frame İçeriğini Oku

`get_design_context` ve `get_screenshot` ile her frame'i incele.

### b. Spec Uyumu

- Kapsam listesindeki her component / ekran mevcut mu?
- Eksik state var mı?

### c. Token Uyumu

Token JSON mevcutsa:
- Renk, tipografi ve boşluk değerleri token'larla eşleşiyor mu?
- Serbest değer (token'a bağlı olmayan renk, font boyutu vb.) kullanılmış mı?

### d. Erişilebilirlik

- Kontrast oranı WCAG AA'yı karşılıyor mu?

### e. AI Tells Kontrolü

Token JSON'dan `"source": "user_explicit"` olan token'ları oku — bu token'lara
karşılık gelen değerler aşağıdaki kontrollerde atlanır.

`get_design_context` ve `get_screenshot` çıktısı üzerinden kontrol et:

- [ ] Em-dash (`—`) herhangi bir text layer'da var mı? → **engelleyici**
- [ ] `Inter` font `user_explicit` olmadan kullanılmış mı? → minor
- [ ] 3 eşit genişlikte yan yana feature card var mı? → minor
- [ ] Eyebrow sayısı `ceil(section sayısı / 3)`'ü aşıyor mu? → minor
- [ ] Beige+brass+espresso renk ailesi `user_explicit` olmadan
  premium-consumer brief'te kullanılmış mı? → minor
- [ ] Placeholder isim (`John Doe`, `Acme Corp` vb.) bir text layer'da var mı? → minor
- [ ] Pure `#000000` veya `#ffffff` fill kullanılmış mı? → minor

---

## AI Tells — Yasak Desenler Kataloğu

Design-builder tarafından da referans alınır. Reviewer bu listeye göre f/e kontrolünü yapar.

### Layout

| Yasak | Alternatif |
|---|---|
| 3 eşit sütun feature card | 2-kolon zig-zag, asimetrik grid, yatay scroll, bento |
| Her section'a eyebrow | Max ceil(section / 3); çoğu section başlığı eyebrow gerektirmez |
| Zigzag image+text 3+ tekrar | 3. tekrarda farklı layout ailesi kullan |
| Her brief için centered hero | Split screen, left-aligned veya asimetrik; sadece editorial'da centered geçerli |

### İçerik

| Yasak | Alternatif |
|---|---|
| Em-dash (`—`) | Virgül, nokta veya iki ayrı cümle |
| "John Doe", "Acme Corp" | Brief'e uygun, gerçekçi isimler |
| "Elevate", "Seamless", "Unleash", "Next-Gen" | Somut, işlevsel kelimeler |
| `99.99%`, `50%`, `1,234,567` | Organik değerler (`47.2%`, `1,381`) veya sayıyı kaldır |
| Scroll cue ("↓ scroll") | Yok — kullanıcı scroll'u bilir |

### Görsel

| Yasak | Alternatif |
|---|---|
| Div-based fake screenshot | Gerçek component, gerçek görsel veya açık placeholder |
| Hand-rolled SVG icon | Phosphor, HugeIcons, Radix, Tabler |
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
