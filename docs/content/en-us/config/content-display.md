# Content Display & Summaries

Controls how many posts appear on the homepage, and how long summaries are in list views.

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

In post lists or timelines, if a page has no explicit description, the theme extracts a snippet from the start of the content as the summary. You can control the maximum length.

Set in `hugo.toml`:

```toml
[params]
  # Note: Summary length (characters) in homepage and list cards.
  articleCardSummaryLength = 160

  # Note: Summary length (characters) on the /posts timeline page.
  articleTimelineSummaryLength = 160
```

## Tips

- **Manual summary split**: use `<!--more-->` in your content to define the summary region (the theme prefers it).
- **Prefer `description`**: if a page sets `description`, the theme uses it as the summary on the homepage and some lists (e.g. timeline).
