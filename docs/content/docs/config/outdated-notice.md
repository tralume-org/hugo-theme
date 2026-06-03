---
title: Outdated Content Notice
weight: 150
---

Tralume can automatically show a warning banner on article pages when the content is older than a configurable number of days. This helps readers understand that the information may no longer be up to date.

## Default behavior

By default, any article older than **180 days** (approximately 6 months) will display an inline callout below the title:

> ⚠ This article was published over 180 days ago. The information may no longer be applicable.

The default threshold is defined in the theme partial (`layouts/partials/outdated-notice.html`) and applies to **all sections** (posts, pages, etc.).

## Site-wide threshold

To change the default threshold for your entire site, add `outdatedThresholdDays` under `[params]` in your site config:

```toml
[params]
  # Note: Articles older than this many days will show the outdated notice.
  # Set to a larger value to be more lenient, or smaller for stricter aging.
  outdatedThresholdDays = 365
```

## Per-page overrides

You can override the threshold for individual pages via Front Matter:

```yaml
---
# Note: Override the threshold for this specific page.
outdatedThresholdDays: 90
---
```

To disable the notice entirely for a specific page:

```yaml
---
# Note: Force-hide the outdated notice on this page.
showOutdatedWarning: false
---
```

Set `outdatedThresholdDays` to `0` to effectively disable the notice (any positive age will exceed the threshold).

## How the date is determined

The age is calculated from the **most recent** meaningful date:

1. If the page has a `lastmod` field that differs from `date`, `lastmod` is used.
2. Otherwise, `date` is used.

This means an article originally published 3 years ago but **updated last week** will not show the outdated warning.

## i18n

The warning text is managed via the i18n key `outdatedWarning`, which accepts a `{{ .Days }}` placeholder:

| Language | Key | Default translation |
|---|---|---|
| English (`en-US`) | `outdatedWarning` | `This article was published over {{ .Days }} days ago. The information may no longer be applicable.` |
| Simplified Chinese (`zh-Hans`) | `outdatedWarning` | `本文发布于 {{ .Days }} 天前，部分信息可能已不再适用。` |

To customize the message, override the key in your site's `i18n/` directory.

## Tips

- **Use `lastmod` actively**: Keep the `lastmod` field up to date when you revise content. This automatically suppresses the warning for freshly reviewed articles.
- **Tune per section**: If your site has sections with different content lifetimes (e.g., news vs. reference), adjust `outdatedThresholdDays` per page or section `_index.md`.
- **Combine with `showOutdatedWarning: false`**: Use this on timeless pages (e.g., "About" or "Privacy Policy") that never need the warning.
- **Editorial review**: Consider pairing the outdated notice with a periodic review workflow — when you see the banner while reading your own site, it's time to refresh the content.
