# AGENTS.md（docs 文档站）

> 适用范围：仅适用于 `docs/`（Hugo + Hextra 文档站）。主题本体的协作规范请同时遵循 `../AGENTS.md`。

## 1. 项目速览（请先读）

- 技术栈：Hugo + Hextra 主题（Go Modules），入口文件 `docs/hugo.yaml`
- 内容源目录：`docs/content/docs/`（匹配 Hextra 默认文档路径约定）
- 构建命令：`hugo`（无需 Node.js / bun）

## 2. i18n 约定（必须）

- 默认语言：`en`（无 URL 前缀）
- 额外语言：`zh-hans`（使用 `/zh-hans/` 前缀；Hugo 内部 locale 映射为 `zh-cn`）
- 多语言内容组织方式：同一目录下用语言后缀区分（例如 `quick-start.md` / `quick-start.zh-hans.md`）
- 禁止在同一篇页面里做"中英对照/双语并排"

路由约定：

- `/docs/`：英文文档首页
- `/docs/quick-start/`：英文快速开始
- `/zh-hans/docs/`：简中文档首页
- `/zh-hans/docs/quick-start/`：简中快速开始

## 3. 常用命令

安装依赖（Go Modules）：

```bash
# 说明：下载 Hextra 主题依赖。
hugo mod get
```

开发预览：

```bash
# 说明：在 docs/ 目录内启动 Hugo 开发服务器（含草稿与实时重载）。
hugo server -D
```

生产构建：

```bash
# 说明：构建静态站点（默认输出到 docs/public/）。
hugo
```

构建到测试目录（避免污染默认 `public/`）：

```bash
# 说明：把验证构建输出写到 ../public_test/hextra-dist。
hugo --destination ../public_test/hextra-dist
```

## 4. 内容规范（必须）

### 4.1 文件命名

- 英文（默认语言）无后缀：`_index.md`、`quick-start.md`
- 简中翻译加 `.zh-hans` 后缀：`_index.zh-hans.md`、`quick-start.zh-hans.md`
- 目录段页用 `_index.md`（Hugo section page）

### 4.2 Frontmatter（必须字段）

```yaml
---
title: "页面标题"
weight: 10        # 侧边栏排序（数值越小越靠前）
date: '2025-12-17T00:00:00+08:00'
---
```

- `title`：必填，用作页面标题与侧边栏条目
- `weight`：必填，控制侧边栏排序
- `layout: hextra-home`：仅首页 `_index.md` 使用

### 4.3 Markdown 写作规范

- 每页一个主题；标题层级从 `#` 开始且逐级递进（不要跳级）
- 代码块语言标注必须准确（`toml`/`yaml`/`bash`/`md`），便于高亮
- 链接：优先站内相对链接；外链指向稳定文档入口
- 注意：Hextra 短代码（如 `{{< callout >}}`）之间不要插入多余空行

## 5. Hextra 短代码

常用短代码：

```markdown
<!-- 提示框 -->
{{< callout type="tip" >}}
  内容...
{{< /callout >}}

<!-- 首页特性卡片 -->
{{< hextra/feature-card title="标题" subtitle="描述" icon="图标名" >}}
```

## 6. 变更边界与清理策略

- 优先删除无用内容、过时链接、重复页面
- 不做向后兼容的"多套写法并存"
- 构建产物（`public/`、`public_test/`、`.hugo_build.lock`）不入 git
- `docs/go.sum` 需要提交（Go 依赖锁定）

## 7. 提交前自检（最低要求）

```bash
# 说明：在 docs/ 目录内执行 Hugo 构建，确保文档站可构建。
hugo --destination ../public_test/hextra-dist
```

可选但推荐：

- 手动打开预览，检查导航/侧边栏链接
- 若改动涉及 i18n：确认 `en` 与 `zh-hans` 两套内容均可访问
