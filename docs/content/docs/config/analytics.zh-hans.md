---
title: 统计分析 (Umami)
weight: 120
---

集成轻量、隐私友好的统计系统 Umami，并支持"拦截提示""文章阅读量"以及主题内置交互事件埋点。

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

    # 可选：当脚本被广告拦截器阻止时，是否在页面底部弹出友情提示。
    # 启用后，会展示一个多步骤引导对话框：
    #   1. 问候语，说明使用 Umami 统计的原因
    #   2. 说明收集了哪些数据
    #   3. 说明脚本为何可能被拦截
    #   4. 指引如何在常见广告拦截器中为该站点添加白名单
    blockNotice = true
```

## 文章阅读量

调用 Umami 的公共 API ，在文章标题下方展示该页面的浏览次数。

```toml
[params.analytics.providers.umami.pageviews]
  # 说明：Umami 实例的根地址（注意不要带 /script.js）。
  host = 'https://analytics.example.com'

  # 说明：该站点的 Share ID。
  # 你需要在 Umami 面板开启"分享链接"，链接最后的随机字符串即为 ID。
  shareId = '你的-share-id'
```

## 内置交互事件

完成脚本注入后，主题会自动为常见交互上报 Umami 自定义事件，无需额外模板改造。

- **文章阅读**：`scroll_depth`、`open_outline`、`close_outline`、`click_outline_item`
- **内容操作**：`copy_code`、`copy_permalink`、`click_outbound_link`、`click_tag`
- **全局导航**：`open_mobile_menu`、`close_mobile_menu`、`open_pages_menu`、`click_nav_link`
- **界面偏好**：`open_settings_panel`、`change_theme_mode`、`change_glass_strength`、`change_reader_width`、`change_background_provider`
- **列表与附加模块**：`load_more_posts`、`reach_list_end`、`click_article_card`、`view_comments`、`click_edit_source`、`view_pageviews_widget`

## 事件名称说明

下面这份清单对应当前主题已经实现的全部内置 Umami 自定义事件。

### 页面与阅读

| 事件名 | 含义 | 主要附加字段 |
| --- | --- | --- |
| `scroll_depth` | 阅读深度到达阈值时触发。当前阈值为 25 / 50 / 75 / 100，所以同一页面看到多次是正常现象。 | `depth` |
| `open_outline` | 打开移动端文章大纲浮层。 | `heading_count` |
| `close_outline` | 关闭移动端文章大纲浮层。 | 无 |
| `click_outline_item` | 点击文章大纲里的标题链接。 | `heading_id`、`heading_level` |
| `view_pageviews_widget` | 文章阅读量组件成功显示并拿到数据。 | 无 |
| `view_comments` | 评论区进入视口并达到可见阈值。 | `provider` |

### 内容操作

| 事件名 | 含义 | 主要附加字段 |
| --- | --- | --- |
| `copy_code` | 成功复制代码块内容。 | `lang`、`line_count` |
| `copy_permalink` | 成功复制文章永久链接。 | `title` |
| `click_outbound_link` | 点击正文中的外部链接。 | `target_url`、`target_host`、`link_text`、`link_position` |
| `click_edit_source` | 点击"编辑此页 / 查看源码"链接。 | `target_url`、`target_host` |
| `click_tag` | 点击标签入口。 | `tag` |

### 导航与列表

| 事件名 | 含义 | 主要附加字段 |
| --- | --- | --- |
| `open_mobile_menu` | 打开移动端菜单。 | `position` |
| `close_mobile_menu` | 关闭移动端菜单。 | `position` |
| `open_pages_menu` | 打开顶栏 Pages 下拉面板。 | `position` |
| `click_nav_link` | 点击主题导航链接。 | `label`、`target_path`、`position` |
| `click_article_card` | 点击文章卡片进入详情页。 | `target_path`、`title`、`position` |
| `load_more_posts` | 无限滚动成功加载下一页内容。 | `feed`、`current_page`、`next_page` |
| `reach_list_end` | 无限滚动到达最后一页，没有更多内容。 | `feed`、`page` |

### 设置面板与偏好

| 事件名 | 含义 | 主要附加字段 |
| --- | --- | --- |
| `open_settings_panel` | 打开设置面板。 | 无 |
| `change_theme_mode` | 切换主题模式（自动 / 浅色 / 深色）。 | `mode` |
| `change_glass_strength` | 调整亚克力强度。 | `strength` |
| `change_reader_width` | 调整阅读宽度。 | `width` |
| `change_background_provider` | 切换背景来源（URL / Upload / Pixaroa）。 | `provider` |

## 如何理解 Umami 里的记录

- 普通的页面路径（例如 `/zh-hans/pages/affiliates/`）是 Umami 默认的页面访问记录，不是主题额外定义的自定义事件。
- `Visitor from ... using ...` 是 Umami 对本次访问会话的访客环境描述，表示地区、浏览器、系统和设备类型。
- `view_pageviews_widget on /...` 表示页面上的阅读量组件成功显示。
- `view_comments on /...` 表示评论区被滚动到可见区域。
- 同一页连续出现多条 `scroll_depth`，通常表示用户依次跨过了 25%、50%、75%、100% 这些阅读深度阈值。

## 功能特点

- **隐私保护**：统计逻辑交由 Umami 处理，主题仅负责按需展示。
- **自动降级**：如果读者的网络或插件阻止了统计请求，阅读量项会自动隐藏，不会留下破损的图标或文字。
- **统一上下文**：事件会自动附带当前页面路径、语言与页面类型，便于在 Umami 中直接按页面维度筛选。
