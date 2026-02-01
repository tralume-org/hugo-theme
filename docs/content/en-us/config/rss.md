# RSS Visibility

Some pages (e.g. About, guestbook, drafts) may not be suitable for RSS readers.

You can hide a page from `rss.xml` via Front Matter:

```yaml
---
title: "Test page"
# Note: If true, this page will not appear in rss.xml.
rssHidden: true
---
```
