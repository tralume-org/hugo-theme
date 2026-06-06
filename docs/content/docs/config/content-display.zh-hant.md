---
title: 內容顯示與摘要
weight: 60
date: '2026-06-06T00:00:00+08:00'
---

控制首頁文章數量限制、`/posts` 和 `/pages` 分頁，以及列表卡片中的摘要長度。

## 首頁近期文章限制

為了保持首頁整潔，你可以限制顯示的近期文章數量。更多文章可透過「檢視更多」按鈕存取。

### 設定位置

在 `hugo.toml` 中設定：

```toml
[params.home]
  # 注意：首頁顯示的近期文章數量。
  recentPostsLimit = 6
```

## 摘要截斷長度

在文章列表中，如果頁面沒有明確的描述，主題會從內容開頭擷取片段作為摘要。你可以控制最大長度。

在 `hugo.toml` 中設定：

```toml
[params]
  # 注意：首頁和列表卡片的摘要長度，以字元為單位。
  articleCardSummaryLength = 160
```

## /posts 與 /pages 頁面大小

`/posts` 和 `/pages` 入口頁現在共用完全相同的概述 UI：水平卡片列表、一致的分頁器 UI，以及相同的分頁/無限滾動切換行為。

在 `hugo.toml` 中設定：

```toml
[params.posts]
  # 注意：控制 /posts 和 /pages 每頁顯示的項目數量；完整列表會自動分頁。
  # 注意：小於或等於 0 的值會回退到預設值 10。
  pageSize = 10
```

## 提示

- **手動摘要分割**：在內容中使用 `<!--more-->` 來定義摘要區域（主題偏好此方式）。
- **優先使用 `description`**：如果頁面設定了 `description`，主題會將其用作首頁、`/posts` 和 `/pages` 列表卡片上的摘要。
- **行動版分頁**：在小螢幕上，分頁器會合併成一列，僅顯示上一頁 / 目前頁 / 下一頁。
- **滾動模式適用於兩個列表**：設定面板中的分頁/無限滾動切換現在同時影響 `/posts` 和 `/pages`。

## 文章卡片封面圖片

列表視圖中的文章卡片會在有可用圖片時自動顯示封面圖片。主題會依序檢查以下 Front Matter 欄位：

`image` > `featuredImage` > `featured_image` > `cover` > `thumbnail` > `banner`

如果都不符合，主題會回退到 Page Bundle 中的第一張圖片資源。找到封面圖片時，卡片會獲得 `article-card--with-cover` 類別，並在標題上方渲染圖片。

## 內容類型比對

`/posts` 和 `/pages` 區段也會比對 Front Matter 中 `type` 設定為 `posts` 或 `pages` 的內容。這表示在頁面的 Front Matter 中設定 `type: posts`，即使它位於 `/posts/` 內容目錄之外，也會將其納入文章列表 UI。
