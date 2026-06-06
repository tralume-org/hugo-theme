---
title: 提示框（Admonitions）
weight: 70
date: '2026-06-06T00:00:00+08:00'
---

Tralume 支援在 Markdown 內容中使用 GitHub 風格的提示框。使用 `> [!TYPE]` 語法來渲染帶有適當圖示和顏色的醒目提示區塊。

## 語法

```markdown
> [!NOTE]
> 這是一個備註提示框。

> [!WARNING]
> 這是一個警告提示框。
```

## 支援的類型

| 類型 | 圖示 | 用途 |
|------|------|---------|
| `[!NOTE]` | info | 一般資訊 |
| `[!TIP]` | tips_and_updates | 有用的建議 |
| `[!IMPORTANT]` | priority_high | 重要資訊 |
| `[!WARNING]` | warning | 需要注意的事項 |
| `[!CAUTION]` | warning | 潛在風險 |
| `[!DANGER]` | dangerous | 嚴重警告 |

## 自訂標題

你可以在類型後面附加文字來覆蓋預設標題：

```markdown
> [!NOTE]+ 我的自訂標題
> 提示框的內容。
```

## 國際化

提示框標題使用下列 i18n 金鑰。預設值如下：

| 類型 | i18n 金鑰 | 預設值（en-US） |
|------|----------|-----------------|
| `note` | `calloutNoteLabel` | Note |
| `tip` | `calloutTipLabel` | Tip |
| `important` | `calloutImportantLabel` | Important |
| `warning` | `calloutWarningLabel` | Warning |
| `caution` | `calloutCautionLabel` | Caution |
| `danger` | `calloutDangerLabel` | Danger |

你可以透過在網站的 `i18n/` 目錄中覆蓋這些金鑰，來自訂各語言的標籤。
