# 评论系统 (Remark42)

集成自托管评论系统 Remark42，并让评论区自动跟随站点当前的主题模式与页面语言。默认情况下，同一篇文章的不同语言版本会共用一个评论区。

## 基础配置

在 `hugo.toml` 中设置：

```toml
[params.comments]
  provider = 'remark42'

  [params.comments.providers.remark42]
    # 说明：Remark42 服务地址，需与后端配置中的 REMARK_URL 保持一致。
    host = 'https://remark42.example.com'
    # 说明：站点 ID，需与 Remark42 后端启动参数中的 SITE 一致。
    siteId = 'my-site'
    # 说明：是否让同一篇文章的不同语言版本共用同一个评论线程。
    # 注意：默认值为 true，共享时会固定使用默认语言版本页面 URL 作为线程标识。
    shareAcrossTranslations = true
```

## 可选前端参数

```toml
[params.comments.providers.remark42]
  # 说明：移动端默认最多展示多少条评论。
  maxShownComments = 20
  # 说明：设为 false 后，不同语言版本会按各自页面 URL 拆分为独立评论区。
  shareAcrossTranslations = false
  # 说明：是否向访客显示邮件订阅入口。
  showEmailSubscription = true
  # 说明：是否向访客显示 RSS 订阅入口。
  showRssSubscription = true
  # 说明：是否启用更简洁的界面。
  simpleView = false
  # 说明：是否隐藏 Remark42 底部页脚。
  noFooter = false
```

## 行为说明

- 评论区会在文章元数据卡片之后渲染为独立卡片。
- 主题会自动跟随站点当前的浅色 / 深色模式。
- 语言会直接跟随当前页面语言；当前主题内 `zh-Hans` 会映射为 `zh`，`en-US` 会映射为 `en`。
- `shareAcrossTranslations` 默认开启；开启后，同一篇文章的不同语言版本会使用默认语言版本页面 URL 作为共同的评论线程标识。
- 关闭 `shareAcrossTranslations` 后，Remark42 会按每个语言页面自己的 URL 分隔评论区。
- 未配置 `host` 时不会渲染评论区。
