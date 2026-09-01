---
name: ldf-import
description: Hali hazırda var olan bir projeyi LDF pipeline'ına dahil eder. Proje klasörünü otomatik tarar, senaryoyu tespit eder ve doğru akışı başlatır. LDF ile üretilmiş proje, dışarıdan HTML/CSS projesi veya Figma projesi — üç senaryoyu da destekler.
---

# Import — Mevcut Projeyi Pipeline'a Dahil Et

## Durum Yönetimi

Başlamadan önce mevcut state dosyasını kontrol et:
```bash
ls /tmp/ldf-import-*.json 2>/dev/null
```
Dosya varsa kullanıcıya "kaldığım yerden devam et / yeni başlat" sor.
Her adım tamamlandığında `/tmp/ldf-import-{RUN_ID}.json` dosyasını güncelle.
Başarıyla tamamlanınca dosyayı sil.

---

## Adım 1 — LDF İmzasını Kontrol Et

İlk olarak `spec.md` içinde LDF imzasını ara:

```bash
grep -q "produced_by: LDF" spec.md 2>/dev/null
```

**İmza bulunduysa** → Kesin LDF projesi. Adım 2 → Senaryo 1'e git. Başka kontrol gerekmez.

**İmza bulunamadıysa** → Adım 1b'ye geç.

## Adım 1b — Proje Klasörünü Tara

Proje kökünde şu dosya ve klasörlerin varlığını kontrol et:

| Sinyal | Kontrol |
|--------|---------|
| `spec.md` + `[herhangi-ad]-tokens.json` | LDF projesi olabilir (imzasız) |
| `project-state.md` | LDF state dosyası |
| `components/` veya `screens/` | HTML/CSS çıktı klasörleri |
| `*.html` (kök veya alt klasörlerde) | Dışarıdan HTML projesi |
| Kullanıcının verdiği Figma linki | Figma projesi |

---

## Adım 2 — Senaryoyu Tespit Et ve Onayla

Tarama sonucuna göre senaryoyu belirle ve kullanıcıya onayla:

### Senaryo 1 — LDF Projesi

**Tespit:** `spec.md` + `[ad]-tokens.json` ikisi de varsa.

Kullanıcıya söyle:
> "Bu proje LDF ile üretilmiş görünüyor. `spec.md` ve token seti mevcut.
> Doğrudan devam edebiliriz.
>
> Ne yapmak istiyorsunuz?
> `[ ] Tasarımı düzenle veya yeni özellik ekle` → `/ldf-iterate`
> `[ ] Sunumu gerçek projeye taşı` → `/ldf-promote`
> `[ ] Çıktı formatını değiştir (HTML/CSS ↔ Figma)` → `/ldf-migrate`"

Seçime göre ilgili skill'i başlat. Onboard tamamlandı.

---

### Senaryo 2 — Dışarıdan HTML/CSS Projesi

**Tespit:** `spec.md` yok ama `components/`, `screens/` veya kök dizinde `.html` dosyaları var.

Kullanıcıya söyle:
> "Dışarıdan gelmiş bir HTML/CSS projesi tespit ettim. Pipeline'a dahil etmek için
> önce mevcut sistemi tarayıp token seti oluşturmam gerekiyor.
>
> Şu adımları sırayla çalıştıracağım:
> 1. `/ldf-context-scanner` — mevcut HTML/CSS'i tara
> 2. `/ldf-token-generator` — taranan değerlerden token seti üret
> 3. `/ldf-spec-intake` — proje spec'ini oluştur
> 4. `/ldf-design-strategy` — buradan devam
>
> Başlayalım mı?"

Onay gelince:

**Adım 2a — context-scanner**
`context-scanner` skill'ini çağır. Proje kökünü ve tüm `.html` dosyalarını ilet.
Scanner şunları çıkarır: renk paleti, tipografi, boşluk örüntüleri, component listesi.

**Adım 2b — token-generator**
`token-generator` skill'ini çağır. Şunu ilet:
- Scanner'ın çıkardığı değerler
- `source: "reference_derived"` — tüm değerler mevcut projeden geliyor

Token dosyası üretilince devam et.

**Adım 2c — spec-intake**
`spec-intake` skill'ini çağır. Scanner bulgularını arka plan bilgisi olarak ilet —
spec-intake kullanıcıya S1-S4 sorularını sorar, proje brief'ini tamamlar.

**Adım 2d — design-strategy**
`design-strategy` skill'ini başlat. Onboard tamamlandı.

---

### Senaryo 3 — Figma Projesi

**Tespit:** Kullanıcı Figma linki verdi veya `spec.md` yok ve HTML/CSS de yok.

Kullanıcıya sor:
> "Figma projesinin linkini paylaşır mısınız?"

Link alındıktan sonra:

**Adım 3a — Figma bağlantısı kontrolü**
`mcp__figma-desktop__get_metadata` ile bağlantıyı test et.
Başarısızsa `reference-ingest`'teki Chrome kontrol akışını uygula.

**Adım 3b — spec-intake**
`spec-intake` skill'ini çağır. Figma linkini `reference-ingest` için ilet —
Figma'dan token değerleri çekilir, spec'e eklenir.

**Adım 3c — token-generator**
`token-generator` skill'ini çağır. Figma'dan çekilen değerleri `reference_derived`
olarak işaretleyerek token seti oluştur.

**Adım 3d — design-strategy**
`design-strategy` skill'ini başlat. Onboard tamamlandı.

---

### Senaryo Tespit Edilemedi

Hiçbir sinyal yoksa kullanıcıya sor:

> "Projeyi tanımlamak için bir başlangıç noktasına ihtiyacım var.
> Elinizde ne var?
>
> `[ ] LDF ile üretilmiş proje` — spec.md ve tokens.json var
> `[ ] HTML/CSS dosyaları` — klasör veya dosya yolunu paylaşın
> `[ ] Figma projesi` — Figma linkini paylaşın
> `[ ] Sıfırdan başlıyorum` — `/ldf-spec-intake` ile başla"

Seçime göre ilgili senaryoya geç.

---

## Kısıtlamalar

- Mevcut proje dosyalarını değiştirmez — yalnızca okur
- `spec.md` veya token dosyası oluşturmaz — ilgili skill'lere devreder
- Framework dönüşümü yapmaz (React, Vue, React Native — ileride eklenecek)
