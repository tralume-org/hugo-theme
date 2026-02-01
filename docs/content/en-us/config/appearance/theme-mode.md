# Theme Mode (Light/Dark)

Controls the default color mode of your site. The theme supports following the system setting, or forcing light/dark.

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
```

## Priority rules

1. **User choice**: if the reader changes the mode in the settings panel, it is stored locally and takes highest priority.
2. **Site config**: for first-time visitors, `defaultMode` is used.
3. **Fallback**: if unset, the theme defaults to `auto`.
