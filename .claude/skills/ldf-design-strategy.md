---
name: ldf-design-strategy
description: spec.md'den Figma çıktısına uzanan design pipeline'ını orkestre eder. "Tasarıma başlayalım", "bu spec'ten component üretelim", "Figma'ya atalım" gibi taleplerde tetiklenir. spec-intake tamamlanmış ve spec.md mevcut olmalıdır.
---

# Design Strategy Pipeline

## Dosya Yolları Sözleşmesi

Tüm dosyalar proje kökünde aranır ve üretilir:

| Dosya | Açıklama |
|-------|----------|
| `spec.md` | spec-intake çıktısı — proje adı buradan okunur |
| `[proje-adı]-tokens.json` | token-generator çıktısı (`spec.md`'deki proje adından türetilir, boşluklar tire olur) |
| `design-plan.md` | design-planner çıktısı |
| `components/[katman]/[ad].html` | design-builder HTML çıktısı |
| `screens/[ad].html` | design-builder HTML ekran çıktısı |

## Ön Koşul Kontrolü

`spec.md` dosyasını proje kökünde oku. Yoksa dur ve kullanıcıya söyle:
"Önce `/ldf-spec-intake` çalıştırarak proje spec'ini oluşturmanız gerekiyor."

`spec.md` mevcutsa kullanıcıya sor:

> "Bu çıktı nasıl kullanılacak?
> `[ ] Sunum veya fikir paylaşımı — hız öncelikli`
> `[ ] Gerçek tasarım süreci — kalite ve tutarlılık öncelikli`"

**Sunum / fikir paylaşımı** seçildiyse: token dosyası olmadan devam et, quick mod öner.

**Gerçek tasarım süreci** seçildiyse: proje adını okuyup `[proje-adı]-tokens.json` dosyasını ara.
Token bulunamazsa dur ve kullanıcıya söyle:
"Token seti bulunamadı. Önce `/ldf-token-generator` çalıştırın, ardından bu komutu tekrar çalıştırın."

Her iki durumda da çıktı formatını sor:

> "Tasarım çıktısı nerede oluşturulsun?
> `[ ] Figma` — Figma Desktop açık olmalı
> `[ ] HTML/CSS` — proje klasörüne dosya olarak üretilir"

**Figma seçildiyse** ek bilgi sor:
> "Figma dosyasının linkini paylaşır mısınız?"

Bu seçimi ve Figma linkini not al — tüm pipeline boyunca builder'a iletilir.

## Adım 1 — design-strategist'i çalıştır

`design-strategist` agent'ını çalıştır. Şunları ilet:
- `spec.md` içeriği (tamamı)
- Kullanıcının bu konuşmadaki isteği (hangi ekran, hangi component, genel mi)

Agent şunları döndürür:
- **Design Read** — tek satır estetik beyan
- **Estetik çakışmalar** — S1-S4 seçimleri arasında tutarsızlık varsa tasarımcıya soru
- **Alternatif yönler** — istenirse 2-3 farklı tasarım dili tarifi
- **Üst düzey kapsam** — hangi sayfalar / component grupları
- **Style direction** — çakışma çözüldükten ve alternatif seçildikten sonra
- **Önerilen mod** — `quick` veya `deep`
- **Açık sorular** — gerçekten belirsizse

Çakışma sorusu veya alternatif seçimi bekleniyorsa kullanıcının yanıtını al, ardından devam et.

## Adım 2 — Modu belirle

Öncelik sırası:
1. Kullanıcının bu konuşmada söylediği ("hızlı yap", "detaylı incele", "review atla")
2. Stratejistin önerisi

### Quick mod

`design-planner` çalıştırılmaz. `design-builder` agent'ını doğrudan çalıştır:
- Stratejist brief'i
- `spec.md` içeriği
- `[proje-adı]-tokens.json` yolu (varsa — yoksa token üretilmemiş uyarısı ver, pipeline'ı durdurma)

Çıktıyı kullanıcıya sun, pipeline tamamlandı.

### Deep mod

Adım 3'e geç.

## Adım 3 — Görev çıktısı hedefini sor

Planner'ı çalıştırmadan önce kullanıcıya sor:

> "Görev listesini nereye yazayım?
> `[ ] design-plan.md dosyası`
> `[ ] Notion board`
> `[ ] Jira`"

Kullanıcı yanıtını bekle.

**Notion seçildiyse** ek bilgi sor:
> "Notion database veya board linkini paylaşır mısınız?"

**Jira seçildiyse** ek bilgi sor:
> "Jira proje anahtarını paylaşır mısınız? (örn. `NOMA`, `KOC`)"

Bu bilgileri aldıktan sonra Adım 3b'ye geç — planner'a ilet.

## Adım 3b — design-planner'ı çalıştır (sadece deep mod)

`design-planner` agent'ını çalıştır. Şunları ilet:
- Stratejist brief'i (onaylanmış kapsam + style direction + persona + mod +
  çakışma çözümleri + seçilen alternatif yön)
- `spec.md` içeriği
- `[proje-adı]-tokens.json` yolu (varsa)
- Çıktı tipi (`figma` veya `html` — builder ile tutarlı olsun)
- **Görev çıktısı hedefi:** kullanıcının Adım 3'te verdiği yanıt (MD / Notion / Jira)
  — planner bu seçimi tekrar sormaz, doğrudan uygular

Agent şunları yapar:
- Component listesi + state'leri çıkarır
- User flow'ları üretir (karmaşık projelerde)
- Tasarımcıya onaylatır — yanıt beklenir
- Görev listesini belirlenen hedefe yazar

Planner hangi çıktı formatını seçtiyse not al — Adım 4'te builder'a iletilecek.

## Adım 3c — ux-designer'ı çalıştır (sadece deep mod)

`ux-designer` agent'ını çalıştır. Şunları ilet:
- `design-plan.md` yolu
- `spec.md` içeriği
- `[proje-adı]-tokens.json` yolu (varsa)

Agent her görev için en uygun UX pattern'i seçer, gerekçesini yazar ve
UX spec'i `design-plan.md`'ye ekler. Yalnızca gerçekten belirsiz durumlarda
kullanıcıya kısa soru sorar.

## Adım 4 — design-builder'i çalıştır (sadece deep mod)

`design-builder` agent'ını çalıştır. Şunları ilet:
- `design-plan.md` yolu (planner MD seçtiyse — UX spec'ler de dahil) **veya** Notion/Jira board referansı
  (planner Notion/Jira seçtiyse — builder görev listesini oradan okur)
- Stratejist brief'i
- `[proje-adı]-tokens.json` yolu
- Çıktı tipi (`figma` veya `html`)

Agent her görevi sırayla işler ve tamamlananları bildirir.

## Adım 5 — design-reviewer ve ux-reviewer'ı paralel çalıştır (sadece deep mod)

İki agent'ı **aynı anda** başlat — birinin bitmesini beklemeden diğerini başlat.

**design-reviewer'a ilet:**
- `design-plan.md` yolu
- Stratejist brief'i
- `spec.md` yolu
- `[proje-adı]-tokens.json` yolu
- design-builder'ın ürettiği çıktıların listesi

**ux-reviewer'a ilet:**
- `spec.md` yolu
- Stratejist brief'i (ürün tipi, persona, style direction)
- `[proje-adı]-tokens.json` yolu
- design-builder'ın ürettiği çıktıların listesi

Her ikisi de tamamlandığında bulgularını birleştir. Aynı sorunu ikisi de raporladıysa
revision pass'e tek bulgu olarak geçir — duplicate düzeltme yapılmasın.

## Adım 6 — Revision pass (sadece deep mod, bulgu varsa)

Bulgu varsa `design-builder` agent'ını **bir kez daha** çalıştır:
- Orijinal brief
- Her iki reviewer'dan gelen birleştirilmiş bulgular (duplicate'ler tekilleştirilmiş)

Tek bir revision pass yapılır — reviewer'lar tekrar çalıştırılmaz. Sonuç finaldir.

## Adım 7 — Özet

Kullanıcıya şunu bildir:
- Hangi component'lar / ekranlar üretildi
- design-reviewer ne buldu (token, spec, a11y, AI tells)
- ux-reviewer ne buldu (heuristic'ler, component binding, manuel a11y)
- Ne düzeltildi (veya "her iki reviewer'dan da bulgu yoktu")
- Figma çıktısı nerede

Özet sonunda şunu ekle:

> "Tasarımda değişiklik yapmak veya yeni özellik eklemek için `/ldf-iterate` komutunu kullanın."

---

## Bağlayıcı Karar Kontrolü

Özet sonunda şunu sor:

> "Bu süreçte kalıcı bir tasarım kararı aldık mı? (örn. 'Bu yön kesin olarak seçildi', 'X artık kullanılmayacak')"

Kullanıcı evet derse veya konuşmada açıkça bağlayıcı bir karar geçtiyse:
- `spec.md`'nin `## Bağlayıcı Kararlar` bölümünü oku
- Bölüm yoksa oluştur
- Kararı şu formatta ekle:

```
- [Tarih] [Karar] — [bağlam]
```

---

**Not:** Sunum modunda token yoksa builder serbest değerler üretir — AI tells filtresi çalışmaz, bu normaldir.
