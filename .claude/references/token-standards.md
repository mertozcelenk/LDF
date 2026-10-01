# Token Standartları

Token'a dokunan her skill ve agent bu dosyayı okur. Buradaki kurallar
pipeline genelinde bağlayıcıdır — skill kendi içinde farklı bir kural
tanımlasa bile bu dosya kazanır.

---

## Geçerli Source Değerleri

Token JSON'da `"source"` alanı yalnızca şu üç değerden birini alabilir:

| Değer | Ne zaman kullanılır |
|---|---|
| `user_explicit` | Kullanıcı değeri doğrudan belirtti (hex kodu, font adı, açık yön) |
| `reference_derived` | Değer Figma'dan veya referans materyalden çekildi |
| `ai_inferred` | Agent'ın kendi kararıyla ürettiği değer |

**Bunlar dışında hiçbir source değeri geçerli değildir.**
`user_confirmed`, `validated`, `approved`, `reviewed` gibi değerler **yasak**.
Kullanıcı bir token'ı onaylasa bile source değeri değişmez — kayıt kaynağı değişmediği için etiket değişmez.

---

## $value Kuralı — Undefined Yasağı

Hiçbir token `$value: undefined`, `$value: null` veya `$value: ""` ile dosyaya yazılamaz.

Değer üretilemiyorsa:
- Token dosyaya yazılmaz
- Açık Sorular listesine eklenir
- Kullanıcıya gösterilir

---

## Zorunlu Koleksiyonlar

Her token dosyasında şu 6 koleksiyon bulunmalıdır:

| Koleksiyon | İçerik |
|---|---|
| `Primitives` | Renk rampası, font family/weight |
| `Layout` | Spacing, border-radius, stroke |
| `Color` | Semantik: background, text, border (Light/Dark) |
| `Typography` | Heading, body, label, caption skalası |
| `Component` | Button, input, card, modal vb. |
| `Viewport` | Responsive breakpoint'ler |

---

## Tema Modları (Light / Dark)

`spec.md → token_directives.color_scheme` değerine göre:

| `color_scheme` | `Color` koleksiyonundaki semantic token'lar |
|---|---|
| `light` | Yalnızca `$value` (açık tema) |
| `dark` | Yalnızca `$value` (koyu tema değeri doğrudan `$value`'da) |
| `both` | `$value` = açık tema, `$extensions.mode.dark` = koyu tema — **ikisi de zorunlu** |

```json
"bg-default": {
  "$type": "color",
  "$value": "#fafafa",
  "$extensions": { "mode": { "dark": "#121212" } },
  "source": "ai_inferred"
}
```

- Açık tema `$value`'da kaldığı için CSS değişken adı tek kalır (`--color-bg-default`);
  builder koyu değeri `[data-theme="dark"]` bloğuna, Figma'da `Dark` moduna yazar.
- `$extensions.mode.dark` de `$value` gibi undefined/null/boş olamaz.
- Koyu tema değerleri de `source` kuralına ve kontrast kontrolüne tabidir.

---

## 4 Katı Skalası

Spec'te aksi belirtilmedikçe şu kategorilerdeki tüm sayısal değerler 4'ün katı olmalıdır:
spacing, border-radius, font-size, line-height (px ise), icon/component boyutları.

Kabul edilen değerler: 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 128…

**İstisnalar:** `user_explicit` token'lar ve spec'te açıkça farklı bir grid sistemi belirtilmişse.

---

## Viewport Koleksiyonu — Standart Breakpoint'ler

Spec'te farklı değer belirtilmediğinde kullanılacak standart set (`source: "ai_inferred"`):

| Token | Değer |
|---|---|
| `viewport-mobile` | 375px |
| `viewport-mobile-lg` | 430px |
| `viewport-tablet` | 768px |
| `viewport-desktop` | 1280px |
| `viewport-desktop-lg` | 1440px |
| `viewport-wide` | 1920px |
