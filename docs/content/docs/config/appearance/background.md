---
title: Custom Background
weight: 40
---

Controls the site background image source and background blur.

Three providers are supported: direct image URL, local upload (stored only in the reader's browser), and the Pixaroa random image service.

## Where to configure

Set in `hugo.toml` at your site root:

```toml
[params.theme]
  # Note: Default background provider for first-time visitors.
  # Options:
  #   - 'url'    (default): use the image URL filled in by the user (if any).
  #   - 'upload' : use a locally uploaded image (only visible in that browser).
  #   - 'pixaroa': use the Pixaroa random image service.
  defaultBackgroundProvider = 'url'

  # Note: If you want to use Pixaroa, set its base URL here.
  # Note: Leaving it empty disables Pixaroa.
  # Examples:
  #   - https://pixaroa.example.com/   (recommended: end with a slash)
  #   - /pixaroa/                      (same-origin reverse proxy; also end with a slash)
  pixaroaHost = 'https://your-pixaroa-api.com/'
```

## Provider details

### Pixaroa advanced settings

When using Pixaroa, the settings panel exposes additional options under an expandable "Advanced" section:

- **Tier** (`settings_tier`): image quality/size tier (auto, 1–6)
- **Orientation** (`settings_orientation`): auto, landscape, portrait, or square
- **Format** (`settings_format`): auto, jxl, avif, webp, jpeg, or png

These parameters are sent to the Pixaroa API and affect which images are returned.

## Notes

- **Background blur**: the settings panel provides a dedicated slider for blurring the background image in the **Appearance tab** (not the Background tab). This stacks with the acrylic blur.
- **Upload privacy**: "upload" does not send the image to your server; it stores it in the browser (IndexedDB) on the reader's device.

## Priority rules

1. **User local settings**: URL, uploaded image, or Pixaroa choice from the settings panel take highest priority.
2. **Site config**: `defaultBackgroundProvider` is used as the default provider.

## Background theme color strategy

The theme includes a background extraction module: once a background provider is active, it extracts a representative color from the background image and matches it to one of the fixed 17 theme colors (Material 500).

### Color extraction algorithms

The settings panel lets readers choose from four extraction algorithms:

| Algorithm | Behavior |
| --- | --- |
| `weighted-average` | Computes a luminance-weighted average of all pixels |
| `vibrant-pixel` | Picks the most saturated pixel |
| `hue-histogram` | Builds a hue histogram and returns the dominant hue at full saturation |
| `kmeans-vibrant` | Clusters pixels with k-means and returns the most vibrant cluster center |

### Manual override

In **Appearance → Theme color**, you can choose whether to override provider strategies:

1. **Switch off**: use provider dynamic/manual theme color strategy.
2. **Switch on**: globally override provider strategy, then choose one of the 17 presets or enter a custom `#RRGGBB`.

## Background image attribution

When a background image is loaded from Pixaroa, Tralume automatically displays an attribution bar at the bottom of the page. It shows:

- Image title
- Photographer name
- License information
- Source link (the image's origin URL)

The attribution bar can be dismissed by clicking the close button. It uses the following i18n keys: `backgroundAttributionBarFormat`, `backgroundAttributionTitle`, `backgroundAttributionPhotographer`, `backgroundAttributionLicense`, `backgroundAttributionSource`, and `backgroundAttributionClose`.
