---
title: Theme Mode & Theme Color
weight: 10
date: '2026-06-06T00:00:00+08:00'
---

Controls the default color mode of your site and the default theme seed color. The theme supports following the system setting, forcing light/dark, and setting a default accent color.

## Where to configure

Set in `hugo.toml` (or `config.toml`) at your site root:

```toml
[params.theme]
  # Note: Default mode for first-time visitors.
  # Options:
  #   - 'auto'  (recommended): follow the system/browser preference.
  #   - 'light': force light mode.
  #   - 'dark' : force dark mode.
  defaultMode = 'auto'

  # Note: Default theme seed color in #RRGGBB format.
  # If unset, the theme defaults to #1f2329.
  # Readers can override this via the settings panel (Appearance → Theme color).
  defaultSeed = '#1f2329'
```

The `defaultSeed` parameter sets the site's accent color used by Material Design 3. It accepts a 6-digit hex color code; invalid values are silently ignored and fall back to the built-in default.

## Settings panel controls

The Appearance tab provides:

- **Theme mode**: auto / light / dark toggle
- **Theme color**: a 17-color Material 500 palette, plus a custom `#RRGGBB` input

## Priority rules

1. **User choice**: if the reader changes the mode or seed color in the settings panel, it is stored locally and takes highest priority.
2. **Site config**: for first-time visitors, `defaultMode` and `defaultSeed` are used.
3. **Fallback**: if unset, mode defaults to `auto` and seed defaults to `#1f2329`.
