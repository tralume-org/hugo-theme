---
title: Custom Footer
weight: 110
date: '2026-06-06T00:00:00+08:00'
---

Append your own items after the copyright and RSS link in the site footer.

This is useful for adding an ICP record number, a privacy policy link, or an entry point to a friends page. Items are separated by `|` and displayed after the RSS link.

## Where to configure

Set in `hugo.toml`:

```toml
[params.footer]
  # Note: Items appended after the RSS link.
  afterRss = [
    # Example 1: Plain text
    { text = 'ICP 12345678' },

    # Example 2: Linked item
    { text = 'Privacy Policy', url = '/privacy/' },

    # Example 3: Use an i18n key (for multilingual sites)
    { i18n = 'footerLinkContact' , url = '/contact/' }
  ]
```
