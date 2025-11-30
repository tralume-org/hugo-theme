[English](README.md) ｜ [简体中文](README.zh-Hans.md)

# Tralume Hugo Theme

Modern Material Design 3 + acrylic glassmorphism Hugo theme with built-in multilingual support (en-US / zh-Hans), article timeline, reading progress, code-block copy, and a configurable settings panel.

## Quick Start

1. Prepare Hugo ≥ 0.146.0 (no extended required) plus Node 18+ and npm.
2. Initialize Hugo Modules at your site root and pull the theme.
3. Generate the npm package manifest and install dependencies (the theme only depends on `@material/web`).
4. Write the base config (languages, menu, theme parameters).
5. Create content and data files, then run `hugo server` to preview.

## Install & Initialize

```bash
# Note: Initialize the site's Hugo module and add the Tralume theme.
hugo mod init example.com/blog
hugo mod get forgejo.alexma.top/tralume-org/hugo-theme

# Note: Generate package.json from module dependencies (package.hugo.json) and install npm deps.
hugo mod npm pack
npm install
```

If you prefer Git submodules instead of Hugo Modules:

```bash
# Note: Pull the theme via Git submodule for setups not using Hugo Modules.
git submodule add https://forgejo.alexma.top/tralume-org/hugo-theme.git themes/tralume

# Note: Enter the theme directory and install npm dependencies (no hugo mod npm pack needed in submodule mode).
cd themes/tralume
npm install
```

## Base Config Example (`config/_default/hugo.toml`)

```toml
# Note: Basic site information and output formats.
baseURL = 'https://example.com/'
defaultContentLanguage = 'en-US'
defaultContentLanguageInSubdir = true

[outputs]
  home = ['HTML', 'RSS']
  section = ['HTML', 'RSS']
  taxonomy = ['HTML', 'RSS']
  term = ['HTML', 'RSS']

# Note: Multilingual basics; keep menu structure under [menu] and handle text via i18n files.
[languages]
  [languages."en-US"]
    languageName = 'English'
    languageCode = 'en-US'
    weight = 1
    title = 'Tralume'

  [languages."zh-Hans"]
    languageName = '简体中文'
    languageCode = 'zh-Hans'
    weight = 2
    title = 'Tralume 主题'

[menu]
  [[menu.main]]
    identifier = 'home'
    name = 'Home'
    pageRef = '/'
    weight = 10
  [[menu.main]]
    identifier = 'posts'
    name = 'Posts'
    pageRef = '/posts'
    weight = 20
  [[menu.main]]
    identifier = 'tags'
    name = 'Tags'
    pageRef = '/tags'
    weight = 30
  [[menu.main]]
    identifier = 'friends'
    name = 'Friends'
    pageRef = '/friends'
    weight = 40

# Note: Import the theme via Hugo Modules; if using a submodule, switch to theme = 'tralume'.
[module]
  [[module.imports]]
    path = 'forgejo.alexma.top/tralume-org/hugo-theme'
  [module.hugoVersion]
    min = '0.146.0'
    extended = false

[params]
  # Note: Site description and summary length settings.
  description = 'Tralume: Material 3 glassmorphism Hugo theme.'
  # Note: Summary length for list cards (characters).
  articleCardSummaryLength = 160
  # Note: Summary length for timeline items (characters).
  articleTimelineSummaryLength = 160

  [params.theme]
    # Note: Theme mode options.
    defaultMode = 'auto'
    # Note: Glass strength presets.
    defaultGlassStrength = 'soft'
    # Note: Reader width presets.
    defaultReaderWidth = 'balanced'
    # Note: Custom width in rem with higher priority than presets.
    defaultReaderWidthValue = 64
```

Tip: the menu above is shared across languages. If you need different names per language, use `languages.*.menus.main` under each language section.

## Content Structure & Multilingual Writing

- Put posts under `content/posts/`. The theme ignores `_index` files and renders pages by `.Lang`.
- To ensure proper pairing, add `.zh` or `.zh-hans` suffixes for Chinese filenames (e.g., `hello-world.zh.md`); leave English filenames without suffixes.
- The home page body comes from `content/_index.md` and is rendered in an acrylic card—use it for a welcome message.
- The friends page uses `content/friends/_index.md` (can be empty; data comes from `data/friends.yaml`).

```bash
# Note: Create a pair of EN/ZN posts with language suffixes for proper filtering.
hugo new posts/hello-world.en-US.md
hugo new posts/hello-world.zh-Hans.md
```

```markdown
<!-- Note: Sample homepage content rendered inside the acrylic card. -->
---
title: "Home"
---

Welcome to the Tralume example site!
```

## Data & Page Extensions

- Friend data lives in `data/friends.yaml`, filtered by the current language and randomized when displayed.
- The `language` field must match `languages.*.languageCode` (e.g., `en-US` / `zh-Hans`); leave it empty for global entries.

```yaml
# Note: Minimal friend entry; avatar optional, empty language means global display.
- name: "Tralume Demo (EN)"
  url: "https://hugo.tralume.org/en-us/"
  description: "Material 3 styled English demo site."
  avatar: "https://hugo.tralume.org/favicon.ico"
  language: "en-US"
```

## Run & Build

```bash
# Note: Development preview with multilingual subdirs and live reload.
hugo server --disableFastRender

# Note: Production build outputting to public with minified assets.
hugo --minify
```

## Notes

- When adding template text, update both `i18n/en-US.yaml` and `i18n/zh-Hans.yaml` to avoid missing translations.
- The theme stores mode/glass/reader width in browser `localStorage`; clearing cache resets to defaults.
- After updating the module, run `hugo mod npm pack && npm install` again to sync npm dependencies.
- Adjust card/timeline summary length via `params.articleCardSummaryLength` and `params.articleTimelineSummaryLength` if needed.
