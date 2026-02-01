# Custom Background

Controls the site background image source and background blur.

Three providers are supported: direct image URL, local upload (stored only in the reader’s browser), and the Pixaroa random image service.

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

## Notes

- **Background blur**: the settings panel provides a dedicated slider for blurring the background image itself. This stacks with the acrylic blur.
- **Upload privacy**: “upload” does not send the image to your server; it stores it in the browser (IndexedDB) on the reader’s device.

## Priority rules

1. **User local settings**: URL, uploaded image, or Pixaroa choice from the settings panel take highest priority.
2. **Site config**: `defaultBackgroundProvider` is used as the default provider.
