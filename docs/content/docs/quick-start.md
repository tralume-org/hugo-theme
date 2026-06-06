---
title: Quick Start
weight: 10
date: '2026-06-06T00:00:00+08:00'
---

## Initialize the Site Repository Using the CLI

### Prerequisites

- Hugo installed (extended version not required, version ≥ 0.161.1)
- Go installed (for Hugo Modules)
- Git installed (for Hugo Modules and version control)

### Initialize the Site

Run `hugo new site <site name>` to create a new site.

Enter the site folder and run `hugo mod init <module path>` to initialize Hugo Modules.
{{< callout type="tip" >}}
If you plan to use a Git remote repository to store the site (such as Codeberg or GitHub), use the URL of that repository, for example `forgejo.alexma.top/tralume/hugo-template`.

Otherwise, you can fill in anything. Using your site name is recommended.
{{< /callout >}}

Run `hugo mod get forgejo.alexma.top/tralume-org/hugo-theme` to add this theme.

### Use the Basic Configuration and Start

Edit `hugo.toml` and replace the original file with the following configuration.

```toml
baseURL = 'https://example.com/'
defaultContentLanguage = 'en-US'
defaultContentLanguageInSubdir = true

[languages]
  [languages."en-US"]
    label = 'English'
    locale = 'en-US'
    weight = 1
    title = "My site"

[menu]
  [[menu.main]]
    identifier = 'home'
    name = 'Home'
    pageRef = 'home'
    weight = 10
  [[menu.main]]
    identifier = 'posts'
    name = 'Posts'
    pageRef = 'posts'
    weight = 20
  [[menu.main]]
    identifier = 'tags'
    name = 'Tags'
    pageRef = 'tags'
    weight = 30
  [[menu.main]]
    identifier = 'pages'
    name = 'Pages'
    pageRef = 'pages'
    weight = 35
  [[menu.main]]
    identifier = 'friends'
    name = 'Friends'
    pageRef = 'friends'
    weight = 40

[module]
  [module.hugoVersion]
    min = '0.161.1'
    extended = false
  [[module.imports]]
    path = "forgejo.alexma.top/tralume-org/hugo-theme"

[markup]
  [markup.highlight]
    lineNos = false
    noClasses = false

[params.search]
  enable = true
  provider = 'pagefind'
```

Run `hugo server` to start the local server, then open the site in your browser as prompted.
