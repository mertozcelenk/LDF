---
name: spec-intake
description: Sıfırdan bir tasarım/design system projesine başlarken yapılandırılmış bir design spec toplamak için kullanılır. "Yeni bir proje başlıyoruz", "sıfırdan tasarım", "yeni design system kuracağız" gibi taleplerde tetiklenir. Var olan bir design system'e yeni bir çalışma eklemek için KULLANILMAZ — o ayrı bir context-scanner + impact-analysis akışıyla (var olan sisteme ekleme senaryosu) ele alınır.
---

# Spec Intake — Sıfırdan Tasarım

## Doğrulama İlkesi — Hiçbir Şeyi Varsayma
Kullanıcının söylemediği bir şeyi (referans dosyanın içeriği, bir
görselin rengi vb.) varsayarak spec'e yazma — gerçekten incelenip
doğrulanmadıysa "doğrulanmadı"/"tahmini" diye işaretle.

## Amaç
Tasarım/kodlama çalışması başlamadan önce, projeyi net bir şekilde tanımlayan
yapılandırılmış bir spec dokümanı üretmek. Bu spec, sonraki adımda design token
üretimi, IA/akış tasarımı ve component planlamasının referans noktası olur.

**v2 değişikliği:** Spec artık `token_directives` meta bloğu içeriyor. Bu blok,
token-generator'ın kaynak güven değerlendirmesini spec aşamasında çözüp
doğrudan üretime geçmesini sağlayan makine-okunabilir direktifler içerir.

## Ne zaman tetiklenir
- Kullanıcı yeni bir proje/ürün/design system'e sıfırdan başladığını belirtiyor
- Henüz var olan bir Figma dosyası/component seti referans alınmıyor (varsa bile
  sadece **ilham** amaçlı — bkz. Referans Girdiler)

## Akış

Soruları tek tek veya küçük gruplar halinde sor; kullanıcıyı tek seferde uzun bir
formla boğma. Cevap "bilmiyorum" veya "sonra kararlaştırırız" ise alanı `TBD` olarak
işaretleyip devam et — spec'in tamamlanmamış olması akışı durdurmamalı.

**Cevaplanmayan alanlar:** Kullanıcı bir grup soruya cevap verirken bazı alanları
atlarsa, o alanı hemen tekrar sorma — akışı bölmemek için önce devam et. Bir
sonraki turda yeni soruyla birlikte nazikçe hatırlat. Yine cevap gelmezse `TBD`
olarak işaretle.

**"Açık Sorular / TBD" bölümüne sahte madde ekleme.** Bu bölüm sadece
gerçekten sorulmuş ama cevaplanmamış alanları içerir.

### 1. Ortak Bağlam
- Proje adı / kısa tanım
- Amaç ve hedef kullanıcı kim
- Platform (web / mobile / her ikisi) ve teknik altyapı (Figma + Token Studio +
  Code Connect zinciri kullanılacak mı)
- **Renk şeması desteği**: sadece açık tema mı, sadece koyu tema mı, yoksa
  ikisi de mi? Bu, token mimarisini doğrudan etkiliyor — atlanmaması gereken
  temel bir soru
- Başarı kriterleri — bu iş "bitti" ne zaman sayılır
- Erişilebilirlik gereksinimi (varsayılan: WCAG AA, aksi belirtilmedikçe)

### 2. Sıfırdan Tasarıma Özel Alanlar

**Estetik Yön Soruları**

Bu dört soruyu sırayla sor. Her soru için seçenekleri listele ama serbest yanıta
da açık olduğunu belirt. Kullanıcı font adı, hex kodu veya stil kelimesi verirse
`aesthetic_directives.user_explicit`'e kaydet — bu değerler filtrelerden muaf tutulur.
Seçenek seçilirse `ai_inferred` olarak işaretlenir.

**S1 — Genel dil**
> "Tasarımın genel dili nasıl olsun?"
> `[ ] Minimal / editorial` `[ ] Sıcak / organik` `[ ] Teknik / fonksiyonel` `[ ] Cesur / deneysel`
> *Ya da direkt yaz: "japandi", "brutalist", "y2k" vb.*

**S2 — Görsel yoğunluk**
> "Görsel yoğunluk nasıl olsun?"
> `[ ] Az eleman, çok boşluk (low density)` `[ ] Dengeli` `[ ] Bilgi yoğun (high density)`

**S3 — Tipografi karakteri**
> "Font kişiliği nasıl olsun?"
> `[ ] Geometrik sans-serif` `[ ] Humanist sans-serif` `[ ] Serif / editorial` `[ ] Monospace / teknik`
> *Ya da direkt font adı yaz: "Söhne", "Canela", "GT Alpina" vb.*
> Font adı verilirse → `aesthetic_directives.user_explicit.fonts`'a kaydet.

**S4 — Renk yaklaşımı**
> "Renk nasıl kullanılsın?"
> `[ ] Nötr + tek güçlü accent` `[ ] Sınırlı palet (2-3 renk)` `[ ] Zengin / çok renkli`
> *Ya da direkt değer yaz: "#1a1a2e", "warm cream tones", "deep forest green" vb.*
> Renk değeri verilirse → `aesthetic_directives.user_explicit.colors`'a kaydet.

Tüm yanıtlar (seçilen seçenekler + serbest metinler) `aesthetic_directives`'e yazılır.
Kullanıcı herhangi bir soruya "bilmiyorum" veya cevap vermezse `TBD` bırak — tahmin yapma.

- Marka/ton yönü — yukarıdaki dört soruya ek olarak, kullanıcının verdiği yanıtta
  **stil kelimesi** geçiyorsa `aesthetic_directives.user_explicit.styles`'a kaydet.
  Örnekler: "brutalist stil", "mor accent", "çok renkli olsun".
- Bilgi mimarisi (IA) ve temel kullanıcı akışları (üst düzey, detay değil)
- Design system'in kaynağı:
  - **Sıfırdan Kurulacak** — tamamen yeni, mevcut hiçbir sisteme dayanmıyor
  - **Kurumsal Kimlik Kılavuzu Var** — marka renkleri ve fontları kılavuzdan gelecek,
    spacing/component/semantic yapı sıfırdan kurulacak
  - **Foundation'dan Türetilecek** — var olan bir foundation/kütüphaneden türetilecek
- İlk kapsam: hangi ekranlar/component'lar MVP'de var

**Etiketleme kuralı:**
- Kaynak **Sıfırdan Kurulacaksa** → tüm referans girdiler `inspiration`
- Kaynak **Kurumsal Kimlik Kılavuzu** ise:
  - Kılavuz → `constraint` (marka renkleri ve fontları için)
  - Estetik görseller → `inspiration`
  - `trust_profile`: `partial` — korunan katmanlar: `colors`, `typography`
  - token-generator'a `brand-guide` modu olarak iletilir (bkz. Adım 2.5b)
- Kaynak **Foundation'dan Türetilecekse** → foundation'a ait girdiler `constraint`,
  ayrıca eklenen estetik görseller `inspiration`
- Belirsizse kullanıcıya sor: "Bu referans birebir mi kullanılacak (constraint),
  yoksa sadece ilham mı (inspiration)?"

### 2.5a. Kurumsal Kimlik Kılavuzu (seçilirse zorunlu)

Kaynak **Kurumsal Kimlik Kılavuzu** seçildiyse şunu sor:

> "Kılavuzu paylaşabilir misiniz? PDF, link veya değerleri liste olarak verebilirsiniz."

Kılavuz sağlanırsa `reference-ingest` skill'ini çalıştır. Çıkarılacaklar:
- Marka renkleri (hex / RGB) → `reference_derived`, korunan katman
- Marka fontları (font adı) → `reference_derived`, korunan katman
- Ton ve ses yönü → spec'in "Marka / Ton" bölümüne yaz
- Fotoğraf / illüstrasyon yönü → `inspiration_images_trust: reference_only`

Ardından kullanıcıya göster:

> "Kılavuzdan şu değerleri çıkardım: [liste]. Bunların tamamı token'lara
> binding şekilde geçsin mi, yoksa bazıları sadece yön olarak kullanılsın mı?"

| Kullanıcı yanıtı | Davranış |
|---|---|
| Tamamı binding | Renk + font → `user_explicit`'e taşı |
| Kısmen binding | Hangilerinin binding olduğunu netleştir, geri kalanı `reference_derived` kalır |
| Sadece yön | Tüm değerler `reference_derived` + `confidence: "directional"` |

`token_directives`'e ekle:
```yaml
brand_guide_mode: true
brand_guide_source: "[dosya adı veya link]"
preserved_layers: ["colors", "typography"]
```

### 2.5b. Kaynak Güvenilirliği (constraint etiketinde zorunlu)

Design Token Library etiketi `constraint` ise şunu sor:

> "Bu kaynağa ne kadar güveniyorsunuz? Başka bir ekip mi hazırladı,
> bilinen sorunlar var mı?"

Cevaba göre `token_directives.trust_profile` belirle:

| Kullanıcı ne söyledi | `trust_profile` |
|---------------------|-----------------|
| Tam güven, birebir kullanalım | `full` |
| X'i koru, Y'yi yeniden yap | `partial` |
| Sadece genel yönü al | `directional` |
| Cevap yok | `full` (token-generator adım 0'da tekrar sorar) |

`partial` seçilirse korunan ve yeniden tasarlanacak katmanları netleştir;
`redesign_notes` alanına sebebini kaydet (örn. bilinen mimari sorunlar,
tutarsızlıklar, güvensizlik nedenleri).

**Referans ekran görüntüleri için kaynak notu:**
Kullanıcı görselleri "müşteri sağladı" veya "AI ile üretildi" olarak
nitelendirirse bunu `inspiration_images_trust: reference_only` olarak işaretle.
Kullanıcı herhangi bir nitelendirme yapmadan görsel sağlarsa varsayılan
`reference_only` olarak işaretle — boş bırakma. Kullanıcı "bu birebir
uygulanacak" derse `faithful` kullan.
Bu, token-generator'a ve showcase üretimine yön verir: görseller fikir için
kullanılır, birebir kopyalanmaz.

### 3. Referans Girdiler (opsiyonel — checklist gibi sor)
Kullanıcıya şu dördünü sor, hiçbiri zorunlu değil:
- [ ] Design token library (dosya/link)
- [ ] Örnek tasarım ekran görüntüleri
- [ ] Component Showcase linki/görseli
- [ ] **Icon set** — kullanılması istenen belirli bir icon seti var mı?
  Kaynağı üç şekilde olabilir: yerel bir klasör/dosya (SVG/icon font),
  bir Figma dosyası (icon library sayfası), veya bir website (örn.
  Lucide, Heroicons, Font Awesome gibi bir icon kütüphanesi linki).
  Hangisi olduğuna göre işleme yöntemi değişir — dosyaysa doğrudan
  incele, Figma'ysa `get_metadata`/`get_variable_defs` ile tara,
  website'yse basitçe kütüphanenin adını/paketini not al. Belirtilmezse
  `TBD` bırak — generic bir icon seti varsayıp geçme.
  **Zamanlama:** Icon set spec'e kaydedilir ama `Primitives.icon` token'ı
  token-generator'ın component aşamasında, ilk icon kullanan component
  işlenirken üretilir.

Herhangi biri sağlanırsa **`reference-ingest` skill'ini** belirlenen modda
çalıştır. Çıktıyı spec'in ilgili alt bölümüne 9 alanlı formatta ekle.

**9 alanlı format alanları:** `kaynak`, `tür`, `label`, `güven`,
`içerik_özeti`, `tespit_edilen_değerler`, `bilinen_sorunlar`,
`işleme_notu`, `ingest_durumu`. Her alanın tam tanımı ve örnek çıktı
`skills/reference-ingest/SKILL.md` dosyasında belgelenmiştir.

## Çıktı Formatı

Aşağıdaki şablonla bir `spec.md` üret:

```markdown
# [Proje Adı] — Design Spec (Sıfırdan Tasarım)

## Amaç ve Kapsam
...

## Platform ve Teknik Kısıtlar
...

## Başarı Kriterleri
...

## Erişilebilirlik Gereksinimleri
...

## Marka / Ton
...

## Bilgi Mimarisi ve Temel Akışlar
...

## Design System Kaynağı
- [ ] Sıfırdan kurulacak
- [ ] Var olan foundation'dan türetilecek: [kaynak]

## İlk Kapsam (MVP Ekran/Component Envanteri)
...

## Referans Girdiler
### Design Token Library [constraint / inspiration]
[9 alanlı format]

### Örnek Ekran Görüntüleri [inspiration]
...

### Component Showcase
...

## Açık Sorular / TBD
...

---
<!-- BEGIN:token_directives -->
```yaml
source_label: constraint | inspiration
trust_profile: full | partial | directional
preserved_layers:
  - [korunan katmanlar — partial profilde doldurulur]
redesigned_layers:
  - [yeniden tasarlanacak katmanlar — partial profilde doldurulur]
redesign_notes: >
  [Neden yeniden tasarlanıyor — bilinen sorunlar, güvensizlik nedeni]
inspiration_images_trust: reference_only | directional | faithful
known_issues:
  - [kaynak dosyada tespit edilen mimari veya değer sorunları]
aesthetic_directives:
  user_explicit:
    fonts: []     # S3'te font adı verilmişse — örn. ["Söhne", "Canela"]
    colors: []    # S4'te renk değeri verilmişse — örn. ["#1a1a2e", "warm cream tones"]
    styles: []    # Serbest metin stil yanıtları — örn. ["brutalist", "japandi"]
  selected_options:
    language: ""  # S1 seçimi — örn. "minimal / editorial"
    density: ""   # S2 seçimi — örn. "low density"
    typography: "" # S3 seçimi (seçenek seçildiyse) — örn. "humanist sans-serif"
    color_approach: "" # S4 seçimi (seçenek seçildiyse) — örn. "nötr + tek accent"
brand_guide_mode: false   # Kurumsal kimlik kılavuzu seçildiyse true
brand_guide_source: ""    # PDF adı, link veya "kullanıcı liste verdi"
preserved_layers: []      # brand_guide_mode true ise — örn. ["colors", "typography"]
```
<!-- END:token_directives -->
```

**Not:** `token_directives` bloğu teknik handoff metadata'sıdır —
kullanıcıya gösterilen spec özetine dahil edilmez. Token-generator bu bloğu
`<!-- BEGIN:token_directives -->` ve `<!-- END:token_directives -->` sentinel'larıyla
bulur. `source_label` veya `trust_profile` boş bırakılırsa token-generator adım 0'da
tekrar sorar.

## Tamamlanma Kontrolü
Spec taslağı çıktıktan sonra kullanıcıya göster ve şunu sor: "Eksik veya
yanlış bir alan var mı, yoksa bir sonraki adıma (token üretimi / IA) geçelim mi?"

Kullanıcı onaylarsa şunu ekle: "Devam etmek için `/token-generator` komutunu
çalıştırın. Token üretimi yerine IA veya akış tasarımına geçmek isterseniz
bunu belirtin."
