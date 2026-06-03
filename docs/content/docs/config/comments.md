---
title: Comments (Remark42)
weight: 130
---

Integrate the self-hosted Remark42 comment system and let the widget follow the current site theme and page language automatically. By default, comment threads use the formal URL of the default language instead of being split by language-specific URLs.

## Basic configuration

Set this in `hugo.toml`:

```toml
[params.comments]
  provider = 'remark42'
  # Note: Strategy used to merge comment threads.
  # Note: defaultLanguage uses the formal URL of the default language; this is the theme default.
  mergeStrategy = 'defaultLanguage'

  [params.comments.providers.remark42]
    # Note: Remark42 service URL. It must match REMARK_URL in the backend configuration.
    host = 'https://remark42.example.com'
    # Note: Site ID. It must match SITE in the Remark42 backend startup settings.
    siteId = 'my-site'
```

## Optional frontend parameters

```toml
[params.comments.providers.remark42]
  # Note: Maximum number of comments shown by default on mobile.
  maxShownComments = 20
  # Note: Whether to show the email subscription entry to visitors.
  showEmailSubscription = true
  # Note: Whether to show the RSS subscription entry to visitors.
  showRssSubscription = true
  # Note: Whether to enable a simpler interface.
  simpleView = false
  # Note: Whether to hide the Remark42 footer. Hidden by default (true); set to false to show it again.
  noFooter = true
```

## Notes

- The comments widget is rendered as a dedicated card after the article metadata card.
- The widget theme follows the current site light/dark mode automatically.
- The widget locale follows the current page language directly; in this theme, `zh-Hans` becomes `zh` and `en-US` becomes `en`.
- `mergeStrategy = 'smartPath'`: merge `/zh-hans/posts/test/` and `/en-us/posts/test/` into one neutral thread; when `defaultContentLanguageInSubdir = true` the thread URL stays `/posts/test/`, and when `defaultContentLanguageInSubdir = false` with `params.i18nRouting.enableAutoEntry = true` it becomes `/auto/posts/test/` so notification emails also land on the smart entry page first.
- `mergeStrategy = 'defaultLanguage'`: always use the default-language formal URL as the shared thread identifier. This is the theme default. Keep the default language at the lowest `weight` so Hugo's language order stays aligned.
- `mergeStrategy = 'none'`: keep one independent thread per language URL.
- If `host` is not set, the comments card is not rendered.
