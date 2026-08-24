# LDF — Test Rehberi

## Ortam Gereksinimleri

| Gereksinim | Zorunlu mu | Notlar |
|------------|------------|--------|
| Claude Code (claude CLI) | Evet | |
| Git | Evet | |
| Figma desktop uygulaması | Hayır | Sadece Figma çıktısı için |
| Figma Claude Code eklentisi | Hayır | Figma → Plugins → Claude Code |
| Figma MCP sunucusu (Claude Code ayarları) | Hayır | Eklentiyle birlikte etkinleştirilir |

Figma kurulu değilse tüm senaryolar HTML/CSS çıktısıyla çalışır.

---

## Test Projesi Kurulumu

```bash
mkdir ldf-test && cd ldf-test
git clone https://github.com/mertozcelenk/LDF.git .
claude .
```

---

## Senaryo 1 — Spec Intake (Temel)

**Amaç:** spec-intake'in soruları doğru sorduğunu ve spec.md ürettiğini doğrula.

**Adımlar:**
1. `/spec-intake` çalıştır
2. Soruları yanıtla — en az şunlara cevap ver:
   - Proje adı
   - Platform (web)
   - Renk şeması (sadece açık tema)
   - Design system kaynağı (sıfırdan kurulacak)
3. Referans girdi sormadan tamamla

**Başarı kriterleri:**
- [ ] `spec.md` proje kökünde oluştu
- [ ] `spec.md` içinde `<!-- BEGIN:token_directives -->` bloğu var
- [ ] `source_label` ve `trust_profile` alanları dolu veya boş ama blok mevcut
- [ ] "Devam etmek için `/token-generator` komutunu çalıştırın" mesajı gösterildi
- [ ] Açık Sorular bölümü yalnızca gerçekten sorulmuş ama cevaplanmamış alanları içeriyor

---

## Senaryo 2 — Spec Intake + Referans Girdi

**Amaç:** reference-ingest zincirinin çalıştığını ve 9 alanlı formatı ürettiğini doğrula.

**Adımlar:**
1. `/spec-intake` çalıştır
2. Referans girdi sorusunda bir Figma linki veya görsel sağla
3. Tamamla

**Başarı kriterleri:**
- [ ] `spec.md` içinde Referans Girdiler bölümü 9 alanlı formatla dolu
  (`kaynak`, `tür`, `label`, `güven`, `içerik_özeti`, `tespit_edilen_değerler`, `bilinen_sorunlar`, `işleme_notu`, `ingest_durumu`)
- [ ] `ingest_durumu` değeri `tamamlandı`, `kısmi` veya `araç_erişim_hatası` — boş değil
- [ ] `inspiration_images_trust` alanı `token_directives` bloğunda yazılmış

---

## Senaryo 3 — Token Üretimi

**Amaç:** Spec.md'den token JSON üretildiğini doğrula.

**Ön koşul:** Senaryo 1 tamamlanmış, `spec.md` mevcut.

**Adımlar:**
1. `/token-generator` çalıştır

**Başarı kriterleri:**
- [ ] `[proje-adı]-tokens.json` proje kökünde oluştu
- [ ] JSON içinde şu koleksiyonlar var: `Primitives`, `Layout`, `Color`, `Typography`, `Component`
- [ ] Her token'da `$type`, `$value`, `$description` alanları mevcut
- [ ] `_meta` bloğu var ve kaynak bilgisini içeriyor

---

## Senaryo 4 — Design Strategy (Quick Mod, HTML)

**Amaç:** Pipeline'ın quick modda HTML çıktısı ürettiğini doğrula.

**Ön koşul:** Senaryo 1 tamamlanmış, `spec.md` mevcut. Token JSON opsiyonel.

**Adımlar:**
1. `/design-strategy` çalıştır
2. "Hızlı yap" veya "quick mod" de
3. Tek bir küçük component iste (örn. "sadece bir button yap")

**Başarı kriterleri:**
- [ ] design-strategist brief döndürdü (Kapsam, Persona, Style Direction, Mod)
- [ ] design-planner çalıştırılmadı (quick modda atlanır)
- [ ] `components/atoms/button.html` veya benzeri bir dosya oluştu
- [ ] HTML dosyası CSS custom properties kullanıyor (`--color-*`, `--spacing-*` vb.)
- [ ] Dosya tarayıcıda açılabiliyor

---

## Senaryo 5 — Design Strategy (Deep Mod, HTML)

**Amaç:** Pipeline'ın deep modda planlama yapıp HTML ürettiğini doğrula.

**Ön koşul:** Senaryo 3 tamamlanmış, token JSON mevcut.

**Adımlar:**
1. `/design-strategy` çalıştır
2. "Deep mod" de veya hiçbir şey söyleme (strategist karar versin)
3. 2-3 component içeren küçük bir kapsam belirt

**Başarı kriterleri:**
- [ ] design-strategist brief döndürdü
- [ ] `design-plan.md` proje kökünde oluştu
- [ ] `design-plan.md` katman sırasına göre görev listesi içeriyor (TASK-001, TASK-002 ...)
- [ ] Her görevde `Çıktı hedefi` alanı dolu
- [ ] design-builder belirtilen HTML dosyalarını üretti
- [ ] design-reviewer bulgu raporu döndürdü (boş veya dolu — önemli değil, raporlaması yeterli)
- [ ] Bulgu varsa design-builder tek bir revision pass yaptı

---

## Senaryo 6 — Design Strategy (Figma Çıktısı)

**Ön koşul:** Figma desktop açık, Claude Code eklentisi kurulu ve MCP etkin.

**Adımlar:**
1. `/design-strategy` çalıştır
2. "Figma'ya yaz" de
3. Tek bir component iste

**Başarı kriterleri:**
- [ ] design-builder `use_figma` kullandı (Figma modunda çalıştı)
- [ ] Figma'da ilgili sayfa/frame oluştu
- [ ] Oluşturulan node ID'leri döndürüldü

---

## Senaryo 7 — Figma Kurulu Değilken Fallback

**Amaç:** use_figma olmadan HTML'e düştüğünü ve kurulum mesajı gösterdiğini doğrula.

**Ön koşul:** Figma eklentisi kurulu DEĞİL.

**Adımlar:**
1. `/design-strategy` çalıştır
2. "Figma'ya yaz" de

**Başarı kriterleri:**
- [ ] Kurulum rehberi mesajı gösterildi ("Figma Claude Code eklentisinin kurulu olması gerekiyor...")
- [ ] Pipeline durmadı, HTML çıktısına geçti
- [ ] HTML dosyası üretildi

---

## Bilinen Sınırlamalar

- **design-reviewer HTML render:** Playwright kurulu değilse reviewer kaynak analizi yapar — görsel doğrulama yapamaz, bunu açıkça belirtir.
- **Figma token aktarımı:** Token JSON'dan Figma değişkenlerine aktarım `use_figma` ile yapılır; büyük token setlerinde birden fazla `use_figma` çağrısı gerekebilir.
- **Token JSON yokken design-strategy:** Pipeline devam eder ama design-builder tahmini CSS değerleri kullanır ve bunları açık soru olarak işaretler.
