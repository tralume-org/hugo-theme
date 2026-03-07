# Comments (Remark42)

Integrate the self-hosted Remark42 comment system and let the widget follow the current site theme and page language automatically.

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
```

## Optional frontend parameters

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
  # 说明：是否隐藏 Remark42 底部页脚。
  noFooter = false
```

## Notes

- The comments widget is rendered as a dedicated card after the article metadata card.
- The widget theme follows the current site light/dark mode automatically.
- The widget locale follows the current page language directly; in this theme, `zh-Hans` becomes `zh` and `en-US` becomes `en`.
- If `host` is not set, the comments card is not rendered.
