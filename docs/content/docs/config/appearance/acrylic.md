---
title: Acrylic Effect
weight: 20
---

Controls the acrylic (frosted glass) effect used by major surfaces (e.g. cards, navigation).

## Where to configure

Set in `hugo.toml` at your site root:

```toml
[params.theme]
  # Note: Default acrylic opacity (percentage).
  # Range: number between 0 and 95.
  # Higher = more opaque; lower = more transparent.
  defaultGlassStrength = 45
```

## Settings panel controls

The appearance tab in the settings panel provides two sliders:

1. **Opacity** (`settingsPanelGlassRangeLabel`): Controls how transparent the acrylic surfaces are. Range: 0%–95%, default: `defaultGlassStrength`.
2. **Blur radius** (`settingsPanelGlassBlurLabel`): Controls the strength of the backdrop blur. Range: 0px–48px, default: 24px.

Readers can adjust both in real time, and their choices are saved locally.

## Priority rules

1. **User adjustment**: readers can change both values in the settings panel; the saved values take highest priority.
2. **Site config**: for new visitors, `defaultGlassStrength` is used as the initial opacity value.
