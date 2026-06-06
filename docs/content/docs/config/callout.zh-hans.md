---
title: 提示框 (Callout)
weight: 70
date: '2026-06-06T00:00:00+08:00'
---

Tralume 支持在 Markdown 内容中使用 GitHub 风格的提示框。使用 `> [!TYPE]` 语法渲染带图标和颜色的高亮提示块。

## 语法

```markdown
> [!NOTE]
> 这是一条普通提示。

> [!WARNING]
> 这是一条警告提示。
```

## 支持的类型

| 类型 | 图标 | 用途 |
|------|------|------|
| `[!NOTE]` | info | 一般信息 |
| `[!TIP]` | tips_and_updates | 实用建议 |
| `[!IMPORTANT]` | priority_high | 重要信息 |
| `[!WARNING]` | warning | 需要注意 |
| `[!CAUTION]` | warning | 潜在风险 |
| `[!DANGER]` | dangerous | 严重警告 |

## 自定义标题

你可以在类型后附加文本来覆盖默认标题：

```markdown
> [!NOTE]+ 我的自定义标题
> 提示框的内容。
```

## 国际化

提示框标题使用以下 i18n 键，默认为：

| 类型 | i18n 键 | 默认 (zh-Hans) |
|------|--------|-----------------|
| `note` | `calloutNoteLabel` | 注意 |
| `tip` | `calloutTipLabel` | 提示 |
| `important` | `calloutImportantLabel` | 重要 |
| `warning` | `calloutWarningLabel` | 警告 |
| `caution` | `calloutCautionLabel` | 小心 |
| `danger` | `calloutDangerLabel` | 危险 |

你可以在站点的 `i18n/` 目录中覆盖这些键，为每种语言自定义标签。
