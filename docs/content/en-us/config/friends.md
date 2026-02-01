# Friends Links

Controls how links are displayed on the “Friends” page, including i18n grouping and random ordering.

## Data file location

Create `data/friends.yaml` in your Hugo site (you can also use `.toml` or `.json`).

## Example data

```yaml
- name:
    zh-Hans: "我的站点"
    en-US: "My Site"
    default: "My Site" # Optional fallback when current locale is missing.
  description:
    zh-Hans: "你好"
    en-US: "Hello"
  url: "https://example.com"
  avatar: "https://example.com/avatar.png"
  # Optional, used for "prefer current language" grouping and language badges.
  language: ["zh-Hans", "en-US"]

# If you don’t need i18n
- name: "My Site"
  description: "Hello"
  url: "https://example.com"
  avatar: "https://example.com/avatar.png"
  # Optional, used for "prefer current language" grouping and language badges.
```

## Key features

- **i18n-friendly**: `name` and `description` can be plain strings or a language map.
- **Random order**: the list is shuffled at site build time (e.g. local rebuild or deployment). Refreshing a deployed static page usually won’t change the order.
- **Prefer current language**: if a link’s `language` includes the current site language, it is grouped into “preferred”.
