---
title: サイト情報と SEO
weight: 50
date: '2026-06-06T00:00:00+08:00'
---

サイトの説明と検索エンジンクローラーのルール（例: Google、Bing）を制御します。

## サイトの説明

サイトの短い説明を提供します。検索結果のプレビューに表示され、RSS フィードの説明としても使用されます。

`hugo.toml` に設定します:

```toml
[params]
  # Note: Short site description.
  description = 'Tralume: a modern, lightweight, beautiful Hugo theme.'
```

## ファビコン

Tralume は `params.favicon` からファビコンリンクを出力できます。アイコンファイルをサイトの `static/` ディレクトリに配置し、ルート相対パスで参照します:

```toml
[params.favicon]
  icon = '/favicon.ico'
  svg = '/favicon.svg'
  appleTouch = '/apple-touch-icon.png'
  manifest = '/site.webmanifest'
```

サポートされるフィールド:

- `icon`: 通常のファビコン（通常 `.ico` または `.png`）
- `svg`: モダンブラウザ用の SVG ファビコン
- `appleTouch`: iOS ホーム画面アイコン
- `manifest`: ウェブアプリマニフェスト

## ソーシャル共有カード (Open Graph / Twitter Card)

Tralume は Open Graph と Twitter Card メタデータを自動的に出力します。

テーマは以下の優先順位で共有画像を解決します:

1. **ページレベルの Front Matter**: `image` > `featuredImage` > `featured_image` > `cover` > `thumbnail` > `banner` > Page Bundle 内の最初の画像リソース
2. **サイト全体のパラメータ**（順）: `params.socialImage` > `params.seo.image` > `params.seo.cardImage`
3. **フォールバック**: `params.favicon.appleTouch` > `params.favicon.icon` > 画像なし

サイト全体のデフォルト共有画像を設定します:

```toml
[params]
  # Note: Site-wide social share card image.
  # Note: This is checked first among site-wide defaults.
  socialImage = '/social-card.png'
```

`params.seo` の下にデフォルトを設定することもできます:

```toml
[params.seo]
  # Note: Site-wide default social share card image.
  # Note: A 1200x630 image is recommended.
  image = '/seo-default.png'
  # Note: image takes priority over cardImage.
  cardImage = '/social-card.png'
```

サポートされている任意のページレベル画像フィールドを使用するには、Front Matter に追加します:

```toml
+++
# Note: Overrides the share card image for this page only.
# Note: Any of image, featuredImage, featured_image, cover, thumbnail, banner works.
featuredImage = '/posts/example/cover.png'
+++
```

## 構造化データの著者と発行者 (JSON-LD)

Tralume はホームページと記事ページに JSON-LD を出力します。

- 記事ページには `author` を含めることができます
- ホームページと記事ページには `publisher` を含めることができます
- `publisher.logo` は明示的に設定でき、省略された場合は `params.seo.logo` > `params.favicon.appleTouch` > `params.favicon.icon` の順にフォールバックします

`hugo.toml` にサイト全体の著者と発行者のメタデータを設定します:

```toml
[params.seo.author]
  # Note: Default author name for article pages.
  name = 'AlexMa'
  # Note: Author profile or about page URL.
  url = 'https://example.com/about/'

[params.seo.publisher]
  # Note: Publisher name used in structured data.
  name = 'AlexMa\'s Blog'
  # Note: Publisher homepage URL.
  url = 'https://example.com/'
  # Note: Publisher logo image.
  # Note: Use a stable absolute URL or root-relative path.
  logo = '/publisher-logo.png'
```

単一の記事の著者を上書きするには、Front Matter に以下を追加します:

```toml
+++
# Note: Overrides the structured-data author for this article.
[author]
  name = 'Guest Author'
  url = 'https://example.com/team/guest-author/'
+++
```

## ロボットルール (robots.txt)

検索エンジンにクロール可能なページを指示し、必要に応じてサイト全体のクロールを無効にします（公開前などに便利です）。

`hugo.toml` のトップレベルで Hugo の robots.txt 生成を有効にします:

```toml
enableRobotsTXT = true

[params.robotsTxt]
  # Note: Whether to allow search engines to crawl.
  # If set to false, the whole site is disallowed (Disallow: /).
  enabled = true

  # Note: Whether to include the sitemap link in robots.txt.
  sitemap = true
```
