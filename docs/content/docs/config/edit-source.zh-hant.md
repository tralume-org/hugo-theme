---
title: 「編輯此頁」連結
weight: 100
date: '2026-06-06T00:00:00+08:00'
---

在文章頁面底部附近顯示「編輯此頁」按鈕，鼓勵讀者提出修正，提升內容品質。

## 1. 全站設定

在 `hugo.toml` 中設定儲存庫資訊：

```toml
[params.source]
  # 注意：啟用/停用此功能。
  enabled = true

  # 注意：Git 託管提供者（github / gitlab / gitea / forgejo）。
  provider = 'github'

  # 注意：儲存庫 URL（無結尾斜線）。
  repo = 'https://github.com/username/my-blog'

  # 注意：預設分支，通常為 main 或 master。
  branch = 'main'

  # 注意：儲存庫中內容的路徑前綴（預設：content）。
  pathPrefix = 'content'
```

## 2. 逐頁覆蓋

如果某些頁面位於不同的儲存庫或分支，你可以在 Front Matter 中覆蓋任何欄位：

```yaml
---
source:
  # 注意：任何 enabled、provider、repo、branch 或 pathPrefix 欄位均可逐頁覆蓋。
  enabled: true
  provider: "gitea"
  repo: "https://gitea.example.com/other-repo"
  branch: "develop"
  pathPrefix: "docs"
---
```

當欄位省略時，會回退到全站的 `params.source` 值。
