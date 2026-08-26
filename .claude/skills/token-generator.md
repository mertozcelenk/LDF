---
name: token-generator
description: Tamamlanmış bir spec.md'den (spec-intake veya impact-analysis çıktısı) design token seti üretmek için kullanılır. Spec'teki Referans Girdiler'in `constraint` veya `inspiration` etiketine göre iki farklı modda çalışır. "Token oluştur", "design token üret", spec tamamlandıktan sonraki adım gibi taleplerde tetiklenir.
---

# Token Generator

## Doğrulama İlkesi — Hiçbir Şeyi Varsayma
"Muhtemelen"/"pattern'e göre" diye bir değeri doğrulamadan token setine
yazma — doğrulaması mümkünse (ek bir instance sorgusu, screenshot
karşılaştırması) doğrula. Mümkün değilse "doğrulanmadı" diye açıkça
işaretle, kesinmiş gibi sunma.

## Amaç
Tamamlanmış bir spec'ten, projenin ihtiyacına uygun bir design token seti
(W3C DTCG formatında) üretmek.

## Model Optimizasyonu — `token-generator-worker` Subagent'ı
Mekanik veri toplama (Figma variable/layer çekme, görsellerden ham stil
gözlemi) `token-generator-worker` subagent'ına devredilir.
Ana akışta kalanlar: token mimarisine karar verme, erişilebilirlik/kontrast
kontrolü, kullanıcı etkileşimi.

**Önemli — worker tool erişimi:** Worker spawn etmeden önce Figma MCP
araçlarının mevcut bağlamda erişilebilir olduğunu teyit et. Erişim yoksa
worker spawn etme — veri toplamayı doğrudan ana akışta yap. Küçük bir
modelle spawn edeceksen Figma MCP erişimini doğrula; yoksa modeli yükselt
veya ana akışta çalış.

## Girdi
Bir `spec.md` (spec-intake çıktısı). Özellikle şu bölümler okunur:
- Design System Kaynağı (sıfırdan / türetilecek)
- Referans Girdiler → Design Token Library (etiketi: `constraint`/`inspiration`)
- **`token_directives` meta bloğu** (spec-intake v2 çıktısında bulunur —
  varsa oku, yoksa adım 0'dan başla)
- Referans Girdiler → Ekran Görüntüleri / Component Showcase
- Erişilebilirlik Gereksinimleri

## Akış

### 0. Kaynak Güven Değerlendirmesi (constraint modunda zorunlu)

Spec etiketi `constraint` ise — veri çekmeye başlamadan önce — kaynak
güvenilirliğini belirle. Spec'te `token_directives.trust_profile` varsa
oku ve bu adımı atla. Yoksa kullanıcıya sor:

> "Bu kaynak dosyaya ne kadar güveniyorsunuz?
> — **Tam:** Tüm değerleri koru, sadece mimari yeniden organize et
> — **Kısmi:** Belirli katmanları koru, diğerlerini yeniden tasarla (hangilerini belirtin)
> — **Yönsel:** Sadece genel yönü al (marka renk ailesi, font), değerleri sıfırdan kur"

Cevaba göre **Constraint Profili** belirle:

| Profil | Ne korunur | Ne yeniden tasarlanır |
|--------|-----------|----------------------|
| `full` | Her şey | — |
| `partial` | Kullanıcının belirttiği katmanlar | Geri kalanlar |
| `directional` | Marka ailesi (renk tonu, font adı) | Tüm değerler |

`partial` seçilirse hangi katmanların korunacağını netleştir.
**Bu adım `inspiration` modunda atlanır.**

---

### 1. Modu belirle
Spec'teki Design Token Library etiketine ve `token_directives` bloğuna bak:
- **`constraint`** → Adım 0 → Adım 2a
- **`inspiration`** → Adım 2b
- **`brand_guide_mode: true`** → Adım 2c (brand-guide modu) → ardından Adım 2b
- Etiket yoksa → kullanıcıya sor: sıfırdan başlangıç seti mi önerilsin?

---

### 1.5. Source Assignment — Hazırlık

Veri toplamaya başlamadan önce `token_directives.aesthetic_directives.user_explicit` bloğunu oku
(spec-intake v2 çıktısında bulunur). Bu listeyi bellekte tut — veri topladıktan sonra
her token'a source atanırken kullanılacak.

**Geçerli source değerleri (yalnızca bu üçü):**

| `source` | Ne zaman atanır |
|---|---|
| `user_explicit` | Token değeri `user_explicit.fonts/colors/styles` listesiyle eşleşiyor |
| `reference_derived` | Değer 2a veya 2b'de Figma'dan / reference'dan çekildi (güven seviyesi ne olursa olsun) |
| `ai_inferred` | Agent'ın kendi kararı |

**`selected_options` bloğunu da oku:**

`token_directives.aesthetic_directives.selected_options` mevcutsa şu eşlemeyi uygula:

| `selected_options` alanı | Token üretimindeki etkisi |
|---|---|
| `language: "minimal / editorial"` | Spacing geniş tut, component'lar sade — gereksiz dekorasyon ekleme |
| `language: "sıcak / organik"` | Radius yüksek, renk tonu sıcak tarafa çek |
| `language: "teknik / fonksiyonel"` | Monospace ağırlık, neutral renk, yoğun grid |
| `language: "cesur / deneysel"` | Kontrast yüksek, asimetrik spacing değerleri |
| `density: "low density"` | Spacing scale'i geniş tut (base × 1.5) |
| `density: "high density"` | Spacing scale'i sıkıştır (base × 0.75) |
| `typography: "geometrik sans-serif"` | Geist, Outfit, Cabinet Grotesk ailesi |
| `typography: "humanist sans-serif"` | Satoshi, Plus Jakarta Sans ailesi |
| `typography: "serif / editorial"` | Playfair Display, DM Serif, Lora ailesi — Fraunces/Instrument_Serif hariç |
| `typography: "monospace / teknik"` | Geist Mono, JetBrains Mono ailesi |
| `color_approach: "nötr + tek accent"` | Gri/krem zemin, tek güçlü accent rengi |
| `color_approach: "sınırlı palet"` | 2-3 renk, her biri semantic role taşır |
| `color_approach: "zengin / çok renkli"` | Geniş primitive rampa, çoklu semantic roller |

`selected_options` değerleri `ai_inferred` token'ların üretiminde yol gösterir —
`user_explicit` değerlerin üzerinde baskı oluşturmaz.

**Not — Adım 2a'daki Figma çekim seviyeleri ve source eşlemesi:**
- Seviye 1 (`get_variable_defs`) → `reference_derived`
- Seviye 2 (`get_design_context` / css-fallback) → `reference_derived` + `"confidence": "low"` notu
- Seviye 3 (`get_screenshot` / görsel tahmin) → `reference_derived` + `"confidence": "estimated"` notu
- Seviye 4 (manuel kullanıcı girişi) → `user_explicit`

`user_explicit` token'lara isteğe bağlı `"note"` alanı ekle:
`"Normally discouraged; honored because user explicitly requested."`

---

### 2a. Constraint modu — Figma Veri Çekme

**Figma MCP Fallback Zinciri (sırayla dene, başarısız olunca bir sonrakine geç):**

**Seviye 1 — `get_variable_defs`**
Bu araç **Figma Desktop açık + aktif layer seçimi** gerektirir.
Hata alınırsa kullanıcıya belirt:
> "Figma Desktop'ta herhangi bir layer'ı seçmeniz gerekiyor."
İki denemede başarısız olursa Seviye 2'ye geç, bu araçla denemeyi bırak.

**Seviye 2 — `get_design_context`**
`get_metadata` ile sayfadaki node ID'lerini tespit et, ardından
bileşenler için `get_design_context` çağır. CSS `var(--token, fallback)`
çıktısından değerleri çıkar.

⚠️ Fallback değerleri gerçek Figma variable değerlerinden farklı olabilir.
Her çekilen değeri `"source": "reference_derived", "confidence": "low"` olarak işaretle
ve bunu token dosyasının `_meta` bölümünde belgele.

**Seviye 3 — `get_screenshot`**
Sayfa görüntüsü al, renkleri görsel olarak çıkar.
Tüm değerleri `"source": "reference_derived", "confidence": "estimated"` olarak işaretle.

**Seviye 4 — Manuel**
Yukarıdaki üç yöntem de başarısız olursa kullanıcıya sun:
a) Token değerlerini JSON veya liste olarak paylaşsın,
b) Ekran görüntüsü göndersin (değerler tahmini olacak).

**Constraint Profiline göre çekim kapsamı:**
- `full`: Tüm katmanlar için fallback zincirini uygula
- `partial`: Sadece korunan katmanlar için çek; yeniden tasarlananlar için → 2b
- `directional`: Sadece marka ailesini (dominant renk, font adı) tespit et → 2b

**Instance override çelişkisi:**
Aynı semantik rol için farklı instance'lar farklı değer gösterirse sessizce
birini seçme — çelişkiyi raporla, kullanıcıya sor.

---

### 2b. Inspiration modu / Yeniden Tasarlanan Katmanlar

Referans görselleri ve Component Showcase'i analiz et. Renk ailesini,
tipografi yönünü ve spacing ritmini gözlemle. Değerleri olduğu gibi
kopyalama — gözlemlenen yönden türeterek WCAG uyumlu, özgün değerler üret.
Çıktıyı taslak olarak sun, varsayımları açıkça belirt.

---

### 2b.5. Brand-Guide Modu (`brand_guide_mode: true`)

`token_directives.brand_guide_mode` true ise bu adım çalışır.
Korunan katmanlar: `preserved_layers` (genellikle `colors` ve `typography`).

**Korunan katmanlar için:**

`brand_guide_source`'u oku. Kaynak türüne göre değerleri çıkar:

| Kaynak | Yöntem |
|---|---|
| PDF / döküman | `reference-ingest` çıktısından renk + font değerlerini al |
| Kullanıcının listelediği değerler | Doğrudan kullan |
| Görsel (logo, materyaller) | `get_screenshot` ile görsel analiz — `confidence: "estimated"` |

Çıkarılan marka renklerini ve fontlarını kullanıcıya göster:

> "Kılavuzdan şu değerleri okudum: [liste]. Bunlar token'lara binding
> geçsin mi, yoksa bazıları sadece yön olarak kalsın mı?"

| Kullanıcı yanıtı | Source ataması |
|---|---|
| Tamamı binding | `user_explicit` |
| Kısmen binding | Belirtilenlere `user_explicit`, geri kalanına `reference_derived` |
| Sadece yön | `reference_derived` + `"confidence": "directional"` |

**Korunmayan katmanlar için (spacing, semantic yapı, component'lar):**
→ Adım 2b (inspiration modu) ile sıfırdan üret.

`_meta`'ya ekle:
```json
"brand_guide_mode": true,
"brand_guide_preserved": ["colors", "typography"],
"brand_guide_source": "[kaynak adı]"
```

---

### 2c. AI Tells Filtresi — Source Assignment Tamamlandıktan Sonra

2a ve/veya 2b tamamlandıktan sonra çalışır. **Yalnızca `source: "ai_inferred"` olan
token'lara uygulanır.** `user_explicit` ve `reference_derived` bu adımı atlar.

**Font yasakları:**
- `Inter` — varsayılan olarak yasak. Yerine öner: `Geist`, `Satoshi`, `Cabinet Grotesk`, `Outfit`
- `Fraunces`, `Instrument_Serif` — LLM'in en yaygın serif default'ları, yasak

**Renk yasakları (her brief için):**
- Pure `#000000` → off-black kullan (örn. `#111111`, `zinc-950`)
- Pure `#ffffff` → off-white kullan (örn. `#fafafa`, `#f8f8f8`)

**Renk yasakları (premium-consumer brief'lerde — cookware, wellness, artisan, luxury):**
- Background: `#f5f1ea`, `#fbf8f1`, `#faf7f1`, `#ece6db` ailesi (warm cream/bone)
- Accent: `#b08947`, `#b6553a`, `#9a2436`, `#9c6e2a` ailesi (brass/clay/oxblood)
- Yerine öner: cold luxury (silver-grey + chrome), forest (deep green + bone), cobalt + cream

**AI-purple yasağı:**
- `#7c3aed`, `#8b5cf6`, `#a855f7` — brief açıkça mor istemedikçe yasak

Yasak değer düzeltildiyse `_meta`'ya logla:
`"ai_tells_corrected": ["Inter → Geist (default ban)"]`

---

### 3. Erişilebilirlik Kontrolü + Tasarım Yetkisi

Spec'te WCAG AA veya üstü gereksinim varsa tüm metin/arkaplan
kombinasyonlarını kontrol et.

**Sorun bulunduğunda:**

**`full` constraint profili** — değiştirme yetkisi yok, kullanıcıya sor:
> "[Token] WCAG AA başarısız (X:1, minimum 4.5:1).
> En yakın uyumlu değer [hex]. Güncelleyeyim mi?"

**`partial` / `directional` / `inspiration` — yeniden tasarlanan katmana düşüyorsa:**
Kullanıcıya sormadan düzelt, `_meta`'da belgele.

Birden fazla sorun varsa hepsini listele, tek soru olarak sun.

---

### 3.5. Zorunlu Kontrol — 5 Koleksiyonlu Yapı
Token dosyasını sunmadan önce kontrol et:
- [ ] `Primitives` (color rampası, font family/weight)
- [ ] `Layout` (space, radius, stroke)
- [ ] `Color` (semantic: background, text, border — Light/Dark modları)
- [ ] `Typography` (heading, body, label, caption skalası)
- [ ] `Component` (button, input, card, modal vb.)
- [ ] **Mode:** Spec'te ikisi de destekleniyor deniyorsa her semantic token
  için Light ve Dark değeri bulunmalı

Bilgi yoksa `reconstructed` etiketiyle makul başlangıç skalası öner, atlama.

---

### 4. Token setini sun

**Persistence guard:** Token setini yazmadan önce `[proje-adı]-tokens.json`
dosyasının zaten var olup olmadığını kontrol et. Mevcutsa kullanıcıya sor:

> "`[proje-adı]-tokens.json` zaten mevcut. Üstüne yazmamı (tüm mevcut token'lar
> değişir) yoksa yeni bir dosya adıyla mı kaydedeyim?"

Kullanıcı onaylamadan mevcut dosyanın üstüne yazma.

`_meta` bölümünde belge: değer kaynakları, constraint profili, açık belirsizlikler.

---

### 5. HTML Showcase sorusu (opsiyonel — HER SEFERİNDE SOR, otomatik yapma)
Token seti onaylandıktan sonra sor:
> "Bu tokenlarla bir HTML Component Showcase oluşturayım mı?"

Evet gelirse showcase üret. Aşağıdaki kural geçerlidir:

**Referans Görsel Kullanım Kuralı:**
Referans görseller (spec'teki ekran görüntüleri, müşteri görselleri vb.)
**ilham kaynağı** olarak kullanılır — içerik yapısı, bileşen türleri ve
genel akış referans alınabilir. Ancak görsel dil tokenlardan türetilmeli;
renk, tipografi, spacing, radius değerleri token sisteminden gelmeli.
Sonuç referansla **benzer ama özgün** olmalı: birebir kopya kabul
edilmez, hedef **maksimum %75 görsel benzerlik**tir.

Bu kural, proje sıfırdan tasarlanıyorsa ve kullanıcı "bu referansı
birebir uygula" gibi açık bir yönlendirme vermemişse geçerlidir.
Kullanıcı birebir uygulama isterse kural delinebilir.

---

## Çıktı Formatı
`[proje-adı]-tokens.json`, W3C DTCG formatı (`$type`/`$value`/`$description`),
Primitives/Layout/Color/Typography/Component katmanlarıyla. `_meta` bloğu zorunlu.

Her token `"source"` alanı taşır:
```json
{
  "font-family-primary": {
    "$type": "fontFamily",
    "$value": "Inter",
    "$description": "Ana başlık fontu",
    "source": "user_explicit",
    "note": "Normally discouraged; honored because user explicitly requested."
  },
  "color-accent": {
    "$type": "color",
    "$value": "#10b981",
    "$description": "Birincil accent rengi",
    "source": "ai_inferred"
  }
}
```

`_meta` bloğuna ekle:
```json
"_meta": {
  "ai_tells_corrected": ["Inter → Geist (default ban)"]
}
```
