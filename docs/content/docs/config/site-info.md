---
title: Site Info & SEO
weight: 50
---

Controls the site description and search engine crawler rules (e.g. Google, Bing).

## Site description

Provide a short description for your site. It appears in search result previews and is also used as the RSS feed description.

Set in `hugo.toml`:

```toml
[params]
  # Note: Short site description.
  description = 'Tralume: a modern, lightweight, beautiful Hugo theme.'
```

## Favicon

Tralume can output favicon links from `params.favicon`. Put the icon files in your site's `static/` directory, then reference them with root-relative paths:

```toml
[params.favicon]
  icon = '/favicon.ico'
  svg = '/favicon.svg'
  appleTouch = '/apple-touch-icon.png'
  manifest = '/site.webmanifest'
```

Supported fields:

- `icon`: regular favicon, usually `.ico` or `.png`
- `svg`: SVG favicon for modern browsers
- `appleTouch`: iOS home screen icon
- `manifest`: web app manifest

## Social share cards (Open Graph / Twitter Card)

Tralume outputs Open Graph and Twitter Card metadata automatically.

The theme resolves the share image in this priority order:

1. **Page-level front matter**: `image` > `featuredImage` > `featured_image` > `cover` > `thumbnail` > `banner` > first image resource in the Page Bundle
2. **Site-wide parameters** (in order): `params.socialImage` > `params.seo.image` > `params.seo.cardImage`
3. **Fallback**: `params.favicon.appleTouch` > `params.favicon.icon` > no image

Set a site-wide default share image:

```toml
[params]
  # Note: Site-wide social share card image.
  # Note: This is checked first among site-wide defaults.
  socialImage = '/social-card.png'
```

You can also set defaults under `params.seo`:

```toml
[params.seo]
  # Note: Site-wide default social share card image.
  # Note: A 1200x630 image is recommended.
  image = '/seo-default.png'
  # Note: image takes priority over cardImage.
  cardImage = '/social-card.png'
```

To use any supported page-level image field, add it to front matter:

```toml
+++
# Note: Overrides the share card image for this page only.
# Note: Any of image, featuredImage, featured_image, cover, thumbnail, banner works.
featuredImage = '/posts/example/cover.png'
+++
```

## Structured data author and publisher (JSON-LD)

Tralume outputs JSON-LD for the home page and article pages.

- Article pages can include `author`
- Home and article pages can include `publisher`
- `publisher.logo` can be set explicitly, and falls back through `params.seo.logo` > `params.favicon.appleTouch` > `params.favicon.icon` when omitted

Set site-wide author and publisher metadata in `hugo.toml`:

```toml
[params.seo.author]
  # Note: Default author name for article pages.
  name = 'AlexMa'
  # Note: Author profile or about page URL.
  url = 'https://example.com/about/'

[params.seo.publisher]
  # Note: Publisher name used in structured data.
  name = 'AlexMa\'s Blog'
  # Note: Publisher homepage URL.
  url = 'https://example.com/'
  # Note: Publisher logo image.
  # Note: Use a stable absolute URL or root-relative path.
  logo = '/publisher-logo.png'
```

To override the author for a single article, add this to front matter:

```toml
+++
# Note: Overrides the structured-data author for this article.
[author]
  name = 'Guest Author'
  url = 'https://example.com/team/guest-author/'
+++
```

## Robots rules (robots.txt)

Tell search engines which pages they may crawl, and optionally disable crawling for the entire site (useful before a public launch).

Enable Hugo's robots.txt generation at the top level of `hugo.toml`:

```toml
enableRobotsTXT = true

[params.robotsTxt]
  # Note: Whether to allow search engines to crawl.
  # If set to false, the whole site is disallowed (Disallow: /).
  enabled = true

  # Note: Whether to include the sitemap link in robots.txt.
  sitemap = true
```
