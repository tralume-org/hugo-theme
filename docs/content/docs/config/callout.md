---
title: Callouts (Admonitions)
weight: 70
date: '2026-06-06T00:00:00+08:00'
---

Tralume supports GitHub-style alert callouts in Markdown content. Use the `> [!TYPE]` syntax to render highlighted note blocks with appropriate icons and colors.

## Syntax

```markdown
> [!NOTE]
> This is a note callout.

> [!WARNING]
> This is a warning callout.
```

## Supported types

| Type | Icon | Purpose |
|------|------|---------|
| `[!NOTE]` | info | General information |
| `[!TIP]` | tips_and_updates | Helpful advice |
| `[!IMPORTANT]` | priority_high | Key information |
| `[!WARNING]` | warning | Something to be aware of |
| `[!CAUTION]` | warning | Potential risk |
| `[!DANGER]` | dangerous | Critical warning |

## Custom title

You can override the default title by appending text after the type:

```markdown
> [!NOTE]+ My Custom Title
> Content of the callout.
```

## i18n

Callout titles use the following i18n keys. The defaults are:

| Type | i18n Key | Default (en-US) |
|------|----------|-----------------|
| `note` | `calloutNoteLabel` | Note |
| `tip` | `calloutTipLabel` | Tip |
| `important` | `calloutImportantLabel` | Important |
| `warning` | `calloutWarningLabel` | Warning |
| `caution` | `calloutCautionLabel` | Caution |
| `danger` | `calloutDangerLabel` | Danger |

You can override these in your site's `i18n/` directory to customize the labels per language.
