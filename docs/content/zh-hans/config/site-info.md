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
