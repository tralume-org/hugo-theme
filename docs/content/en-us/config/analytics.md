# Analytics (Umami)

Integrates Umami, a lightweight and privacy-friendly analytics system, with optional “blocked script” notice and per-page views display.

## Inject the Umami script

Set in `hugo.toml`:

```toml
[params.analytics]
  provider = 'umami'

  [params.analytics.providers.umami]
    # Note: Umami script URL.
    scriptUrl = 'https://analytics.example.com/script.js'
    # Note: Website ID from your Umami dashboard.
    websiteId = 'your-website-id'

    # Optional: show a friendly notice if the script is blocked by an ad blocker.
    blockNotice = true
```

## Page views

Calls Umami’s public API to show page views under the article title.

```toml
[params.analytics.providers.umami.pageviews]
  # Note: Umami instance base URL (do not include /script.js).
  host = 'https://analytics.example.com'

  # Note: Share ID for this site.
  # Note: Enable "share URL" in Umami; the last random string in the link is the ID.
  shareId = 'your-share-id'
```

## Notes

- **Privacy-first**: analytics is handled by Umami; the theme only displays results when enabled.
- **Graceful degradation**: if requests are blocked (network/adblock), the page views item is hidden instead of showing broken UI.
