# Friends Links

Controls how links are displayed on the “Friends” page, including i18n grouping and manual weight ordering.

## Data file location

Create `data/friends.yaml` in your Hugo site (you can also use `.toml` or `.json`). The reader-facing page is typically labeled "Friends".

## Example data

```yaml
- name:
    zh-Hans: "我的站点"
    en-US: "My Site"
    default: "My Site" # Optional: fallback value when the current language is missing.
  description:
    zh-Hans: "你好"
    en-US: "Hello"
  url: "https://example.com"
  avatar: "https://example.com/avatar.png"
  # Optional: manual sort weight; smaller values appear first, and the default is 10000.
  weight: 10
  # Optional: used for the "prefer current language" grouping and card language tags.
  language: ["zh-Hans", "en-US"]

# Note: If you do not need i18n, you can use plain strings directly.
- name: "My Site"
  description: "Hello"
  url: "https://example.com"
  avatar: "https://example.com/avatar.png"
  # Optional: when omitted, the theme treats it as 10000.
  weight: 100
  # Optional: used for the "prefer current language" grouping and card language tags.
```

## Key features

- **i18n-friendly**: `name` and `description` can be plain strings or a language map.
- **Weight ordering**: smaller `weight` values appear first; when omitted, the theme uses `10000`.
- **Random within equal weights**: links with the same `weight` are shuffled at site build time. Refreshing a deployed static page usually won’t change the order.
- **Prefer current language as a group**: links whose `language` includes the current site language are rendered first as one group, then links from other languages are rendered after that.
