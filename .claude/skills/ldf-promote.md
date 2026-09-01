---
name: ldf-promote
description: Sunum için üretilmiş HTML/CSS çıktısını gerçek bir projeye dönüştürür. Mevcut spec.md, tokens.json ve HTML/CSS dosyalarını okuyarak kullanıcıya tek bir soru sorar — HTML/CSS olarak mı devam edilecek yoksa Figma'ya mı aktarılacak — ve seçime göre pipeline'ı başlatır.
---

# Promote — Sunumdan Gerçek Projeye

## Durum Yönetimi

Başlamadan önce mevcut state dosyasını kontrol et:
```bash
ls /tmp/ldf-promote-*.json 2>/dev/null
```
Dosya varsa kullanıcıya "kaldığım yerden devam et / yeni başlat" sor.
Her adım tamamlandığında `/tmp/ldf-promote-{RUN_ID}.json` dosyasını güncelle.
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

Herhangi biri eksikse dur ve kullanıcıya söyle:
> "`[eksik dosya]` bulunamadı. `/ldf-spec-intake` ve `/ldf-design-strategy` adımlarının tamamlanmış olması gerekiyor."

---

## Adım 1 — Mevcut Çıktıyı Oku

`project-state.md` varsa oradan al; yoksa `spec.md`'den proje adını al.
`[proje-adı]-tokens.json` dosyasını oku; `source: "ai_inferred"` olan token'ları listele.
`project-state.md`'deki dosya listesini kullan; yoksa `components/` ve `screens/` klasörlerini tara.

---

## Adım 2 — Tek Soru

Kullanıcıya sor:

> "**[Proje adı]** onaylandı, tebrikler! Şimdi gerçek projeye geçelim.
>
> Çıktıyı nasıl ilerletmek istiyorsunuz?
>
> `[ ] HTML/CSS olarak devam — mevcut dosyalar temizlenir ve üretim kalitesine getirilir`
> `[ ] Figma'ya aktar — tasarımlar Figma dosyasına taşınır`"

---

## Adım 3A — HTML/CSS Yolu

### Token Doğrulama

`ai_inferred` token varsa kullanıcıya göster:

> "Sunum sırasında bazı değerler tahmini olarak üretildi. Gerçek projeye geçmeden önce bunları doğrulamanızı öneririm:
>
> [ai_inferred token listesi — her biri için: isim, mevcut değer]
>
> Bu değerleri güncellemek ister misiniz? `[ ] Evet` `[ ] Hayır, olduğu gibi devam`"

Evet denirse → `token-generator` skill'ini güncelleme modunda çağır; kullanıcıdan gerçek değerleri topla.

### HTML/CSS Temizleme

Mevcut `components/` ve `screens/` dosyalarını şu kriterlerle yeniden üret:

- Inline stil kullanma — tüm stiller ayrı CSS dosyasına taşı
- CSS custom property'leri token dosyasındaki değerlerle bağla
- Her component kendi klasöründe bağımsız çalışabilmeli
- `index.html` güncel component ve ekran listesiyle yeniden oluştur

`design-builder` agent'ını "üretim modu" talimatıyla çağır.

---

## Adım 3B — Figma Yolu

### Token Doğrulama

Adım 3A ile aynı token doğrulama adımını uygula.

### Figma Bağlantısı

Kullanıcıya sor:

> "Tasarımları eklemek istediğiniz Figma dosyasının linkini paylaşır mısınız?"

Link alındıktan sonra `figma-use` skill'ini çağır; `[proje-adı]-tokens.json` içindeki token'ları Figma değişkenlerine aktar, ardından `figma-generate-design` skill'ini çağırarak HTML/CSS ekranlarını Figma frame'lerine dönüştür.

Figma bağlantısı başarısız olursa → `reference-ingest`'teki Chrome kontrol akışını uygula.

---

## Adım 4 — Tamamlanma Raporu

Her iki yol sonunda kullanıcıya özet ver:

```
✓ Proje: [proje adı]
✓ Çıktı: [HTML/CSS | Figma]
✓ Token'lar: [kaç tanesi doğrulandı / kaç tanesi ai_inferred kaldı]
✓ Dosyalar: [üretilen / güncellenen dosya listesi]
```

`ai_inferred` kalan token varsa uyar:
> "Aşağıdaki token'lar hâlâ tahmini değer içeriyor. İleride `/ldf-token-generator` ile güncelleyebilirsiniz: [liste]"

---

## Kısıtlamalar

- Framework dönüşümü yapmaz (React, Vue, React Native — ileride eklenecek)
- Yeni component tasarlamaz — mevcut çıktıyı yeniden yapılandırır
- spec.md'yi değiştirmez
