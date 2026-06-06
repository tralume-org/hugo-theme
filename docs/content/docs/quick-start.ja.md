---
title: クイックスタート
weight: 10
date: '2026-06-06T00:00:00+08:00'
---

## CLI を使ったサイトリポジトリの初期化

### 前提条件

- Hugo インストール済み（拡張版不要、バージョン ≥ 0.161.1）
- Go インストール済み（Hugo Modules 用）
- Git インストール済み（Hugo Modules とバージョン管理用）

### サイトの初期化

`hugo new site <サイト名>` を実行して新しいサイトを作成します。

サイトフォルダに入り、`hugo mod init <モジュールパス>` を実行して Hugo Modules を初期化します。
{{< callout type="tip" >}}
サイトの保存に Git リモートリポジトリ（Codeberg や GitHub など）を使用する予定がある場合は、そのリポジトリの URL を使用してください（例: `forgejo.alexma.top/tralume/hugo-template`）。

それ以外の場合は、任意の値を入力できます。サイト名を使用することをお勧めします。
{{< /callout >}}

`hugo mod get forgejo.alexma.top/tralume-org/hugo-theme` を実行してこのテーマを追加します。

### 基本設定を使用して起動

`hugo.toml` を編集し、元のファイルを以下の設定に置き換えます。

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

`hugo server` を実行してローカルサーバーを起動し、表示された URL をブラウザで開きます。
