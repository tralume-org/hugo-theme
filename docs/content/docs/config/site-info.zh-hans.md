---
title: 站点信息与 SEO
weight: 50
---

控制站点描述和搜索引擎（如 Google、Bing）爬取规则。

## 站点描述

为站点提供一个简短的描述。它会出现在搜索引擎结果页的预览中，也会被用作 RSS 订阅源的描述。

在 `hugo.toml` 中设置：

```toml
[params]
  # 说明：简短的站点描述。
  description = 'Tralume: 一款现代、轻量、美观的 Hugo 主题。'
```

## Favicon（网站图标）

Tralume 可以通过 `params.favicon` 输出网站图标。将相关图标文件放入站点的 `static/` 目录，然后使用相对站点根目录的路径引用它们：

```toml
[params.favicon]
  icon = '/favicon.ico'
  svg = '/favicon.svg'
  appleTouch = '/apple-touch-icon.png'
  manifest = '/site.webmanifest'
```

支持的字段：

- `icon`：常规站标，通常为 `.ico` 或 `.png`
- `svg`：供新版浏览器使用的 SVG 站标
- `appleTouch`：iOS 添加到主屏幕的图标
- `manifest`：Web 应用清单文件

## 社交媒体分享卡片 (Open Graph / Twitter Card)

Tralume 会自动为每个页面生成 Open Graph 与 Twitter Card 元信息。

- 优先级最高的是页面级别的 Front Matter `image`
- 可在 `hugo.toml` 中通过 `params.seo.cardImage` 或 `params.seo.image` 设置全站默认卡片图
- 如果两者都没有设置，主题会回退到站点图标 (`appleTouch` / `icon`) 或不显示图片

在 `hugo.toml` 中设置全站默认卡片图：

```toml
[params.seo]
  # 说明：全站默认的社交分享卡片图。
  # 注意：推荐使用 1200x630 分辨率的图片。
  cardImage = '/social-card.png'
```

如需覆盖某一页的卡片图，在其 Front Matter 中这样写：

```toml
+++
# 说明：仅覆盖当前页面的社交分享卡片图。
# 注意：此设置会优先于 params.seo.cardImage。
image = '/posts/example/cover.png'
+++
```

## 结构化数据 author 与 publisher (JSON-LD)

Tralume 会为首页和文章页生成 JSON-LD。

- 文章页可包含 `author`
- 首页和文章页可包含 `publisher`
- `publisher.logo` 可以显式设置，留空时回退到 `appleTouch` 或 `icon`

在 `hugo.toml` 中设置全站作者与发布者：

```toml
[params.seo.author]
  # 说明：文章页默认作者名。
  name = 'AlexMa'
  # 说明：作者个人页面或关于页 URL。
  url = 'https://example.com/about/'

[params.seo.publisher]
  # 说明：用于结构化数据的发布者名称。
  name = 'AlexMa\'s Blog'
  # 说明：发布者主页 URL。
  url = 'https://example.com/'
  # 说明：发布者 Logo 图片。
  # 注意：请使用稳定的绝对 URL 或站点根相对路径。
  logo = '/publisher-logo.png'
```

如需覆盖某一篇文章的作者，在其 Front Matter 中这样写：

```toml
+++
# 说明：仅覆盖当前文章的结构化数据作者。
[author]
  name = 'Guest Author'
  url = 'https://example.com/team/guest-author/'
+++
```

## Robots 控制 (robots.txt)

告诉搜索引擎哪些页面可以抓取。你也可以在公开发布前暂时禁止全站抓取。

在 `hugo.toml` 下开启 Hugo 自身的 robots.txt 生成能力：

```toml
enableRobotsTXT = true

[params.robotsTxt]
  # 说明：是否允许搜索引擎抓取。
  # 设为 false 则全站禁止爬取 (Disallow: /)。
  enabled = true

  # 说明：是否在 robots.txt 中包含 sitemap 链接。
  sitemap = true
```
