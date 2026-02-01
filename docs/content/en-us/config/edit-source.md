# “Edit this page” Link

Shows an “Edit this page” button near the bottom of article pages, encouraging readers to propose fixes and improving content quality.

## 1. Site-wide configuration

Set repository info in `hugo.toml`:

```toml
[params.source]
  # Note: Enable/disable this feature.
  enabled = true

  # Note: Git hosting provider (github / gitlab / gitea / forgejo).
  provider = 'github'

  # Note: Repository URL (no trailing slash).
  repo = 'https://github.com/username/my-blog'

  # Note: Default branch, usually main or master.
  branch = 'main'

  # Note: Path prefix to your content in the repository (default: content).
  pathPrefix = 'content'
```

## 2. Per-page override

If some pages live in a different repository or branch, you can override in Front Matter:

```yaml
---
source:
  branch: "develop"
---
```
