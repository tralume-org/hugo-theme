+++
title = "Tralume Feature Demo"
date = 2025-12-28T12:09:00+08:00
draft = false
description = "A comprehensive demo of Tralume features: AI marker, callouts, code highlighting, tables, and more."
tags = ["demo", "features"]
license = "cc-by-4.0"

[ai]
  level = "assist"
  usage = ["outline", "wording", "code", "translate"]
  review = "edited"
  tools = ["claude", "chatgpt"]
+++

This post demonstrates all content features supported by Tralume.

## All Callout Types

> [!NOTE]
> **Note** — General information.

> [!TIP]
> **Tip** — Helpful advice or best practices.

> [!IMPORTANT]
> **Important** — Key information that needs attention.

> [!WARNING]
> **Warning** — Something to be aware of.

> [!CAUTION]
> **Caution** — Potential risk.

> [!DANGER]
> **Danger** — Critical warning.

## Custom Title Callout

> [!TIP]+ Try Custom Titles
> You can add a space and text after the type to customize the title.

## Code Highlighting & Copy

All code blocks have a copy button in the upper-right corner (shown on hover).

```javascript
// JavaScript: async data fetching
async function fetchPosts(page = 1) {
  const res = await fetch(`/api/posts?page=${page}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.items.map(item => ({
    title: item.title,
    url: item.url,
    date: new Date(item.published_at)
  }));
}
```

```toml
# TOML configuration example
[params.theme]
  defaultMode = 'auto'
  defaultGlassStrength = 45
  defaultReaderWidthValue = 80
```

```bash
# Shell commands
hugo new site mysite
cd mysite
hugo mod init example.com/mysite
hugo mod get forgejo.alexma.top/tralume-org/hugo-theme
hugo server -D
```

## Tables

| Feature | Status | Notes |
|---------|--------|-------|
| Dark/Light mode | Supported | auto / light / dark |
| Acrylic effect | Supported | Adjustable opacity & blur |
| Multilingual | Supported | en-US + zh-Hans |
| Search | Supported | Pagefind / Meilisearch |
| Comments | Supported | Giscus / Remark42 / Waline / Twikoo / Utterances |
| Analytics | Supported | Umami |
| Friends links | Supported | i18n grouping & weight sorting |

## Task Lists

- [x] Initialize Hugo site
- [x] Install Tralume theme
- [x] Configure multilingual support
- [ ] Deploy to production
- [ ] Set up comment system

## Footnotes

Hugo supports native Markdown footnotes[^1].

[^1]: This is the footnote content, rendered at the bottom of the page.

## Horizontal Rule

---

The horizontal rule above separates two content sections.
