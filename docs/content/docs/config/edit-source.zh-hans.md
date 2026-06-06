---
title: 「编辑此页」链接
weight: 100
date: '2026-06-06T00:00:00+08:00'
---

在文章详情页底部展示一个按钮，鼓励社区或读者参与纠错，提升内容质量。

## 1. 站点全局配置

在 `hugo.toml` 中设置仓库信息：

```toml
[params.source]
  # 说明：是否启用该功能。
  enabled = true

  # 说明：托管平台名称 (github / gitlab / gitea / forgejo)。
  provider = 'github'

  # 说明：仓库的完整访问地址（末尾不要带 /）。
  repo = 'https://github.com/username/my-blog'

  # 说明：默认分支，通常为 main 或 master。
  branch = 'main'

  # 说明：内容文件在仓库中的路径前缀（默认为 content）。
  pathPrefix = 'content'
```

## 2. 单篇文章覆盖

如果你有部分文章存放在不同的仓库或分支，可以在 Front Matter 中覆盖任意字段：

```yaml
---
source:
  # 说明：enabled、provider、repo、branch、pathPrefix 均支持逐页覆盖。
  enabled: true
  provider: "gitea"
  repo: "https://gitea.example.com/other-repo"
  branch: "develop"
  pathPrefix: "docs"
---
```

缺失的字段会回退到站点级 `params.source` 对应值。
```
