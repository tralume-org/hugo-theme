---
title: 内容展示与摘要
weight: 60
date: '2026-06-06T00:00:00+08:00'
---

控制首页展示的文章数量、`/posts` 与 `/pages` 列表分页，以及列表页中文章简介（摘要）的长度。

## 首页最新文章上限

为了保持首页整洁，你可以限制显示的最新文章数量。超出部分会通过一个"查看更多"按钮引导用户进入完整的文章列表。

### 配置位置

在 `hugo.toml` 中设置：

```toml
[params.home]
  # 说明：首页展示的最新文章数量。
  recentPostsLimit = 6
```

## 摘要截断长度

在文章列表中，如果文章没有单独的描述，主题会自动抓取文章开头的一段文字作为简介。你可以控制这段文字显示多长。

在 `hugo.toml` 中设置：

```toml
[params]
  # 说明：首页和文章列表卡片中的摘要长度（字符数）。
  articleCardSummaryLength = 160
```

## /posts 与 /pages 分页大小

`/posts` 与 `/pages` 入口页现在使用完全一致的总览界面：同款横向卡片列表、同款分页导航，并且都支持"分页 / 无限滚动"切换。

在 `hugo.toml` 中设置：

```toml
[params.posts]
  # 说明：统一控制 /posts 与 /pages 每页显示数量；总数会按该值自动分页。
  # 注意：当值小于等于 0 时会回退到默认值 10。
  pageSize = 10
```

## 小技巧

- **手动控制摘要起点**：你可以在文章内容中使用 `<!--more-->` 标记来划分摘要区域（主题会优先用它来生成摘要）。
- **优先使用描述**：如果文章设置了 `description` 参数，主题在首页、`/posts` 与 `/pages` 列表会优先使用它作为摘要。
- **分页导航（移动端）**：移动端仅显示"上一页 / 当前页 / 下一页"并合并为一条控件；桌面端显示带省略号的页码条。
- **滚动模式同步**：设置面板中的"分页 / 无限滚动"会同时作用于 `/posts` 与 `/pages`。

## 文章卡片封面图

列表中的文章卡片会自动显示封面图（如有）。主题按顺序检查以下 Front Matter 字段：

`image` > `featuredImage` > `featured_image` > `cover` > `thumbnail` > `banner`

若均未匹配，则回退到 Page Bundle 中的第一张图片资源。找到封面图后，卡片会附加 `article-card--with-cover` 类并在标题上方渲染图片。

## 内容类型匹配

`/posts` 和 `/pages` Section 入口也会匹配 Front Matter 中 `type` 设置为 `posts` 或 `pages` 的内容。也就是说，即使某页面不在 `/posts/` 目录下，只要其 Front Matter 写明 `type: posts`，也会被纳入文章列表 UI。
