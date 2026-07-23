---
title: 快速開始
weight: 10
date: '2026-06-06T00:00:00+08:00'
---

## 使用 CLI 初始化網站儲存庫

### 先決條件

- 已安裝 Hugo（不需要 extended 版本，版本 ≥ 0.161.1）
- 已安裝 Go（用於 Hugo Modules）
- 已安裝 Git（用於 Hugo Modules 與版本控制）

### 初始化網站

執行 `hugo new site <網站名稱>` 建立新網站。

進入網站目錄，執行 `hugo mod init <模組路徑>` 初始化 Hugo Modules。
{{< callout type="tip" >}}
如果你打算使用 Git 遠端儲存庫來存放網站（例如 Codeberg 或 GitHub），請使用該儲存庫的 URL，例如 `forgejo.alexma.top/tralume/hugo-template`。

否則可以任意填寫，建議使用網站名稱。
{{< /callout >}}

執行 `hugo mod get forgejo.alexma.top/alexma233/tralume` 加入此主題。

### 使用基本設定並啟動

編輯 `hugo.toml`，將原始檔案替換為以下設定。

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
    path = "forgejo.alexma.top/alexma233/tralume"

[markup]
  [markup.highlight]
    lineNos = false
    noClasses = false

[params.search]
  enable = true
  provider = 'pagefind'
```

執行 `hugo server` 啟動本機伺服器，然後依照提示在瀏覽器中開啟網站。
