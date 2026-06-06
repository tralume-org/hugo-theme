---
title: 「このページを編集」リンク
weight: 100
date: '2026-06-06T00:00:00+08:00'
---

記事ページの下部近くに「このページを編集」ボタンを表示し、読者が修正を提案できるようにしてコンテンツの品質を向上させます。

## 1. サイト全体の設定

`hugo.toml` にリポジトリ情報を設定します:

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

## 2. ページごとの上書き

一部のページが異なるリポジトリやブランチにある場合、Front Matter で任意のフィールドを上書きできます:

```yaml
---
source:
  # Note: Any of enabled, provider, repo, branch, or pathPrefix can be overridden per page.
  enabled: true
  provider: "gitea"
  repo: "https://gitea.example.com/other-repo"
  branch: "develop"
  pathPrefix: "docs"
---
```

フィールドが省略された場合、サイト全体の `params.source` の値にフォールバックします。
