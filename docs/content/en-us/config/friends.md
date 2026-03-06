# Friends Links

Controls how links are displayed on the “Friends” page, including i18n grouping and manual weight ordering.

## Data file location

Create `data/friends.yaml` in your Hugo site (you can also use `.toml` or `.json`). The reader-facing page is typically labeled "Friends".

## Example data

```yaml
- name:
    zh-Hans: "我的站点"
    en-US: "My Site"
    default: "My Site" # 可选：当前语言缺失时的兜底值。
  description:
    zh-Hans: "你好"
    en-US: "Hello"
  url: "https://example.com"
  avatar: "https://example.com/avatar.png"
  # 可选：手动排序权重；数值越小越靠前，默认值为 10000。
  weight: 10
  # 可选：用于“当前语言优先”分组与卡片语言标签。
  language: ["zh-Hans", "en-US"]

# 说明：如果不需要 i18n，可以直接写字符串。
- name: "My Site"
  description: "Hello"
  url: "https://example.com"
  avatar: "https://example.com/avatar.png"
  # 可选：未填写时按 10000 处理。
  weight: 100
  # 可选：用于“当前语言优先”分组与卡片语言标签。
```

## Key features

- **i18n-friendly**: `name` and `description` can be plain strings or a language map.
- **Weight ordering**: smaller `weight` values appear first; when omitted, the theme uses `10000`.
- **Random within equal weights**: links with the same `weight` are shuffled at site build time. Refreshing a deployed static page usually won’t change the order.
- **Prefer current language as a group**: links whose `language` includes the current site language are rendered first as one group, then links from other languages are rendered after that.
