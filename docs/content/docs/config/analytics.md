---
title: Analytics (Umami)
weight: 120
date: '2026-06-06T00:00:00+08:00'
---

Integrates Umami, a lightweight and privacy-friendly analytics system, with optional "blocked script" notice, per-page views display, and built-in interaction events for theme components.

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
    # When enabled, a multi-step dialog guides the reader through:
    #   1. A greeting explaining why Umami is used
    #   2. What data is collected
    #   3. Why the script may be blocked
    #   4. How to whitelist the site in common ad blockers
    blockNotice = true
```

## Page views

Calls Umami's public API to show page views under the article title.

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

## Event reference

The list below covers all built-in Umami custom events currently emitted by the theme.

### Page and reading

| Event | Meaning | Main extra fields |
| --- | --- | --- |
| `scroll_depth` | Fired when the reader reaches a depth threshold. The current thresholds are 25 / 50 / 75 / 100, so seeing multiple entries on the same page is expected. | `depth` |
| `open_outline` | Fired when the mobile article outline overlay is opened. | `heading_count` |
| `close_outline` | Fired when the mobile article outline overlay is closed. | none |
| `click_outline_item` | Fired when a heading link inside the article outline is clicked. | `heading_id`, `heading_level` |
| `view_pageviews_widget` | Fired after the page views widget is rendered successfully with data. | none |
| `view_comments` | Fired when the comments section enters the viewport and meets the visibility threshold. | `provider` |

### Content actions

| Event | Meaning | Main extra fields |
| --- | --- | --- |
| `copy_code` | Fired after a code block is copied successfully. | `lang`, `line_count` |
| `copy_permalink` | Fired after the article permalink is copied successfully. | `title` |
| `click_outbound_link` | Fired when an external link inside article content is clicked. | `target_url`, `target_host`, `link_text`, `link_position` |
| `click_edit_source` | Fired when the "Edit this page" or source link is clicked. | `target_url`, `target_host` |
| `click_tag` | Fired when a tag entry is clicked. | `tag` |

### Navigation and lists

| Event | Meaning | Main extra fields |
| --- | --- | --- |
| `open_mobile_menu` | Fired when the mobile menu is opened. | `position` |
| `close_mobile_menu` | Fired when the mobile menu is closed. | `position` |
| `open_pages_menu` | Fired when the top-bar Pages panel is opened. | `position` |
| `click_nav_link` | Fired when a theme navigation link is clicked. | `label`, `target_path`, `position` |
| `click_article_card` | Fired when an article card is clicked to open its detail page. | `target_path`, `title`, `position` |
| `load_more_posts` | Fired when infinite scrolling successfully loads the next page of posts. | `feed`, `current_page`, `next_page` |
| `reach_list_end` | Fired when infinite scrolling reaches the end of the list. | `feed`, `page` |

### Settings and preferences

| Event | Meaning | Main extra fields |
| --- | --- | --- |
| `open_settings_panel` | Fired when the settings panel is opened. | none |
| `change_theme_mode` | Fired when the theme mode changes to auto, light, or dark. | `mode` |
| `change_glass_strength` | Fired when the acrylic strength value changes. | `strength` |
| `change_reader_width` | Fired when the reader width changes. | `width` |
| `change_background_provider` | Fired when the background provider changes between URL, Upload, and Pixaroa. | `provider` |

## How to read Umami entries

- A plain path such as `/zh-hans/pages/affiliates/` is Umami's built-in pageview record, not a theme-defined custom event.
- `Visitor from ... using ...` is Umami's session summary for location, browser, operating system, and device type.
- `view_pageviews_widget on /...` means the page views widget rendered successfully.
- `view_comments on /...` means the comments section became visible in the viewport.
- Multiple `scroll_depth` entries on the same page usually mean the reader crossed the 25%, 50%, 75%, and 100% thresholds in sequence.

## Notes

- **Privacy-first**: analytics is handled by Umami; the theme only displays results when enabled.
- **Graceful degradation**: if requests are blocked (network/adblock), the page views item is hidden instead of showing broken UI.
- **Consistent context**: each event automatically includes page path, locale, and page type for easier filtering in Umami.
