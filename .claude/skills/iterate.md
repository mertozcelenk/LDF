---
name: iterate
description: Mevcut bir tasarım projesini düzenler veya yeni özellikler ekler. Küçük değişiklikleri direkt uygular, büyük özellikleri design-plan.md'nin "Geliştirme Backlog'u" bölümüne planlar ve sırayla çalıştırır.
---

# Iterate — Mevcut Projeyi Geliştir

## Durum Yönetimi

Başlamadan önce mevcut state dosyasını kontrol et:
```bash
ls /tmp/ldf-iterate-*.json 2>/dev/null
```
Dosya varsa kullanıcıya "kaldığım yerden devam et / yeni başlat" sor.
Her adım tamamlandığında `/tmp/ldf-iterate-{RUN_ID}.json` dosyasını güncelle.
Başarıyla tamamlanınca dosyayı sil.

---

## Ön Koşul Kontrolü

`project-state.md` dosyasını proje kökünde oku. Varsa:
- `cikti_formati`, `token_dosyasi`, `figma_linki` ve üretilen dosyaları buradan al
- Aşağıdaki manuel kontrolleri atla

`project-state.md` yoksa aşağıdaki dosyaları manuel kontrol et:

| Dosya | Zorunlu mu? |
|-------|-------------|
| `spec.md` | Evet |
| `[proje-adı]-tokens.json` | Evet |
| `components/` veya `screens/` klasörü | En az biri |

Herhangi biri eksikse dur:
> "`[eksik dosya]` bulunamadı. Önce `/spec-intake`, `/token-generator` ve `/design-strategy` adımlarını tamamlayın."

---

## Adım 1 — İsteği Al

Kullanıcıya sor:
> "Ne değiştirmek veya eklemek istiyorsunuz?"

Yanıtı al. Adım 2'ye geç.

---

## Adım 2 — Büyüklüğü Değerlendir

İsteği şu kriterlere göre değerlendir:

**Küçük değişiklik** — tek bir component veya ekranı etkiliyor, yeni akış gerektirmiyor:
- Renk, tipografi, boşluk düzenlemesi
- Tek bir component'a eleman ekleme
- Mevcut bir ekranın içeriğini güncelleme
→ **Adım 3A**'ya geç

**Büyük özellik** — birden fazla component veya ekran gerektiriyor, yeni user flow içeriyor:
- Yeni ekran ekleme
- Çok adımlı akış tasarımı
- Yeni component grubu
→ **Adım 3B**'ye geç

Sınırda kalıyorsa büyük kabul et.

---

## Adım 3A — Küçük Değişiklik (Direkt Uygula)

`design-builder` agent'ını çalıştır. Şunları ilet:
- Kullanıcının değişiklik isteği
- Hangi dosyanın etkileneceği (`components/` veya `screens/` altındaki ilgili dosya)
- `[proje-adı]-tokens.json` yolu
- Mevcut çıktı formatı (html veya figma — `design-plan.md`'den oku)

Builder değişikliği uygular, etkilenen dosyayı günceller.

### Review — Etki Bazlı

Builder'ın güncellediği dosya sayısını say:

**1 dosya etkilendiyse — hafif review:**
Yalnızca değiştirilen dosyayı kontrol et:
- Token değerleri doğru bağlanmış mı?
- AI tells yasak deseni girilmiş mi?
- WCAG AA kontrast korunuyor mu?

Sorun yoksa devam et. Sorun varsa `design-builder`'a tek düzeltme geçi yap.

**2+ dosya etkilendiyse — tam review:**
`design-reviewer` ve `ux-reviewer`'ı paralel çalıştır.
Bulgular varsa tek bir revision pass uygula.

`design-plan.md` varsa `## Geliştirme Backlog'u` bölümüne tamamlanmış olarak ekle:
```
- [x] [Tarih] Küçük düzenleme: [kullanıcının isteği]
```

---

## Adım 3B — Büyük Özellik (Planla ve Uygula)

### Plan

`design-planner` agent'ını **iterasyon modunda** çalıştır. Şunları ilet:
- Kullanıcının özellik isteği
- `spec.md` içeriği
- `[proje-adı]-tokens.json` yolu
- Mevcut çıktı formatı
- **Mod:** `iterasyon` — planner yeni görevleri `design-plan.md`'nin `## Geliştirme Backlog'u` bölümüne yazar, `## İlk Tasarım` bölümüne dokunmaz

Planner şunları üretir:
- Özelliği görevlere böler (katman sırasına göre)
- User flow boşluklarını tespit eder
- Kullanıcıya onaylatır

### Onay

Kullanıcıdan onay al:
> "Bu özellik için [n] görev planlandı. [design-plan.md → Geliştirme Backlog'u bölümünde görebilirsiniz.]
> Başlayalım mı?"

### Uygula

Onay gelince `design-builder` agent'ını çalıştır:
- `design-plan.md`'nin `## Geliştirme Backlog'u` bölümündeki yeni görevler
- `[proje-adı]-tokens.json` yolu
- Mevcut çıktı formatı

Builder görevleri sırayla işler; tamamlananları `[x]` olarak işaretler.

### Review

Büyük özellik tamamlandıktan sonra `design-reviewer` ve `ux-reviewer`'ı paralel çalıştır.
Bulgular varsa tek bir revision pass uygula.

---

## Adım 4 — Tamamlama Raporu

```
✓ Proje: [proje adı]
✓ Değişiklik: [kullanıcının isteği özeti]
✓ Etkilenen dosyalar: [liste]
✓ Backlog durumu: [n] tamamlandı / [n] bekliyor
```

Bekleyen görev varsa kullanıcıya bildir:
> "`design-plan.md` → Geliştirme Backlog'u bölümünde [n] görev daha var. Devam etmek için `/iterate` çalıştırın."

---

## Kısıtlamalar

- `spec.md`'yi değiştirmez
- `## İlk Tasarım` bölümüne dokunmaz
- Framework dönüşümü yapmaz (React, Vue, React Native — ileride eklenecek)
