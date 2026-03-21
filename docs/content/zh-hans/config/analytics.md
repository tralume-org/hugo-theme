# 统计分析 (Umami)

集成轻量、隐私友好的统计系统 Umami，并支持“拦截提示”“文章阅读量”以及主题内置交互事件埋点。

## Umami 脚本注入

在 `hugo.toml` 中设置：

```toml
[params.analytics]
  provider = 'umami'

  [params.analytics.providers.umami]
    # 说明：Umami 脚本地址。
    scriptUrl = 'https://analytics.example.com/script.js'
    # 说明：你在 Umami 面板中获得的 Website ID。
    websiteId = '你的-id-123456'

    # 可选：当脚本被广告拦截器阻止时，是否在页面边缘弹出友情提示。
    blockNotice = true
```

## 文章阅读量

调用 Umami 的公共 API ，在文章标题下方展示该页面的浏览次数。

```toml
[params.analytics.providers.umami.pageviews]
  # 说明：Umami 实例的根地址（注意不要带 /script.js）。
  host = 'https://analytics.example.com'

  # 说明：该站点的 Share ID。
  # 你需要在 Umami 面板开启“分享链接”，链接最后的随机字符串即为 ID。
  shareId = '你的-share-id'
```

## 内置交互事件

完成脚本注入后，主题会自动为常见交互上报 Umami 自定义事件，无需额外模板改造。

- **文章阅读**：`scroll_depth`、`open_outline`、`close_outline`、`click_outline_item`
- **内容操作**：`copy_code`、`copy_permalink`、`click_outbound_link`、`click_tag`
- **全局导航**：`open_mobile_menu`、`close_mobile_menu`、`open_pages_menu`、`click_nav_link`
- **界面偏好**：`open_settings_panel`、`change_theme_mode`、`change_glass_strength`、`change_reader_width`、`change_background_provider`
- **列表与附加模块**：`load_more_posts`、`reach_list_end`、`click_article_card`、`view_comments`、`click_edit_source`、`view_pageviews_widget`

## 功能特点

- **隐私保护**：统计逻辑交由 Umami 处理，主题仅负责按需展示。
- **自动降级**：如果读者的网络或插件阻止了统计请求，阅读量项会自动隐藏，不会留下破损的图标或文字。
- **统一上下文**：事件会自动附带当前页面路径、语言与页面类型，便于在 Umami 中直接按页面维度筛选。
