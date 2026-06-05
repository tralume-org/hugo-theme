---
title: Content Display & Summaries
weight: 60
---

Controls homepage post limits, `/posts` and `/pages` pagination, and summary length in list cards.

## Homepage recent posts limit

To keep the homepage tidy, you can limit the number of recent posts shown. Extra posts are accessible via a "View more" button.

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
  # Note: Summary length for the homepage and list cards, in characters.
  articleCardSummaryLength = 160
```

## /posts and /pages page size

The `/posts` and `/pages` entry pages now share the exact same overview UI: horizontal card list, matching pager UI, and the same pagination/infinite-scroll switch behavior.

Set in `hugo.toml`:

```toml
[params.posts]
  # Note: Controls the number of items shown per page for both /posts and /pages; the total list paginates automatically.
  # Note: Values less than or equal to 0 fall back to the default value of 10.
  pageSize = 10
```

## Tips

- **Manual summary split**: use `<!--more-->` in your content to define the summary region (the theme prefers it).
- **Prefer `description`**: if a page sets `description`, the theme uses it as the summary on the homepage, `/posts`, and `/pages` list cards.
- **Mobile pagination**: on small screens, the pager is merged into one bar showing only previous / current / next.
- **Scroll mode applies to both lists**: the setting panel's pagination/infinite-scroll switch now affects both `/posts` and `/pages`.

## Article card cover images

Article cards in list views automatically display a cover image when available. The theme checks these front matter fields in order:

`image` > `featuredImage` > `featured_image` > `cover` > `thumbnail` > `banner`

If none match, the theme falls back to the first image resource inside the Page Bundle. When a cover image is found, the card gains an `article-card--with-cover` class and renders the image above the title.

## Content type matching

The `/posts` and `/pages` sections also match content where the front matter `type` is set to `posts` or `pages`. This means setting `type: posts` in a page's front matter will include it in the posts list UI, even if it lives outside the `/posts/` content directory.
