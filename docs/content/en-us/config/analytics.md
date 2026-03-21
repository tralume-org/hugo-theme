# Analytics (Umami)

Integrates Umami, a lightweight and privacy-friendly analytics system, with optional “blocked script” notice, per-page views display, and built-in interaction events for theme components.

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

## Built-in interaction events

After the script is injected, the theme automatically reports Umami custom events for common interactions without extra template wiring.

- **Reading flow**: `scroll_depth`, `open_outline`, `close_outline`, `click_outline_item`
- **Content actions**: `copy_code`, `copy_permalink`, `click_outbound_link`, `click_tag`
- **Global navigation**: `open_mobile_menu`, `close_mobile_menu`, `open_pages_menu`, `click_nav_link`
- **UI preferences**: `open_settings_panel`, `change_theme_mode`, `change_glass_strength`, `change_reader_width`, `change_background_provider`
- **Lists and side modules**: `load_more_posts`, `reach_list_end`, `click_article_card`, `view_comments`, `click_edit_source`, `view_pageviews_widget`

## Notes

- **Privacy-first**: analytics is handled by Umami; the theme only displays results when enabled.
- **Graceful degradation**: if requests are blocked (network/adblock), the page views item is hidden instead of showing broken UI.
- **Consistent context**: each event automatically includes page path, locale, and page type for easier filtering in Umami.
