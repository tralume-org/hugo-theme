---
title: 網站資訊與 SEO
weight: 50
date: '2026-06-06T00:00:00+08:00'
---

控制網站描述和搜尋引擎爬蟲規則（例如 Google、Bing）。

## 網站描述

為你的網站提供一段簡短描述。它會出現在搜尋結果預覽中，也會用作 RSS 摘要描述。

在 `hugo.toml` 中設定：

```toml
[params]
  # 注意：簡短的網站描述。
  description = 'Tralume: a modern, lightweight, beautiful Hugo theme.'
```

## Favicon

Tralume 可以從 `params.favicon` 輸出 favicon 連結。將圖示檔案放在網站的 `static/` 目錄中，然後使用根相對路徑引用它們：

```toml
[params.favicon]
  icon = '/favicon.ico'
  svg = '/favicon.svg'
  appleTouch = '/apple-touch-icon.png'
  manifest = '/site.webmanifest'
```

支援的欄位：

- `icon`：一般 favicon，通常為 `.ico` 或 `.png`
- `svg`：現代瀏覽器的 SVG favicon
- `appleTouch`：iOS 主畫面圖示
- `manifest`：Web App Manifest

## 社群分享卡片（Open Graph / Twitter Card）

Tralume 會自動輸出 Open Graph 和 Twitter Card 詮釋資料。

主題依以下優先順序解析分享圖片：

1. **頁面級 Front Matter**：`image` > `featuredImage` > `featured_image` > `cover` > `thumbnail` > `banner` > Page Bundle 中的第一張圖片資源
2. **全站參數**（依序）：`params.socialImage` > `params.seo.image` > `params.seo.cardImage`
3. **回退**：`params.favicon.appleTouch` > `params.favicon.icon` > 無圖片

設定全站預設分享圖片：

```toml
[params]
  # 注意：全站社群分享卡片圖片。
  # 注意：此項在全站預設值中會最先被檢查。
  socialImage = '/social-card.png'
```

你也可以在 `params.seo` 下設定預設值：

```toml
[params.seo]
  # 注意：全站預設社群分享卡片圖片。
  # 注意：建議使用 1200x630 的圖片。
  image = '/seo-default.png'
  # 注意：image 優先於 cardImage。
  cardImage = '/social-card.png'
```

若要使用任何支援的頁面級圖片欄位，請將其加入 Front Matter：

```toml
+++
# 注意：僅為此頁面覆蓋分享卡片圖片。
# 注意：任何 image、featuredImage、featured_image、cover、thumbnail、banner 欄位皆可使用。
featuredImage = '/posts/example/cover.png'
+++
```

## 結構化資料作者與發布者（JSON-LD）

Tralume 會為首頁和文章頁面輸出 JSON-LD。

- 文章頁面可以包含 `author`
- 首頁和文章頁面可以包含 `publisher`
- `publisher.logo` 可以明確設定，省略時依序回退到 `params.seo.logo` > `params.favicon.appleTouch` > `params.favicon.icon`

在 `hugo.toml` 中設定全站作者和發布者詮釋資料：

```toml
[params.seo.author]
  # 注意：文章頁面的預設作者名稱。
  name = 'AlexMa'
  # 注意：作者簡介或關於頁面 URL。
  url = 'https://example.com/about/'

[params.seo.publisher]
  # 注意：用於結構化資料的發布者名稱。
  name = 'AlexMa\'s Blog'
  # 注意：發布者首頁 URL。
  url = 'https://example.com/'
  # 注意：發布者標誌圖片。
  # 注意：使用穩定的絕對 URL 或根相對路徑。
  logo = '/publisher-logo.png'
```

若要為單一文章覆蓋作者，請在 Front Matter 中加入：

```toml
+++
# 注意：為此文章覆蓋結構化資料的作者。
[author]
  name = '客座作者'
  url = 'https://example.com/team/guest-author/'
+++
```

## Robots 規則（robots.txt）

告訴搜尋引擎可以爬取哪些頁面，也可以選擇停用對整個網站的爬取（在公開發佈前很有用）。

在 `hugo.toml` 頂層啟用 Hugo 的 robots.txt 產生：

```toml
enableRobotsTXT = true

[params.robotsTxt]
  # 注意：是否允許搜尋引擎爬取。
  # 若設為 false，整個網站將被禁止爬取（Disallow: /）。
  enabled = true

  # 注意：是否在 robots.txt 中包含 sitemap 連結。
  sitemap = true
```
