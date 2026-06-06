---
title: RSS 可見性
weight: 80
date: '2026-06-06T00:00:00+08:00'
---

預設行為：

- `content/posts/`：預設包含在 RSS 中。
- `content/pages/`：預設從 RSS 中排除（例如關於、留言板）。

你可以透過 Front Matter 控制 RSS 的包含與否。

將 `content/pages/` 下的頁面納入 RSS：

```yaml
---
title: "關於"
# 注意：頁面預設從 RSS 中排除；設為 false 可將頁面納入 RSS。
rssHidden: false
---
```

將文章（通常位於 `content/posts/` 下）從 RSS 中排除：

```yaml
---
title: "測試頁"
# 注意：設為 true 可將頁面從 RSS 摘要（index.xml）中排除。
rssHidden: true
---
```
