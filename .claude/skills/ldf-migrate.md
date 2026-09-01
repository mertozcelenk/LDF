---
name: ldf-migrate
description: Mevcut bir tasarım projesinin çıktı formatını değiştirir — HTML/CSS'i Figma'ya veya Figma'yı HTML/CSS'e taşır. Tasarım değişmez, yalnızca format dönüşümü yapılır. Proje zaten üretim aşamasındayken çağrılır.
---

# Migrate — Format Dönüşümü

## Durum Yönetimi

Başlamadan önce mevcut state dosyasını kontrol et:
```bash
ls /tmp/ldf-migrate-*.json 2>/dev/null
```
Dosya varsa kullanıcıya "kaldığım yerden devam et / yeni başlat" sor.
Her adım tamamlandığında `/tmp/ldf-migrate-{RUN_ID}.json` dosyasını güncelle.
Başarıyla tamamlanınca dosyayı sil.

---

## Ön Koşul Kontrolü

`project-state.md` dosyasını proje kökünde oku. Varsa:
- `cikti_formati`, `token_dosyasi`, `figma_linki` ve üretilen dosyaları buradan al
- Adım 1'deki yön sorusunda mevcut formatı kullanıcıya göster
- Aşağıdaki manuel kontrolleri atla

`project-state.md` yoksa aşağıdaki dosyaları manuel kontrol et:

| Dosya | Zorunlu mu? |
|-------|-------------|
| `spec.md` | Evet |
| `[proje-adı]-tokens.json` | Evet |

Herhangi biri eksikse dur:
> "`[eksik dosya]` bulunamadı. `/ldf-spec-intake` ve `/ldf-token-generator` adımlarının tamamlanmış olması gerekiyor."

---

## Adım 1 — Yön Sorusu

Kullanıcıya sor:

> "Hangi yönde dönüşüm yapmak istiyorsunuz?
>
> `[ ] HTML/CSS → Figma` — mevcut HTML/CSS dosyaları Figma'ya aktarılır
> `[ ] Figma → HTML/CSS` — Figma dosyasındaki tasarımlar HTML/CSS olarak üretilir"

---

## Adım 2A — HTML/CSS → Figma

### Kaynak kontrolü

`components/` ve `screens/` klasörlerini kontrol et. Hiç `.html` dosyası yoksa dur:
> "Aktarılacak HTML/CSS çıktısı bulunamadı. Önce `/ldf-design-strategy` ile tasarımları üretin."

### Figma bağlantısı

Kullanıcıya sor:
> "Tasarımları eklemek istediğiniz Figma dosyasının linkini paylaşır mısınız?"

Link alındıktan sonra `figma-use` skill'ini çağır:
- `[proje-adı]-tokens.json` içindeki token'ları Figma değişkenlerine aktar
- `figma-generate-design` skill'ini çağırarak her HTML ekranını Figma frame'ine dönüştür

Figma bağlantısı başarısız olursa `reference-ingest`'teki Chrome kontrol akışını uygula.

### Tamamlama

> "Aktarım tamamlandı.
> ✓ Token'lar Figma değişkenlerine eklendi
> ✓ [n] ekran Figma frame'ine dönüştürüldü
> HTML/CSS dosyaları değiştirilmedi — her iki format da güncel."

---

## Adım 2B — Figma → HTML/CSS

### Figma kaynağı

Kullanıcıya sor:
> "HTML/CSS'e dönüştürmek istediğiniz Figma dosyasının linkini paylaşır mısınız?"

`figma-use` skill'ini çağır; dosyanın frame ve component yapısını oku.

### Üretim

`design-builder` agent'ını çalıştır. Şunları ilet:
- Figma dosyasından okunan frame listesi
- `[proje-adı]-tokens.json` yolu
- Çıktı tipi: `html`

Builder her frame'i `screens/[ad].html` olarak, component'ları `components/[katman]/[ad].html` olarak üretir.
Tüm görevler bittikten sonra `index.html`'i oluşturur.

### Tamamlama

> "Dönüşüm tamamlandı.
> ✓ [n] ekran HTML/CSS olarak üretildi
> ✓ index.html güncellendi
> Figma dosyası değiştirilmedi — her iki format da güncel."

---

## Kısıtlamalar

- Tasarım kararı vermez — yalnızca format dönüşümü yapar
- `spec.md` ve `tokens.json` dosyalarını değiştirmez
- Framework dönüşümü yapmaz (React, Vue, React Native — ileride eklenecek)
