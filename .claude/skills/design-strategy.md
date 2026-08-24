---
name: design-strategy
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
"Önce `/spec-intake` çalıştırarak proje spec'ini oluşturmanız gerekiyor."

## Adım 1 — design-strategist'i çalıştır

`design-strategist` agent'ını çalıştır. Şunları ilet:
- `spec.md` içeriği (tamamı)
- Kullanıcının bu konuşmadaki isteği (hangi ekran, hangi component, genel mi)

Agent şunları döndürür:
- **Kapsam** — hangi ekranlar / component'lar ele alınacak
- **Style direction** — spec.md'deki token_directives ve marka yönünden türetilmiş
- **Primary persona** — spec'teki hedef kullanıcı
- **Önerilen mod** — `quick` veya `deep` (+ tek satır gerekçe)
- **Açık sorular** — devam etmeden önce cevaplanması gerekenler

Açık sorular varsa kullanıcıya göster ve cevap bekle. Cevap geldikten sonra devam et.

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

## Adım 3 — design-planner'ı çalıştır (sadece deep mod)

`design-planner` agent'ını çalıştır. Şunları ilet:
- Stratejist brief'i (kapsam + style direction + persona)
- `spec.md` içeriği
- `[proje-adı]-tokens.json` yolu (varsa)
- Çıktı tipi (`figma` veya `html` — builder ile tutarlı olsun)

Agent `design-plan.md` üretir ve yolunu bildirir.

## Adım 4 — design-builder'i çalıştır (sadece deep mod)

`design-builder` agent'ını çalıştır. Şunları ilet:
- `design-plan.md` yolu (proje kökü)
- Stratejist brief'i
- `[proje-adı]-tokens.json` yolu
- Çıktı tipi (`figma` veya `html`)

Agent her görevi sırayla işler ve tamamlananları bildirir.

## Adım 5 — design-reviewer'ı çalıştır (sadece deep mod)

`design-reviewer` agent'ını çalıştır. Şunları ilet:
- `design-plan.md` yolu
- Stratejist brief'i
- `spec.md` yolu
- `[project-name]-tokens.json` yolu
- design-builder'in ürettiği çıktıların listesi

Agent bulgularını raporlar — hiçbir şeyi kendisi düzeltmez.

## Adım 6 — Revision pass (sadece deep mod, bulgu varsa)

`design-reviewer` bulgu bildirdiyse `design-builder` agent'ını **bir kez daha** çalıştır:
- Orijinal brief
- Düzeltilecek bulgular listesi

Tek bir revision pass yapılır — reviewer tekrar çalıştırılmaz. Sonuç finaldir.

## Adım 7 — Özet

Kullanıcıya şunu bildir:
- Hangi component'lar / ekranlar üretildi
- Reviewer ne buldu, ne düzeltildi (veya "bulgu yoktu")
- Figma çıktısı nerede

---

**Not:** Token seti henüz üretilmemişse kullanıcıyı bilgilendir ama pipeline'ı durdurma —
design-builder mevcut bilgiyle çalışır ve eksik token alanlarını açık soru olarak işaretler.
