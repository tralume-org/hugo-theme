---
title: 過時內容通知
weight: 150
date: '2026-06-06T00:00:00+08:00'
---

Tralume 可以在文章頁面上自動顯示警告橫幅，當內容超過可設定的天數時。這有助於讀者了解資訊可能已不再是最新的。

## 預設行為

預設情況下，任何超過 **180 天**（約 6 個月）的文章都會在標題下方顯示內嵌的提示框：

> ⚠ 本文發佈已超過 180 天，部分資訊可能已不再適用。

預設閾值定義在主題的 partial 中（`layouts/partials/outdated-notice.html`），並適用於**所有區段**（文章、頁面等）。

## 全站閾值

若要變更全站的預設閾值，請在網站設定的 `[params]` 下新增 `outdatedThresholdDays`：

```toml
[params]
  # 注意：文章超過此天數將顯示過時通知。
  # 設為較大值會更寬鬆，設為較小值則更嚴格。
  outdatedThresholdDays = 365
```

## 逐頁覆蓋

你可以透過 Front Matter 為個別頁面覆蓋閾值：

```yaml
---
# 注意：為此特定頁面覆蓋閾值。
outdatedThresholdDays: 90
---
```

若要完全停用特定頁面的通知：

```yaml
---
# 注意：強制隱藏此頁面的過時通知。
showOutdatedWarning: false
---
```

將 `outdatedThresholdDays` 設為 `0` 可有效停用通知（任何正數天數都會超過閾值）。

## 日期如何判定

天數是從**最近的**有意義日期計算：

1. 如果頁面有與 `date` 不同的 `lastmod` 欄位，則使用 `lastmod`。
2. 否則使用 `date`。

這表示一篇最初在 3 年前發佈但**上週更新過**的文章，不會顯示過時警告。

## 國際化

警告文字透過 i18n 金鑰 `outdatedWarning` 管理，該金鑰接受一個 `{{ .Days }}` 佔位符：

| 語言 | 金鑰 | 預設翻譯 |
|---|---|---|
| 英文（`en-US`） | `outdatedWarning` | `This article was published over {{ .Days }} days ago. The information may no longer be applicable.` |
| 簡體中文（`zh-Hans`） | `outdatedWarning` | `本文发布于 {{ .Days }} 天前，部分信息可能已不再适用。` |

若要自訂訊息，請在網站的 `i18n/` 目錄中覆蓋該金鑰。

## 提示

- **積極使用 `lastmod`**：當你修訂內容時保持 `lastmod` 欄位更新。這會自動為已重新審查的文章抑制警告。
- **按區段調整**：如果你網站的區段有不同的內容生命週期（例如新聞與參考資料），請按頁面或區段 `_index.md` 調整 `outdatedThresholdDays`。
- **搭配 `showOutdatedWarning: false` 使用**：在永不需要警告的頁面上使用此設定（例如「關於」或「隱私權政策」）。
- **編輯審查**：考慮將過時通知與定期審查工作流程配對——當你在閱讀自己網站時看到橫幅，就該更新內容了。
