---
title: RSS 表示設定
weight: 80
date: '2026-06-06T00:00:00+08:00'
---

デフォルト動作:

- `content/posts/`: デフォルトで RSS に含まれます。
- `content/pages/`: デフォルトで RSS から除外されます（例: About、ゲストブック）。

Front Matter を通じて RSS の包含を制御できます。

`content/pages/` 以下のページを RSS に含める:

```yaml
---
title: "About"
# Note: Pages are excluded from RSS by default; set this to false to include the page in RSS.
rssHidden: false
---
```

投稿（通常 `content/posts/` 以下）を RSS から除外する:

```yaml
---
title: "Test page"
# Note: Set this to true to exclude the page from the RSS feed (index.xml).
rssHidden: true
---
```
