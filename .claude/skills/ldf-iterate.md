---
name: ldf-iterate
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
> "`[eksik dosya]` bulunamadı. Önce `/ldf-spec-intake`, `/ldf-token-generator` ve `/ldf-design-strategy` adımlarını tamamlayın."

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
- **Tipografi ve kontrast (her zaman zorunlu):**
  - Body/label/caption metinleri ≥ 14px mi? (önerilen ≥ 16px)
  - `font-size` değerleri doğrudan pixel olarak belirtilmiş mi, yoksa token'a mı bağlı?
  - Metin rengi ile arka plan rengi arasındaki kontrast oranı WCAG AA karşılıyor mu? (normal metin ≥ 4.5:1, büyük metin ≥ 3:1)
  - Kontrast değerlerini token JSON'dan veya hesaplayarak doğrula; "büyük ihtimalle uyuyor" kabul etme.

Sorun varsa `design-builder`'a tek düzeltme geçi yap, ardından yukarıdaki kontrolleri tekrar çalıştır (kontrast/boyut değerleri gerçekten düzelmiş mi doğrula).
Sorun yoksa devam et.

**2+ dosya etkilendiyse — tam review:**
`design-reviewer` ve `ux-reviewer`'ı paralel çalıştır.
Bulgular varsa tek bir revision pass uygula.
Revision pass sonrası `design-reviewer`'ı tek başına tekrar çalıştır ve yalnızca önceki Blocker/High bulgularının kapatıldığını doğrula; yeni sorun rapor etmesine gerek yok.

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

### Token Kapsam Kontrolü

Onay alındıktan sonra, UX tasarımına geçmeden önce planner'ın oluşturduğu component listesini mevcut `[proje-adı]-tokens.json` ile karşılaştır:

- Listede yeni bir component tipi var mı (mevcut token'larda karşılığı olmayan avatar, chip, modal, indeks şeridi vb.)?
- Varsa kullanıcıya bildir:

> "Bu özellik için [yeni component listesi] mevcut token setinde tam karşılığı olmayan değerler içerebilir. Devam etmeden önce `/ldf-token-generator` çalıştırmanızı öneririm — eksik token'lar eklensin mi?"

Kullanıcı evet derse: `/ldf-token-generator` çalıştırılana kadar bekle, ardından devam et.
Kullanıcı hayır derse veya yeni component tipi yoksa: doğrudan UX tasarımına geç.

### UX Tasarımı

Onay gelince önce `ux-designer` agent'ını çalıştır. Şunları ilet:
- Backlog'a eklenen yeni görevler
- `spec.md` içeriği
- `[proje-adı]-tokens.json` yolu

Agent her görev için UX pattern seçer ve spec'i `design-plan.md`'ye ekler.

### Uygula

UX spec'ler tamamlanınca `design-builder` agent'ını çalıştır:
- `design-plan.md`'nin `## Geliştirme Backlog'u` bölümündeki yeni görevler
- `[proje-adı]-tokens.json` yolu
- Mevcut çıktı formatı

Builder görevleri sırayla işler; tamamlananları `[x]` olarak işaretler.

### Review

Büyük özellik tamamlandıktan sonra `design-reviewer` ve `ux-reviewer`'ı paralel çalıştır.
Bulgular varsa tek bir revision pass uygula.
Revision pass sonrası `design-reviewer`'ı tek başına tekrar çalıştır ve yalnızca önceki Blocker/High bulgularının kapatıldığını doğrula; yeni sorun rapor etmesine gerek yok.

---

## Adım 4 — Tamamlama Raporu

```
✓ Proje: [proje adı]
✓ Değişiklik: [kullanıcının isteği özeti]
✓ Etkilenen dosyalar: [liste]
✓ Backlog durumu: [n] tamamlandı / [n] bekliyor
```

Bekleyen görev varsa kullanıcıya bildir:
> "`design-plan.md` → Geliştirme Backlog'u bölümünde [n] görev daha var. Devam etmek için `/ldf-iterate` çalıştırın."

**Çapraz sayfa hatırlatması:** Etkilenen dosya sayısı 2 veya daha fazlaysa rapora şunu ekle:
> "Birden fazla sayfada değişiklik yapıldı. Sunum öncesinde tutarlılık kontrolü için `/ldf-check` çalıştırmanızı öneririm."

---

## Adım 5 — Bağlayıcı Karar Kontrolü

Tamamlama raporundan sonra şunu sor:

> "Bu iterasyonda kalıcı bir tasarım kararı aldık mı? (örn. 'X hep böyle kalacak', 'Y artık kullanılmayacak')"

Kullanıcı evet derse veya konuşmada açıkça bağlayıcı bir karar geçtiyse:
- `spec.md`'nin `## Bağlayıcı Kararlar` bölümünü oku
- Bölüm yoksa oluştur
- Kararı şu formatta ekle:

```
- [Tarih] [Karar] — [bağlam: hangi component, neden]
```

Örnek:
```
- [2026-09-02] Navigation arka planı hep --color-nav-bg token'ı ile kalacak, hardcode renk kullanılmayacak — sidebar yeniden tasarımı sırasında kararlaştırıldı
- [2026-09-02] Kartlarda box-shadow kullanılmayacak — flat design yönü benimsendi
```

Kaydettikten sonra bildir:
> "`spec.md → Bağlayıcı Kararlar` bölümüne eklendi. Bir sonraki konuşmada tüm agent'lar bu kararı otomatik olarak uygular."

---

## Kısıtlamalar

- `spec.md`'nin `## Bağlayıcı Kararlar` bölümü dışında spec.md'yi değiştirmez
- `## İlk Tasarım` bölümüne dokunmaz
- Framework dönüşümü yapmaz (React, Vue, React Native — ileride eklenecek)
