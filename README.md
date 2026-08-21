# LDF — Large Design Framework

Claude Code skill ve agent kütüphanesi. Tasarım sistemi projelerinde
token üretimi, spec alma ve kaynak tarama akışlarını standartlaştırır.

## Yapı

```
skills/          Claude Code skill'leri (/skill-adı ile tetiklenir)
agents/          Skill'lerin spawn ettiği subagent tanımları
```

## Skill'ler

| Skill | Tetikleyici | Açıklama |
|-------|------------|----------|
| `spec-intake` | `/spec-intake` | Yeni projeye başlarken yapılandırılmış design spec toplar |
| `token-generator` | `/token-generator` | spec.md'den W3C DTCG token seti üretir |
| `context-scanner` | `/context-scanner` | Var olan bir sistemi (web/Figma) tarar |
| `impact-analysis` | `/impact-analysis` | Var olan sisteme ekleme senaryosunda etki analizi yapar |
| `token-layer-builder` | `/token-layer-builder` | Token katmanlarını adım adım inşa eder |

## Agent'lar

| Agent | Çağıran | Açıklama |
|-------|---------|----------|
| `token-generator-worker` | token-generator | Figma'dan ham token verisi çeker (fallback zinciriyle) |
| `context-scanner-worker` | context-scanner | Web ve Figma kaynaklarını tarar |

## Kullanım

Bu repo'daki dosyaları projenin `.claude/skills/` ve `.claude/agents/`
klasörlerine kopyala. Claude Code skill'leri otomatik olarak tanır.

```
.claude/
  skills/
    spec-intake/SKILL.md
    token-generator/SKILL.md
    ...
  agents/
    token-generator-worker.md
    context-scanner-worker.md
```
