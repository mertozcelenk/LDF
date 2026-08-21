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

## Yapı

```
.claude/
├── skills/
│   ├── spec-intake.md
│   ├── reference-ingest.md
│   ├── token-generator.md
│   ├── context-scanner.md
│   ├── impact-analysis.md
│   └── token-layer-builder.md
└── agents/
    ├── token-generator-worker.md
    └── context-scanner-worker.md
```

## Skill'ler

| Skill | Tetikleyici | Açıklama |
|-------|------------|----------|
| `spec-intake` | `/spec-intake` | Yeni projeye başlarken yapılandırılmış design spec toplar |
| `reference-ingest` | spec-intake tarafından çağrılır | Referans girdileri (token library, görsel, showcase, icon set) inceleyip 9 alanlı formatta çıktı üretir |
| `token-generator` | `/token-generator` | spec.md'den W3C DTCG token seti üretir |
| `context-scanner` | `/context-scanner` | Var olan bir sistemi (web/Figma) tarar |
| `impact-analysis` | `/impact-analysis` | Var olan sisteme ekleme senaryosunda etki analizi yapar |
| `token-layer-builder` | `/token-layer-builder` | Token katmanlarını adım adım inşa eder |

## Agent'lar

| Agent | Çağıran | Açıklama |
|-------|---------|----------|
| `token-generator-worker` | token-generator | Figma'dan ham token verisi çeker (fallback zinciriyle) |
| `context-scanner-worker` | context-scanner | Web ve Figma kaynaklarını tarar |

## Tipik Akış

```
/spec-intake
  └── reference-ingest (referans girdi varsa otomatik)
        ↓
/token-generator
        ↓
/token-layer-builder
```

Var olan bir sisteme ekleme yapılıyorsa:

```
/context-scanner
      ↓
/impact-analysis
```
