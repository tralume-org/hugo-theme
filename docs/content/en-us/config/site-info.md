# Site Info & SEO

Controls the site description and search engine crawler rules (e.g. Google, Bing).

## Site description

Provide a short description for your site. It appears in search result previews and is also used as the RSS feed description.

Set in `hugo.toml`:

```toml
[params]
  # Note: Short site description.
  description = 'Tralume: a modern, lightweight, beautiful Hugo theme.'
```

## Robots rules (robots.txt)

Tell search engines which pages they may crawl, and optionally disable crawling for the entire site (useful before a public launch).

Enable Hugo’s robots.txt generation at the top level of `hugo.toml`:

```toml
enableRobotsTXT = true

[params.robotsTxt]
  # Note: Whether to allow search engines to crawl.
  # If set to false, the whole site is disallowed (Disallow: /).
  enabled = true

  # Note: Whether to include the sitemap link in robots.txt.
  sitemap = true
```
