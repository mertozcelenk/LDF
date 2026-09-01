---
name: ldf-inspect
description: Belirli bir UI elementini mekanik olarak tarar — touch target, hardcode renk, token bağlantısı, emoji ikon, label eşleşmesi. Pipeline çalıştırılmamış quick/sunum tasarımlarında da çalışır. Tam heuristic analiz için ux-reviewer'ı çağırma seçeneği sunar.
---

# LDF Inspect — Element Bazlı Mekanik Kontrol

## Hedef

Tüm pipeline'ı çalıştırmadan belirli bir UI elementini grep ile kontrol eder.
Yalnızca mekanik olarak doğrulanabilen (●) bulgular üretir — heuristic değerlendirme yapmaz.

---

## Ön Koşul Kontrolü

`project-state.md` dosyasını proje kökünde oku. Varsa:
- Üretilen dosya listesini ve çıktı formatını buradan al.

`project-state.md` yoksa `components/` ve `screens/` klasörlerini tara:
```bash
find . -name "*.html" -not -path "./.claude/*" | head -30
```

Hiç `.html` dosyası bulunamazsa dur:
> "Kontrol edilecek HTML dosyası bulunamadı. Önce `/ldf-design-strategy` ile bir tasarım çıktısı üretin veya HTML dosyalarının bulunduğu dizinde çalıştırın."

---

## Adım 1 — Element Tipini Belirle

Kullanıcı element tipini belirttiyse direkt Adım 2'ye geç.

Belirtmediyse sor:
> "Hangi elementi kontrol etmemi istersiniz?
> 1. Butonlar ve CTA'lar
> 2. Tipografi ve font boyutları
> 3. Form alanları
> 4. Navigasyon
> 5. Kartlar
> 6. Tümü"

---

## Adım 2 — Mekanik Kontroller

### Butonlar

```bash
# Hardcode renk
grep -rn "background.*#\|color.*#\|border.*#" components/ screens/ 2>/dev/null | grep -i "btn\|button"

# İkon-only buton — aria-label kontrolü
grep -rn "<button[^>]*>.*<svg\|<button[^>]*>.*<img" components/ screens/ 2>/dev/null

# Birden fazla primary CTA aynı sayfada mı?
grep -rn "class.*primary\|type=\"submit\"" components/ screens/ 2>/dev/null
```

Kontrol edilecekler:
- [ ] Buton renkleri `var(--*)` ile mi tanımlı? Hardcode `#` değer var mı?
- [ ] İkon-only butonlarda `aria-label` var mı?
- [ ] Bir sayfada birden fazla primary CTA var mı?
- [ ] Touch target: `min-height: 44px` veya padding ≥ 11px her iki yönde var mı?
  ```bash
  grep -rn "min-height\|padding" components/ screens/ 2>/dev/null | grep -i "btn\|button"
  ```

---

### Tipografi

```bash
# Hardcode font-size
grep -rn "font-size: [0-9]" components/ screens/ 2>/dev/null

# Başlık hiyerarşisi
grep -rn "<h[1-6]" components/ screens/ 2>/dev/null | sort

# Emoji ikon
grep -Prn "[^\x00-\x7F]" components/ screens/ 2>/dev/null | grep -v "charset\|lang\|meta\|<!--"
```

Kontrol edilecekler:
- [ ] Body metin font-size ≥ 16px mi? (12px altı: Blocker, 13–15px: High, 16px altı body: Medium)
- [ ] Font-size değerleri `var(--font-size-*)` veya `var(--text-*)` mi?
- [ ] Başlık hiyerarşisinde atlama var mı? (h1'den h3'e geçiş gibi)
- [ ] Emoji ikon olarak kullanılmış mı?

---

### Form Alanları

```bash
# Label–input eşleşmesi
grep -rn "<label\|<input\|<textarea\|<select" components/ screens/ 2>/dev/null

# Zorunlu alan belirtimi
grep -rn "required\|aria-required" components/ screens/ 2>/dev/null

# Placeholder-only kullanımı
grep -rn "placeholder=" components/ screens/ 2>/dev/null
```

Kontrol edilecekler:
- [ ] Her `<input>` / `<textarea>` için `<label for="">` + eşleşen `id` var mı?
- [ ] Zorunlu alanlar `required` veya `aria-required` ile belirtilmiş mi?
- [ ] Placeholder, label'ın yerini tutuyor mu? (label yoksa sorun)
- [ ] Touch target: input min-height ≥ 44px mi?
  ```bash
  grep -rn "min-height\|height.*[0-9]" components/ screens/ 2>/dev/null | grep -i "input\|field\|form"
  ```

---

### Navigasyon

```bash
# nav elementi ve role
grep -rn "<nav\|role=\"navigation\"" components/ screens/ 2>/dev/null

# Aktif sayfa işareti
grep -rn "aria-current" components/ screens/ 2>/dev/null

# İkon stili karışıklığı
grep -rn "filled\|outline\|stroke\|solid" components/ screens/ 2>/dev/null | grep -i nav
```

Kontrol edilecekler:
- [ ] Navigasyon `<nav>` veya `role="navigation"` ile sarmalanmış mı?
- [ ] Aktif sayfa `aria-current="page"` ile işaretlenmiş mi?
- [ ] Aynı nav içinde filled + outline ikon karışımı var mı?
- [ ] Alt navigasyon (mobile) — kaç öğe var? (5'ten fazlası: High)

---

### Kartlar

```bash
# Çakışan bağlantı
grep -rn "<a " components/ screens/ 2>/dev/null | grep -i card

# Görsel alt attribute
grep -rn "<img" components/ screens/ 2>/dev/null | grep -v "alt="

# Hardcode renk
grep -rn "background.*#\|border.*#" components/ screens/ 2>/dev/null | grep -i card
```

Kontrol edilecekler:
- [ ] Tıklanabilir kartlarda çakışan çoklu `<a>` var mı?
- [ ] Kart görselleri `alt` attribute içeriyor mu?
- [ ] Kart arka plan ve kenarlık renkleri `var(--*)` mi?

---

## Adım 3 — Rapor

```
## Inspect Raporu — [element tipi] / [proje adı veya dosya adı]

### Blocker  (erişilebilirlik ihlali veya kullanıcı görevi tamamlayamaz)
- [●] [ne gözlemlendi] — [dosya:satır] → [ne yapılmalı]

### High  (ciddi sorun — düzeltilmeli)
- ...

### Medium  (teknik tutarsızlık — gönderilebilir ama düzeltilmeli)
- ...

### Nitpick  (küçük, isteğe bağlı)
- Nit: ...

### Kontrol edilmedi → belirsiz
- [kontrol adı] — [neden kontrol edilemedi]
```

Tüm bulgular `●` — mekanik doğrulanmış. Bu rapor heuristic değerlendirme içermez.

Bulgu yoksa:
> "[element tipi] mekanik kontrolü tamamlandı — sorun bulunamadı."

---

## Adım 4 — Tam Analiz Seçeneği

Raporu sunduktan sonra kullanıcıya sor:

> "Mekanik kontrol tamamlandı. Heuristic analiz (Nielsen 10, WCAG POUR, component binding) için ux-reviewer'ı da çalıştırmamı ister misiniz?"

Kullanıcı onaylarsa şunları topla ve `ux-reviewer` agent'ına ilet:
- Taranan HTML dosyalarının listesi
- `spec.md` varsa yolu (yoksa bunu belirt)
- `[proje-adı]-tokens.json` varsa yolu
- Bu inspect raporundaki bulgular (ux-reviewer aynı bulguları tekrar etmez)
- `project-state.md` yoksa: "Pipeline çalıştırılmamış — spec ve brief mevcut değil"

---

## Adım 5 — Düzeltme Seçeneği

Blocker veya High bulgu varsa ve kullanıcı ux-reviewer'ı çalıştırmak istemiyorsa:

> "Bulguları düzeltmemi ister misiniz?
> `[ ] Evet, düzelt` → `/ldf-iterate` ile her bulguyu uygula
> `[ ] Hayır, raporu kaydet` → bulguları `inspect-report.md` olarak kaydet"

`inspect-report.md` formatı:
```markdown
# Inspect Raporu — [element tipi]
Tarih: [tarih]
Toplam bulgu: [n]

## Bulgular
[liste]
```

---

## Kısıtlamalar

- Yalnızca HTML/CSS modunda çalışır
- Yalnızca mekanik (●) bulgular üretir — heuristic veya ○ insan testi değerlendirmesi yapmaz
- Hiçbir şeyi kendisi düzeltmez — raporlar, `/ldf-iterate`'e veya `ux-reviewer`'a devreder
- `project-state.md` zorunlu değil — quick mod ve sunum tasarımlarında da çalışır
