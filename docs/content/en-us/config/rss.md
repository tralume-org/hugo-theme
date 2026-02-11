# RSS Visibility

Default behavior:

- `content/posts/`: included in RSS by default.
- `content/pages/`: excluded from RSS by default (e.g. About, guestbook).

You can control RSS inclusion via Front Matter.

Include a page under `content/pages/` in RSS:

```yaml
---
title: "About"
# 说明：pages 分区默认不进 RSS；设为 false 可强制包含进 RSS。
rssHidden: false
---
```

Exclude a post (usually under `content/posts/`) from RSS:

```yaml
---
title: "Test page"
# 说明：设为 true 则该页面不会出现在 RSS（index.xml）订阅源中。
rssHidden: true
---
```
