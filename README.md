# LDF — Large Design Framework

Claude Code skill ve agent kütüphanesi. Tasarım sistemi projelerinde
token üretimi, spec alma, kaynak tarama ve referans işleme akışlarını standartlaştırır.

## Kurulum

Repoyu doğrudan projenin köküne klonla — `.claude/` dizini Claude Code tarafından otomatik tanınır, başka bir kurulum adımı gerekmez.

```bash
git clone https://github.com/mertozcelenk/LDF.git .
```

Mevcut bir projeye eklemek istersen yalnızca `.claude/` klasörünü kopyala:

```bash
cp -r LDF/.claude /projenin/koku/.claude
```

## Hızlı Test

Sıfırdan bir test projesi kurmak için:

```bash
# 1. Boş bir klasör oluştur ve içine gir
mkdir benim-projem && cd benim-projem

# 2. LDF'yi kur
git clone https://github.com/mertozcelenk/LDF.git .

# 3. Claude Code'u bu klasörde başlat
claude .
```

Claude Code açıldıktan sonra:

```
/spec-intake          # Spec toplamaya başla
/token-generator      # Spec tamamlanınca token üret
/design-strategy      # Token hazırsa tasarıma geç
```

**Figma çıktısı için:** Figma desktop uygulamasında **Plugins → Claude Code** eklentisini aç ve Claude Code ayarlarında Figma MCP sunucusunu etkinleştir. Kurulu değilse pipeline otomatik olarak HTML/CSS çıktısına geçer.

## Dosya Sözleşmesi

Pipeline boyunca tüm dosyalar proje kökünde oluşturulur:

| Dosya | Hangi skill üretir |
|-------|--------------------|
| `spec.md` | spec-intake |
| `[proje-adı]-tokens.json` | token-generator |
| `design-plan.md` | design-planner (design-strategy içinde) |
| `components/[katman]/[ad].html` | design-builder (HTML modu) |
| `screens/[ad].html` | design-builder (HTML modu) |

## Yapı

```
.claude/
├── skills/
│   ├── spec-intake.md
│   ├── reference-ingest.md
│   ├── token-generator.md
│   ├── context-scanner.md
│   ├── impact-analysis.md
│   ├── token-layer-builder.md
│   └── design-strategy.md
└── agents/
    ├── token-generator-worker.md
    ├── context-scanner-worker.md
    ├── design-strategist.md
    ├── design-planner.md
    ├── design-builder.md
    └── design-reviewer.md
```

## Skill'ler

| Skill | Tetikleyici | Açıklama |
|-------|------------|----------|
| `spec-intake` | `/spec-intake` | Yeni projeye başlarken yapılandırılmış design spec toplar |
| `reference-ingest` | spec-intake tarafından çağrılır | Referans girdileri inceleyip 9 alanlı formatta çıktı üretir |
| `token-generator` | `/token-generator` | spec.md'den W3C DTCG token seti üretir |
| `context-scanner` | `/context-scanner` | Var olan bir sistemi (web/Figma) tarar |
| `impact-analysis` | `/impact-analysis` | Var olan sisteme ekleme senaryosunda etki analizi yapar |
| `token-layer-builder` | `/token-layer-builder` | Token katmanlarını adım adım inşa eder |
| `design-strategy` | `/design-strategy` | spec.md'den Figma veya HTML/CSS çıktısına uzanan design pipeline'ını çalıştırır |

## Agent'lar

| Agent | Çağıran | Açıklama |
|-------|---------|----------|
| `token-generator-worker` | token-generator | Figma'dan ham token verisi çeker (fallback zinciriyle) |
| `context-scanner-worker` | context-scanner | Web ve Figma kaynaklarını tarar |
| `design-strategist` | design-strategy | Kapsam, style direction ve mod kararı verir |
| `design-planner` | design-strategy (deep mod) | Component sırası + ekran akışı → design-plan.md |
| `design-builder` | design-strategy | Figma (use_figma) veya HTML/CSS çıktısı üretir |
| `design-reviewer` | design-strategy (deep mod) | Spec + token tutarlılık kontrolü, sadece raporlar |

## Tipik Akış

### Sıfırdan proje

```
/spec-intake
  └── reference-ingest (referans girdi varsa otomatik)
        ↓
/token-generator
        ↓
/design-strategy
  ├── quick mod → design-strategist → design-builder
  └── deep mod  → design-strategist → design-planner → design-builder → design-reviewer
```

### Var olan sisteme ekleme

```
/context-scanner
      ↓
/impact-analysis
      ↓
/design-strategy
```
