---
title: RSS Visibility
weight: 80
date: '2026-06-06T00:00:00+08:00'
---

Default behavior:

- `content/posts/`: included in RSS by default.
- `content/pages/`: excluded from RSS by default (e.g. About, guestbook).

You can control RSS inclusion via Front Matter.

Include a page under `content/pages/` in RSS:

```yaml
---
title: "About"
# Note: Pages are excluded from RSS by default; set this to false to include the page in RSS.
rssHidden: false
---
```

Exclude a post (usually under `content/posts/`) from RSS:

```yaml
---
title: "Test page"
# Note: Set this to true to exclude the page from the RSS feed (index.xml).
rssHidden: true
---
```
