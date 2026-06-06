---
title: コールアウト（強調表示）
weight: 70
date: '2026-06-06T00:00:00+08:00'
---

Tralume は Markdown コンテンツで GitHub スタイルのアラートコールアウトをサポートします。`> [!TYPE]` 構文を使用して、適切なアイコンと色でハイライトされた注釈ブロックを表示します。

## 構文

```markdown
> [!NOTE]
> これは注釈コールアウトです。

> [!WARNING]
> これは警告コールアウトです。
```

## サポートされるタイプ

| タイプ | アイコン | 用途 |
|--------|--------|------|
| `[!NOTE]` | info | 一般的な情報 |
| `[!TIP]` | tips_and_updates | 役立つアドバイス |
| `[!IMPORTANT]` | priority_high | 重要な情報 |
| `[!WARNING]` | warning | 注意すべき事項 |
| `[!CAUTION]` | warning | 潜在的なリスク |
| `[!DANGER]` | dangerous | 重大な警告 |

## カスタムタイトル

タイプの後にテキストを追加することで、デフォルトのタイトルを上書きできます:

```markdown
> [!NOTE]+ マイカスタムタイトル
> コールアウトの内容。
```

## i18n

コールアウトのタイトルは以下の i18n キーを使用します。デフォルトは次のとおりです:

| タイプ | i18n キー | デフォルト (en-US) |
|--------|----------|-------------------|
| `note` | `calloutNoteLabel` | Note |
| `tip` | `calloutTipLabel` | Tip |
| `important` | `calloutImportantLabel` | Important |
| `warning` | `calloutWarningLabel` | Warning |
| `caution` | `calloutCautionLabel` | Caution |
| `danger` | `calloutDangerLabel` | Danger |

サイトの `i18n/` ディレクトリでこれらを上書きして、言語ごとにラベルをカスタマイズできます。
