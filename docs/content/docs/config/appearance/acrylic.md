---
title: Acrylic Effect
weight: 20
---

Controls the acrylic (frosted glass) strength used by major surfaces (e.g. cards, navigation).

## Where to configure

Set in `hugo.toml` at your site root:

```toml
[params.theme]
  # Note: Default acrylic strength (percentage).
  # Range: number between 0 and 95.
  # Higher = more opaque; lower = more transparent.
  defaultGlassStrength = 45
```

## Priority rules

1. **User adjustment**: readers can change the strength in the settings panel; the saved value takes highest priority.
2. **Site config**: for new visitors, `defaultGlassStrength` is used as the initial value.
