[英文](README.md) ｜ [简体中文](README.zh-Hans.md)

# Tralume Hugo 主题

现代 Material Design 3 + 亚克力质感的 Hugo 主题，内置多语言（en-US / zh-Hans）、文章时间线、阅读进度、代码块复制与可配置的设置面板。

## 快速上手

1. 准备 Hugo ≥ 0.146.0（无需 extended）与 Node 18+、npm。
2. 在站点根目录初始化 Hugo Modules 并拉取主题。
3. 生成 npm 包清单并安装依赖（本主题仅依赖 `@material/web`）。
4. 写入基础配置（语言、菜单、主题参数）。
5. 创建内容与数据文件，运行 `hugo server` 预览。

## 安装与初始化

```bash
# 说明：初始化站点的 Hugo 模块并引入 Tralume 主题。
hugo mod init example.com/blog
hugo mod get forgejo.alexma.top/tralume-org/hugo-theme

# 说明：根据模块依赖生成 package.json（源于 package.hugo.json），然后安装 npm 依赖。
hugo mod npm pack
npm install
```

如需使用 Git 子模块，也可在站点根目录执行：

```bash
# 说明：以子模块方式拉取主题代码，适合不使用 Hugo Modules 的场景。
git submodule add https://forgejo.alexma.top/tralume-org/hugo-theme.git themes/tralume

# 说明：进入站点根目录，同样执行 npm 依赖安装（子模块场景无需 hugo mod npm pack）。
cd themes/tralume
npm install
```

## 基础配置示例（`config/_default/hugo.toml`）

```toml
# 说明：站点基础信息与输出设置。
baseURL = 'https://example.com/'
defaultContentLanguage = 'en-US'
defaultContentLanguageInSubdir = true

[outputs]
  home = ['HTML', 'RSS']
  section = ['HTML', 'RSS']
  taxonomy = ['HTML', 'RSS']
  term = ['HTML', 'RSS']

# 说明：多语言基本信息，菜单结构统一放在 [menu]，文案交由 i18n 翻译表维护。
[languages]
  [languages."en-US"]
    languageName = '英文'
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
    name = '首页'
    pageRef = '/'
    weight = 10
  [[menu.main]]
    identifier = 'posts'
    name = '文章'
    pageRef = '/posts'
    weight = 20
  [[menu.main]]
    identifier = 'tags'
    name = '标签'
    pageRef = '/tags'
    weight = 30
  [[menu.main]]
    identifier = 'friends'
    name = '朋友们'
    pageRef = '/friends'
    weight = 40

# 说明：引入主题（Hugo Modules 推荐）；如用子模块，请改为 theme = 'tralume'。
[module]
  [[module.imports]]
    path = 'forgejo.alexma.top/tralume-org/hugo-theme'
  [module.hugoVersion]
    min = '0.146.0'
    extended = false

[params]
  description = 'Tralume：Material 3 玻璃拟态 Hugo 主题。'
  articleCardSummaryLength = 160      # 说明：列表卡片摘要长度（字符）。
  articleTimelineSummaryLength = 160  # 说明：时间线摘要长度（字符）。

  [params.theme]
    defaultMode = 'auto'           # 说明：主题模式，auto/light/dark。
    defaultGlassStrength = 'soft'  # 说明：玻璃预设，soft/balanced/bold。
    defaultReaderWidth = 'balanced'# 说明：阅读区宽度预设，compact/balanced/wide。
    defaultReaderWidthValue = 64   # 说明：自定义宽度（rem），优先级高于预设。
  [params.home]
    recentPostsLimit = 4           # 说明：主页展示的最新文章数量上限，超出时显示“查看更多文章”按钮。
  [params.analytics]
    # 说明：Umami 统计脚本配置，替换为自己的部署地址与 site id；留空则不输出脚本。
    [params.analytics.umami]
      scriptUrl = 'https://umami.example.com/script.js'
      websiteId = '5b14b1a3-b5c6-4961-b1a8-32c1819069f8'
      # dataHost = 'https://umami.example.com'   # 可选：自定义 data-host。
      # dataDomains = 'example.com'             # 可选：限定追踪域名，逗号分隔。
      # blockNotice = true                      # 可选：被拦截时贴边提示并支持永久忽略。
```

提示：菜单当前为全局共享配置，如需中英文显示不同名称，请改用 `languages.*.menus.main` 在各语言下分别声明。

## 文章许可证配置

- 每篇文章可在 Front Matter 声明 `license`；站点默认可在 `params.contentLicense`（兼容 `params.license`）设置。
- 支持的 key：`cc-by-4.0`、`cc-by-sa-4.0`、`cc-by-nd-4.0`、`cc-by-nc-4.0`、`cc-by-nc-sa-4.0`、`cc-by-nc-nd-4.0`、`cc0-1.0`、`arr`（保留所有权利）。
- CC 许可证会自动跳转到 Creative Commons 官网对应页面；未知或缺失值回退为 ARR 的完整说明文案。

```yaml
# 说明：为单篇文章声明 CC BY-SA 4.0，渲染时会展示完整句式并跳转官网。
license: "cc-by-sa-4.0"
```

```toml
# 说明：设置站点默认许可证，单篇 front matter 会覆盖；未知值回退 ARR。
[params]
  contentLicense = "cc-by-nc-4.0"
```

## 内容结构与多语言写作

- 文章建议放在 `content/posts/`。主题会过滤 `_index` 文件，并按 `.Lang` 展示对应语言。
- 为保证中英文配对正确，中文文件名需包含 `.zh` 或 `.zh-hans` 后缀，例如 `hello-world.zh.md`；英文文件名保持不带后缀。
- 首页正文来自 `content/_index.md`，会以亚克力卡片展示，可用来写欢迎语。
- 友链页使用 `content/friends/_index.md`（可留空，仅显示 data/friends.yaml 数据）。

```bash
# 说明：创建一对中英文文章，文件名体现语言后缀，便于主题过滤。
hugo new posts/hello-world.en-US.md
hugo new posts/hello-world.zh-Hans.md
```

```markdown
<!-- 说明：主页内容示例，渲染在首页卡片内。 -->
---
title: "Home"
---

欢迎来到 Tralume 示例站点！
```

## 数据与页面扩展

- 友链数据位于 `data/friends.yaml`：当前语言条目优先展示，其它语言站点会显示在列表后方（两部分均随机排序）。
- `language` 字段需与 `languages.*.languageCode` 对应（如 `en-US` / `zh-Hans`），留空则所有语言通用。
- `name` / `description` 支持 i18n：既可直接写字符串，也可写为按语言代码分组的 map；只写一个语言也可，缺失当前语言时回退 `default` 或任一已提供语言。

```yaml
# 说明：友链最小示例：name/description 支持 i18n（可只写当前语言；如需英文可补充 en-US）。
- name:
    zh-Hans: "Tralume 示例站"
  url: "https://hugo.tralume.org/en-us/"
  description:
    zh-Hans: "Material 3 风格的示例站。"
  avatar: "https://hugo.tralume.org/favicon.ico"
  language: "en-US"
```

## 运行与构建

```bash
# 说明：开发模式预览，开启多语言子目录，实时热重载。
hugo server --disableFastRender

# 说明：生产构建，输出到 public 并最小化资源。
hugo --minify
```

## 常见注意事项

- 新增模板文案请同步更新 `i18n/en-US.yaml` 与 `i18n/zh-Hans.yaml`，避免缺失翻译。
- 主题使用浏览器 `localStorage` 记录模式/玻璃/阅读宽度，清理缓存可重置到默认值。
- 每次更新模块后建议重新执行 `hugo mod npm pack && npm install`，确保本地 npm 依赖与主题同步。
- 想调整卡片/时间线摘要长度，可通过 `params.articleCardSummaryLength` 与 `params.articleTimelineSummaryLength` 覆盖默认值。

## 可配置选项

- `params.home.recentPostsLimit`（默认 `4`）：主页最多展示的最新文章数，超出后会显示“查看更多文章”按钮。
- `params.articleCardSummaryLength` / `params.articleTimelineSummaryLength`：控制列表卡片和时间线摘要截断长度。
- `params.theme.defaultMode`：`auto` / `light` / `dark`。
- `params.theme.defaultGlassStrength`：`soft` / `balanced` / `bold`。
- `params.theme.defaultReaderWidth` 或 `params.theme.defaultReaderWidthValue`：阅读区宽度预设或自定义 rem 值（自定义优先）。
- `params.analytics.umami.scriptUrl` / `params.analytics.umami.websiteId`：Umami 统计脚本的地址与站点 ID，可选 `dataHost` / `dataDomains` 控制上报域名。
- `params.analytics.umami.blockNotice`：检测统计脚本被拦截时显示贴边提示，可永久忽略。
