---
name: ldf-check
description: Mevcut projenin tüm HTML/CSS çıktılarını çapraz sayfa tutarlılık açısından kontrol eder. Ortak elementlerin (nav, header, footer) sayfalar arasında tutarlı olup olmadığını, token bağlantılarının doğru uygulandığını ve hardcode değer karışıklığı olmadığını doğrular. Sunum öncesi veya büyük değişiklikler sonrasında çalıştırılır.
---

# LDF Check — Çapraz Sayfa Tutarlılık Kontrolü

## Durum Yönetimi

Başlamadan önce mevcut state dosyasını kontrol et:
```bash
ls /tmp/ldf-check-*.json 2>/dev/null
```
Dosya varsa kullanıcıya "kaldığım yerden devam et / yeni başlat" sor.
Her adım tamamlandığında `/tmp/ldf-check-{RUN_ID}.json` dosyasını güncelle.
Başarıyla tamamlanınca dosyayı sil.

---

## Ön Koşul Kontrolü

`project-state.md` dosyasını proje kökünde oku. Varsa:
- Üretilen dosya listesini buradan al
- Çıktı formatını doğrula (`html` değilse dur: "Bu kontrol yalnızca HTML/CSS çıktıları için geçerlidir.")

`project-state.md` yoksa `components/` ve `screens/` klasörlerini tara.
Hiç `.html` dosyası bulunamazsa dur:
> "Kontrol edilecek HTML dosyası bulunamadı. Önce `/design-strategy` ile çıktı üretin."

---

## Adım 1 — Ortak Element Tespiti

Tüm `.html` dosyalarını oku. Aşağıdaki yapıları her sayfada tespit et:

| Element | Tespit kriteri |
|---------|----------------|
| Navigasyon | `<nav>`, `role="navigation"`, `class` içinde `nav` / `menu` / `header` geçenler |
| Header | `<header>`, `role="banner"` |
| Footer | `<footer>`, `role="contentinfo"` |
| Sidebar | `role="complementary"`, `class` içinde `sidebar` / `aside` geçenler |

Her tespit edilen element için hangi sayfalarda göründüğünü kaydet.
Yalnızca tek sayfada görünen elementleri bu kontrole dahil etme.

---

## Adım 2 — Tutarlılık Karşılaştırması

Her ortak element için şunları karşılaştır:

### 2a — Yapısal Tutarlılık
- Alt element sayısı ve sırası aynı mı?
- Class isimleri tutarlı mı?
- Eksik veya fazla element var mı?

### 2b — Token Tutarlılığı
- CSS değerleri `var(--token-adı)` ile mi yazılmış, hardcode mu?
- Aynı element farklı sayfalarda farklı token kullanıyor mu?
- Bir sayfada token, diğerinde hardcode değer var mı?

### 2c — Görsel Değer Tutarlılığı
Hardcode değer kullanan elementlerde:
- Aynı renk, farklı sayfalarda farklı hex kodu ile mi yazılmış? (örn. `#1a73e8` vs `#1A73E8` vs `rgb(26,115,232)`)
- Font size veya spacing değerleri sayfalar arasında farklı mı?

### 2d — İçerik Tutarlılığı
- Navigasyon link metinleri tüm sayfalarda aynı mı?
- Link href değerleri tutarlı mı?
- Icon veya görsel referanslar aynı mı?

### 2e — İkon Disiplini Tutarlılığı
- Emoji ikon olarak kullanılmış mı? (🎨 🚀 ⚙️ gibi) → `major`
- Aynı hiyerarşi seviyesinde filled ve outline ikon karışık mı? (örn. nav'da filled Home + outline Settings) → `major`
- Farklı sayfalarda aynı element için farklı ikon ailesi kullanılmış mı? → `major`
- SVG/vector ikon yerine raster (PNG) kullanılmış mı? → `medium`

---

## Adım 3 — Rapor

Raporu şu yapıda yaz:

```
## Check Raporu — [proje adı]

### Blocker (sayfa erişilemiyor veya kullanıcı görevi tamamlayamaz)
- [element] — [sayfa A] vs [sayfa B]: [ne farklı] → [ne yapılmalı]

### High (kullanıcı fark eder — düzeltilmeli)
- ...

### Medium (görsel fark yok ama teknik tutarsızlık)
- ...

### Nitpick (çok küçük, isteğe bağlı)
- Nit: ...
```

**Örnek bulgular:**
```
- [Blocker] <nav> — screens/login.html vs screens/dashboard.html: dashboard'da "Profil" linki eksik → tüm sayfalara ekle
- [High] <nav> background — screens/login.html: var(--color-surface) | screens/settings.html: #ffffff → token kullanımını birleştir
- [High] İkon stili — screens/home.html: filled ikonlar | screens/profile.html: outline ikonlar → tek stil seç
- [Medium] <footer> font-size — screens/login.html: 12px | screens/dashboard.html: var(--text-sm) → token'a bağla
```

Bulgu yoksa:
> "Çapraz sayfa kontrolü tamamlandı — tutarlılık sorunu bulunamadı."

---

## Adım 4 — Sonraki Adım

Bulgu varsa kullanıcıya sor:
> "[n] tutarlılık sorunu tespit edildi. Bunları düzeltmemi ister misiniz?
> `[ ] Evet, düzelt` → `/iterate` ile her bulguyu uygula
> `[ ] Hayır, raporu kaydet` → bulguları `check-report.md` olarak kaydet"

`check-report.md` formatı:
```markdown
# [Proje Adı] — Check Raporu
Tarih: [tarih]
Toplam bulgu: [n]

## Bulgular
[liste]
```

---

## Kısıtlamalar

- Yalnızca HTML/CSS modunda çalışır (Figma modu için Figma'nın kendi tutarlılık araçları kullanılır)
- Hiçbir şeyi kendisi düzeltmez — raporlar ve `/iterate`'e devreder
- `spec.md` veya token dosyasını değiştirmez
