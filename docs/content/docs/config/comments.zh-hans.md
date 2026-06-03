---
title: 评论系统 (Remark42)
weight: 130
---

集成自托管评论系统 Remark42，并让评论区自动跟随站点当前的主题模式与页面语言。默认情况下，评论线程会统一使用默认语言的正式 URL，而不是按具体语言 URL 拆分。

## 基础配置

在 `hugo.toml` 中设置：

```toml
[params.comments]
  provider = 'remark42'
  # 说明：评论线程合并策略。
  # 注意：defaultLanguage 会统一使用默认语言的正式 URL；这是主题默认值。
  mergeStrategy = 'defaultLanguage'

  [params.comments.providers.remark42]
    # 说明：Remark42 服务地址，需与后端配置中的 REMARK_URL 保持一致。
    host = 'https://remark42.example.com'
    # 说明：站点 ID，需与 Remark42 后端启动参数中的 SITE 一致。
    siteId = 'my-site'
```

## 可选前端参数

```toml
[params.comments.providers.remark42]
  # 说明：移动端默认最多展示多少条评论。
  maxShownComments = 20
  # 说明：是否向访客显示邮件订阅入口。
  showEmailSubscription = true
  # 说明：是否向访客显示 RSS 订阅入口。
  showRssSubscription = true
  # 说明：是否启用更简洁的界面。
  simpleView = false
  # 说明：是否隐藏 Remark42 底部页脚。主题默认已隐藏（true），设为 false 可重新显示。
  noFooter = true
```

## 行为说明

- 评论区会在文章元数据卡片之后渲染为独立卡片。
- 主题会自动跟随站点当前的浅色 / 深色模式。
- 语言会直接跟随当前页面语言；当前主题内 `zh-Hans` 会映射为 `zh`，`en-US` 会映射为 `en`。
- `mergeStrategy = 'smartPath'`：把 `/zh-hans/posts/test/` 与 `/en-us/posts/test/` 统一归并到同一条中立线程；当 `defaultContentLanguageInSubdir = true` 时线程 URL 为 `/posts/test/`，当 `defaultContentLanguageInSubdir = false` 且启用了 `params.i18nRouting.enableAutoEntry` 时线程 URL 会改为 `/auto/posts/test/`，以便邮件通知链接也先进入智能语言入口。
- `mergeStrategy = 'defaultLanguage'`：统一使用默认语言正式 URL 作为评论线程标识；这是主题默认值。建议让默认语言保持最小 `weight`，以便 Hugo 语言顺序与默认语言一致。
- `mergeStrategy = 'none'`：每个语言 URL 各自拥有独立评论区。
- 未配置 `host` 时不会渲染评论区。
