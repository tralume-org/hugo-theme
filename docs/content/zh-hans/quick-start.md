# 快速开始

## 使用 CLI 初始化站点仓库

### 前提条件

- Hugo 已安装 （无需 extended ，版本 ≥ 0.146.0）
- Go 已安装 （用于 Hugo Modules）
- Git 已安装 （用于 Hugo Modules 和版本控制）

### 初始化站点

执行 `hugo new site <站点名称>` 创建一个新站点。

进入站点文件夹，执行 `hugo mod init <模块路径>` 以初始化 Hugo Modules 。
> [!TIP]
> 如果你计划使用一个 Git 远程仓库来保存站点（例如 Codeberg 和 GitHub ），请使用这个仓库的链接，例如 `forgejo.alexma.top/tralume/hugo-template` 。
>
> 否则，你可以随便填写，推荐为你的站点名称。

执行 `hugo mod get forgejo.alexma.top/tralume-org/hugo-theme` 以添加本主题。

### 使用基本配置并启动

编辑 `hugo.toml` ，使用以下配置覆盖原文件。

```toml
baseURL = 'https://example.com/'
defaultContentLanguage = 'zh-Hans'
hasCJKLanguage = true

[languages]
  [languages."zh-Hans"]
    languageName = '简体中文'
    languageCode = 'zh-Hans'
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

[module]
  [[module.imports]]
    path = "forgejo.alexma.top/tralume-org/hugo-theme"

[markup]
  [markup.highlight]
    lineNos = false
    noClasses = false
```

运行 `hugo server` 启动本地服务器，按提示打开即可进入站点。
