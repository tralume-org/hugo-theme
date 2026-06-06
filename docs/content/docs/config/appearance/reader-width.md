---
title: Reading Width
weight: 30
date: '2026-06-06T00:00:00+08:00'
---

Different screens benefit from different line lengths. This setting lets you choose a comfortable default maximum width for the reading area (as a percentage of viewport width).

## Where to configure

Set in `hugo.toml` at your site root:

```toml
[params.theme]
  # Note: Default max reading width (vw = % of viewport width).
  # Range: number between 60 and 92.
  # Example: 80 means the content area is at most 80% wide.
  defaultReaderWidthValue = 80
```

## Notes

- **Clamped range**: the theme clamps the value to 60%–92% for better readability across screens.
- **Responsive**: on narrow screens (e.g. phones), this setting is ignored so content can use the full width.

## Priority rules

1. **User adjustment**: the width chosen via the settings panel is stored locally.
2. **Site config**: for new visitors, `defaultReaderWidthValue` is used.
