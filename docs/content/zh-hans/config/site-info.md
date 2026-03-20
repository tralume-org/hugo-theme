# 站点信息与 SEO

控制站点的基础描述以及搜索引擎爬虫（如 Google、百度）的访问规则。

## 站点描述 (Description)

为你的站点提供一段简短的介绍。它会出现在首页的搜索结果预览中，也会作为 RSS 订阅源的简介。

在 `hugo.toml` 中设置：

```toml
[params]
  # 说明：站点的简短介绍。
  description = 'Tralume：一个现代、轻量、漂亮的 Hugo 主题。'
```

## 网站图标 (Favicon)

Tralume 支持通过 `params.favicon` 输出网站图标相关的 `<link>` 标签。先把图标文件放到站点的 `static/` 目录，再在配置里填写根路径：

```toml
[params.favicon]
  icon = '/favicon.ico'
  svg = '/favicon.svg'
  appleTouch = '/apple-touch-icon.png'
  manifest = '/site.webmanifest'
```

支持的字段：

- `icon`：普通 favicon，一般用 `.ico` 或 `.png`
- `svg`：现代浏览器使用的 SVG favicon
- `appleTouch`：iOS 主屏图标
- `manifest`：Web App manifest 文件

## 社交分享卡片 (Open Graph / Twitter Card)

Tralume 会自动输出 Open Graph 和 Twitter Card 元信息。

- 页面级优先读取 front matter 里的 `image`
- 站点级可通过 `params.seo.cardImage` 或 `params.seo.image` 指定默认卡片图
- 如果以上都没配置，才会退回到站点图标（如 `appleTouch` / `icon`）或无图卡片

在 `hugo.toml` 中设置默认卡片图：

```toml
[params.seo]
  # 说明：站点级默认社交分享卡片图片。
  # 注意：建议使用 1200x630 左右的绝对或根路径图片。
  cardImage = '/social-card.png'
```

如果你只想覆盖单篇文章/页面，可以在 front matter 中写：

```toml
+++
# 说明：仅覆盖当前页面的分享卡片图片。
# 注意：优先级高于 params.seo.cardImage。
image = '/posts/example/cover.png'
+++
```

## 搜索引擎规则 (Robots.txt)

告诉搜索引擎哪些页面可以抓取，哪些需要忽略。你还可以通过它快速关闭全站抓取（例如在站点还没准备好上线时）。

你需要在 `hugo.toml` 的最顶层启用 Hugo 的机器人文件生成功能：

```toml
enableRobotsTXT = true

[params.robotsTxt]
  # 说明：是否允许搜索引擎抓取。
  # 设为 false 则全站禁爬（Disallow: /）。
  enabled = true

  # 说明：是否在 robots.txt 中展示站点地图 (Sitemap) 链接。
  sitemap = true
```
