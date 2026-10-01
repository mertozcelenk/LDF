# Pre-flight Checklist

design-builder'ın teslimden **önce** kendi çıktısı üzerinde çalıştırdığı öz-kontrol.
Quick modda reviewer çalışmadığı için tek kalite kapısı budur; deep modda reviewer'ların
yükünü azaltır.

Kural metinleri burada tekrarlanmaz — her madde `references/reviewer-checklist.md`'deki
bölüme referans verir. Belirsiz kalan bir maddede o bölümü oku.

## Nasıl çalıştırılır

1. Her maddeyi işaretle: `✓` geçti · `✗` geçmedi · `N/A` uygulanmaz (gerekçesiyle).
2. `✗` olan her maddeyi **düzelt**, ardından tekrar işaretle.
3. Düzeltilemeyen `✗` kalırsa raporda nedenini yaz — tamamlanmış gibi gösterme.
4. `scripts/test/` varsa `node tells.mjs` çalıştır, sonucunu ilgili maddelere işle.
   Çalıştırılamazsa "tells.mjs çalıştırılamadı, kaynak analiziyle kontrol edildi" yaz.

`[marketing]` maddeleri yalnızca marketing ekranlarında, `[dark]` maddeleri yalnızca
`color_scheme: both | dark` iken uygulanır.

## Liste

**Metadata ve token**
- [ ] HTML `<head>`'de "Designed by: adesso Turkey" yorumu + `meta author`; yapay zeka iması yok (HTML g / Figma e)
- [ ] Ekranlarda `data-page-kind` (HTML) veya `page_kind` description satırı (Figma) mevcut (HTML g / Figma e)
- [ ] Renk, font, font-size, radius, spacing hardcode edilmemiş, hepsi token'a bağlı (HTML c / Figma c)
- [ ] `spec.md → Bağlayıcı Kararlar` maddelerinin hiçbiri ihlal edilmemiş; `[Korunan]` öğeler aynen korunmuş (HTML m / Figma j)

**AI tells**
- [ ] Görünür metin, `alt` ve `aria-label`'da sıfır em-dash (`—`) ve ayraç en-dash (`–`) (HTML h)
- [ ] Div/dikdörtgenlerden sahte ürün UI yok (HTML h)
- [ ] Katalogdaki "Süs ve Meta Metinler" maddelerinin hiçbiri yok (Katalog)
- [ ] Placeholder isim, dolgu fiiller ("Seamless", "Elevate"), mükemmel sayılar yok (Katalog → İçerik)
- [ ] Görünür her metin yeniden okundu; dil bilgisi bozuk veya anlamsız ifade yok

**Tutarlılık kilitleri**
- [ ] Tek accent rengi, tüm ekranlarda aynı (HTML i)
- [ ] Tek radius sistemi veya belgelenmiş kural (HTML i)
- [ ] Her niyet için tek CTA etiketi; desktop'ta hiçbir CTA iki satıra kaymıyor (HTML i)
- [ ] Buton ve form öğeleri WCAG AA kontrastı geçiyor (HTML i, d)

**Layout [marketing]**
- [ ] Hero: başlık ≤ 2 satır, alt metin ≤ 20 kelime, ≤ 4 metin öğesi, CTA ilk görünümde, üst padding ≤ 96px (HTML j)
- [ ] Nav desktop'ta tek satır ve ≤ 80px (HTML j)
- [ ] Eyebrow sayısı ≤ ceil(section / 3); VARIANCE > 4 ise hero ortalanmamış (HTML j)
- [ ] Layout ailesi tekrarı yok, zigzag ≤ 2 ardışık, bento hücre sayısı = içerik sayısı, split-header yok (HTML j)

**Mobil, tema, hareket**
- [ ] Her çok kolonlu section'ın 375px düzeni açıkça tanımlı (HTML k / Figma k)
- [ ] [dark] Koyu tema blokları/modları mevcut, kontrast iki temada da kontrol edildi (HTML l / Figma i)
- [ ] Animasyon miktarı MOTION değerine uygun; `prefers-reduced-motion` desteği var; `scroll` event listener yok (HTML n, e)

## Rapor formatı

Builder özetinin sonuna eklenir:

```
## Pre-flight
✓ 18 · ✗ 1 · N/A 2
✗ CTA satır kayması — "Ücretsiz denemeye başla" 1280px'te 2 satır; etiket kısaltılamadı, Açık Sorular'a eklendi
N/A Layout [marketing] — tüm ekranlar product
N/A [dark] — color_scheme: light
```
