# Comments (Remark42)

Integrate the self-hosted Remark42 comment system and let the widget follow the current site theme and page language automatically. By default, translated versions of the same article share one comment thread.

## Basic configuration

Set this in `hugo.toml`:

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

## Optional frontend parameters

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

## Notes

- The comments widget is rendered as a dedicated card after the article metadata card.
- The widget theme follows the current site light/dark mode automatically.
- The widget locale follows the current page language directly; in this theme, `zh-Hans` becomes `zh` and `en-US` becomes `en`.
- `shareAcrossTranslations` is enabled by default. When enabled, translated versions of the same article use the default-language page URL as the shared Remark42 thread identifier.
- Set `shareAcrossTranslations = false` if you want each language version to keep its own URL-scoped comment thread.
- If `host` is not set, the comments card is not rendered.
