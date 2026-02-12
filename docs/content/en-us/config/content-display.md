# Content Display & Summaries

Controls homepage post limits, `/posts` and `/pages` pagination, and summary length in list cards.

## Homepage recent posts limit

To keep the homepage tidy, you can limit the number of recent posts shown. Extra posts are accessible via a “View more” button.

### Where to configure

Set in `hugo.toml`:

```toml
[params.home]
  # Note: Number of recent posts shown on the homepage.
  recentPostsLimit = 6
```

## Summary truncation length

In post lists, if a page has no explicit description, the theme extracts a snippet from the start of the content as the summary. You can control the maximum length.

Set in `hugo.toml`:

```toml
[params]
  # 说明：首页与列表卡片的摘要长度（字符数）。
  articleCardSummaryLength = 160
```

## /posts and /pages page size

The `/posts` and `/pages` entry pages now share the exact same overview UI: horizontal card list, matching pager UI, and the same pagination/infinite-scroll switch behavior.

Set in `hugo.toml`:

```toml
[params.posts]
  # 说明：统一控制 /posts 与 /pages 每页显示数量；总数会按该值自动分页。
  # 注意：当值小于等于 0 时会回退到默认值 10。
  pageSize = 10
```

## Tips

- **Manual summary split**: use `<!--more-->` in your content to define the summary region (the theme prefers it).
- **Prefer `description`**: if a page sets `description`, the theme uses it as the summary on the homepage, `/posts`, and `/pages` list cards.
- **Mobile pagination**: on small screens, the pager is merged into one bar showing only previous / current / next.
- **Scroll mode applies to both lists**: the setting panel's pagination/infinite-scroll switch now affects both `/posts` and `/pages`.
