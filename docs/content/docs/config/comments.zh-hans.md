---
title: 评论系统
weight: 130
date: '2026-06-05T00:00:00+08:00'
---

配置文章页评论区。Tralume 支持 `remark42`、`giscus`、`utterances`、`waline`、`twikoo`，并在 provider 支持时自动跟随站点当前的主题模式与页面语言。默认情况下，评论线程会统一使用默认语言的正式 URL，而不是按具体语言 URL 拆分。

## 支持的 provider

| Provider | 后端 | 必填配置 |
| --- | --- | --- |
| `remark42` | 自托管 Remark42 | `host` |
| `giscus` | GitHub Discussions | `repo`、`repoId`、`category`、`categoryId` |
| `utterances` | GitHub Issues | `repo` |
| `waline` | Waline 服务端 | `serverURL` |
| `twikoo` | Twikoo 环境 | `envId` |

## 基础配置

在 `hugo.toml` 中选择一个 provider：

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

只有被选中的 provider 会渲染。若缺少该 provider 的必填配置，则不会渲染评论卡片。

## Giscus

```toml
[params.comments]
  provider = 'giscus'
  # 说明：defaultLanguage 会让翻译页共用同一条讨论。
  mergeStrategy = 'defaultLanguage'

  [params.comments.providers.giscus]
    # 说明：已安装 Giscus 的 GitHub 仓库。
    repo = 'owner/repo'
    # 说明：Giscus 配置页提供的仓库 ID。
    repoId = 'R_kgDOExample'
    # 说明：GitHub Discussions 分类名称。
    category = 'Announcements'
    # 说明：Giscus 配置页提供的分类 ID。
    categoryId = 'DIC_kwDOExample'
```

Giscus 可选参数：

```toml
[params.comments.providers.giscus]
  # 说明：映射模式。主题默认使用 specific，并把共享线程 URL 作为 term。
  mapping = 'specific'
  # 说明：自定义 term；不设置时使用 mergeStrategy 生成的 URL。
  term = 'custom-thread-id'
  # 说明：是否启用严格标题匹配。
  strict = false
  # 说明：是否显示 reaction 控件。
  reactionsEnabled = true
  # 说明：是否发送讨论元数据事件。
  emitMetadata = false
  # 说明：评论输入框位置。
  inputPosition = 'bottom'
  # 说明：Tralume 浅色 / 深色模式对应的 Giscus 主题。
  lightTheme = 'light'
  darkTheme = 'dark'
```

## Utterances

```toml
[params.comments]
  provider = 'utterances'
  mergeStrategy = 'defaultLanguage'

  [params.comments.providers.utterances]
    # 说明：已安装 Utterances 的 GitHub 仓库。
    repo = 'owner/repo'
```

Utterances 可选参数：

```toml
[params.comments.providers.utterances]
  # 说明：自定义 issue term；不设置时使用 mergeStrategy 生成的 URL。
  issueTerm = 'custom-thread-id'
  # 说明：Utterances 创建 issue 时附加的标签。
  label = 'comments'
  # 说明：Tralume 浅色 / 深色模式对应的 Utterances 主题。
  lightTheme = 'github-light'
  darkTheme = 'github-dark'
```

## Waline

```toml
[params.comments]
  provider = 'waline'
  mergeStrategy = 'defaultLanguage'

  [params.comments.providers.waline]
    # 说明：Waline 服务端地址。
    serverURL = 'https://waline.example.com'
```

Waline 可选参数：

```toml
[params.comments.providers.waline]
  # 说明：自定义语言代码；不设置时跟随当前页面语言。
  lang = 'en-US'
  # 说明：发布评论前必填的元信息字段。
  requiredMeta = ['nick', 'mail']
  # 说明：服务端支持时启用 reaction、浏览量与评论数统计。
  reaction = true
  pageview = true
  comment = true
```

## Twikoo

```toml
[params.comments]
  provider = 'twikoo'
  mergeStrategy = 'defaultLanguage'

  [params.comments.providers.twikoo]
    # 说明：Twikoo 环境 ID 或服务端地址，取决于部署方式。
    envId = 'https://twikoo.example.com'
```

Twikoo 可选参数：

```toml
[params.comments.providers.twikoo]
  # 说明：腾讯云地域，仅腾讯云 CloudBase 部署需要。
  region = 'ap-shanghai'
  # 说明：自定义语言代码；不设置时跟随当前页面语言。
  lang = 'en'
```

## Remark42 可选参数

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
- Remark42、Giscus、Utterances、Waline 会自动跟随站点当前的浅色 / 深色模式；Twikoo 使用自身前端主题行为。
- Provider 语言会在支持时跟随当前页面语言。主题会把 `zh-Hans` 映射为 `zh-CN`；英文映射为 `en`，其中 Waline 使用 `en-US`。
- `mergeStrategy = 'smartPath'`：把 `/zh-hans/posts/test/` 与 `/en-us/posts/test/` 统一归并到同一条中立线程；当 `defaultContentLanguageInSubdir = true` 时线程 URL 为 `/posts/test/`，当 `defaultContentLanguageInSubdir = false` 且启用了 `params.i18nRouting.enableAutoEntry` 时线程 URL 会改为 `/auto/posts/test/`，以便邮件通知链接也先进入智能语言入口。
- `mergeStrategy = 'defaultLanguage'`：统一使用默认语言正式 URL 作为评论线程标识；这是主题默认值。建议让默认语言保持最小 `weight`，以便 Hugo 语言顺序与默认语言一致。
- `mergeStrategy = 'none'`：每个语言 URL 各自拥有独立评论区。
- Giscus 默认使用 `mapping = 'specific'`，Utterances 默认使用自定义 issue term，Waline/Twikoo 使用 `path`；三者默认都会使用 `mergeStrategy` 生成的 URL，除非覆盖 provider 自身的 term/path 设置。
