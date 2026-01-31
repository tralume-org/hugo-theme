# AGENTS.md（docs 文档站）

> 适用范围：仅适用于 `docs/`（VitePress 文档站）。主题本体的协作规范请同时遵循 `../AGENTS.md`。

## 1. 项目速览（请先读）

- 技术栈：VitePress（见 `docs/package.json`）、配置入口 `docs/.vitepress/config.mts`
- 文档源目录：`docs/content/`（由 `srcDir: "content"` 指定）
- 包管理：存在 `docs/bun.lock`，默认使用 `bun`

## 2. i18n 约定（必须）

- 默认语言：`en-US`
- 额外语言：`zh-Hans`
- 禁止在同一篇页面里做“中英对照/双语并排”；用“按语言分目录 + 独立页面”实现 i18n。

建议的目录结构（推荐）：

- `docs/content/en-US/...`
- `docs/content/zh-Hans/...`

⚠️ 注意：当前仓库未启用 VitePress `locales` 配置；如果你要新增 i18n，请同时改 `docs/.vitepress/config.mts` 并补齐两套导航/侧边栏。

最小 i18n 配置示例（仅示例，改动前请先对照现有配置）：

```ts
// 说明：为 VitePress 启用双语言路由（en-US / zh-Hans）。
// 注意：示例假设内容按 `content/<locale>/...` 组织；如采用其他结构需同步调整 rewrites。
import { defineConfig } from 'vitepress'

export default defineConfig({
  // 说明：把文档源设为 content/，再用 rewrites 映射多语言路径。
  srcDir: 'content',

  // 说明：VitePress i18n；默认 en-US，并额外提供 zh-Hans。
  locales: {
    root: { label: 'English', lang: 'en-US' },
    'zh-Hans': { label: '简体中文', lang: 'zh-Hans' }
  },

  // 说明：按目录写作：content/en-US/foo.md -> /foo
  // 说明：按目录写作：content/zh-Hans/foo.md -> /zh-Hans/foo
  rewrites: {
    'en-US/:rest*': ':rest*',
    'zh-Hans/:rest*': 'zh-Hans/:rest*'
  }
})
```

文案与链接规范：

- `en-US` 页面用英文标题/正文；`zh-Hans` 页面用简体中文
- 站内链接尽量用相对路径（例如 `./getting-started`），避免硬编码域名
- 若同一概念两语言页面需互相跳转：使用显式链接（不要在正文里拼接语言前缀字符串）

## 3. 常用命令（Build/Lint/Test）

安装依赖（推荐 bun）：

```bash
# 说明：安装 docs 站点依赖。
# 注意：优先使用 bun，因为仓库包含 bun.lock。
bun install
```

开发预览：

```bash
# 说明：本地启动 VitePress 开发服务器。
bun run dev
```

生产构建：

```bash
# 说明：构建静态站点（默认输出到 docs/.vitepress/dist）。
bun run build
```

本地预览构建产物：

```bash
# 说明：预览构建后的静态站点。
bun run preview
```

Lint / Test（现状说明）：

- 当前 `docs/package.json` 未配置 `lint`/`test` 脚本，也未发现 ESLint/Prettier/Vitest 配置文件。
- 代理在提交改动前的最低验证：至少运行一次 `bun run build`，确保 VitePress 可构建。

单测（运行单个测试）的约定（如未来引入 Vitest）：

```bash
# 说明：运行全部测试（示例）。
bunx vitest

# 说明：仅运行匹配用例名的单个测试（示例）。
# 注意：-t 后是正则/字符串匹配，具体行为以当时的 Vitest 版本为准。
bunx vitest -t "should render nav"
```

构建输出污染控制（推荐）：

```bash
# 说明：把一次性验证构建输出写到 public_test/，避免污染默认 dist 目录。
# 注意：仅用于本地验证/CI；不要提交 public_test/。
bunx vitepress build --outDir public_test/vitepress-dist
```

## 4. 代码与内容风格（必须）

### 4.1 TypeScript / 配置代码（`docs/.vitepress/**`）

- 模块与语法：使用 ESM；配置文件优先 `.mts`
- 缩进：2 空格；行尾不强制分号（以现有 `config.mts` 风格为准）
- 引号：导入与普通字符串优先单引号；仅在需要避免转义时用双引号
- 逗号：对象/数组末尾保留尾逗号（便于 diff）

导入规范：

- 顺序：第三方（如 `vitepress`）在前，本地模块在后
- 禁止未使用导入；保持配置文件最小化

命名规范：

- 文件名：`kebab-case`（Markdown）/ `kebab-case` 或 `camelCase`（小型脚本），与现有结构保持一致
- 变量/函数：`camelCase`；常量：`SCREAMING_SNAKE_CASE`
- 配置键：尽量遵循 VitePress 官方字段名；不要自造相近同义字段

错误处理：

- 配置/脚本里遇到不可恢复错误：直接抛出并附带上下文（路径、选项值）
- 不要静默吞错；如需降级，必须写清楚降级条件与影响

### 4.2 Markdown 写作规范（`docs/content/**`）

- 每页一个主题；标题层级从 `#` 开始且逐级递进（不要跳级）
- 示例代码块必须写中文注释（说明用途、关键参数、易错点）
- 代码块语言标注必须准确（`bash`/`ts`/`json`/`md`），便于高亮与复制
- 链接：优先站内相对链接；外链尽量指向稳定文档入口

Frontmatter 约定：

- 首页可使用 VitePress 默认主题的 `layout: home`（见 `docs/content/index.md`）
- 其他页面仅在需要时添加 frontmatter；避免堆叠无用字段

## 5. 变更边界与清理策略

- 本文档站目标是“可构建 + 可维护”：优先删除无用示例、过时链接、重复页面
- 不做向后兼容的“多套写法并存”；统一到一种清晰约定后再扩展
- 禁止把生成物（例如 `.vitepress/dist`、缓存、`public_test/`）提交进 git

## 6. 提交前自检（最低要求）

```bash
# 说明：在 docs/ 目录内执行构建，确保文档站可构建。
bun run build
```

可选但推荐：

- 手动打开预览，检查导航/侧边栏链接是否 404
- 若改动涉及 i18n：确认 en-US 与 zh-Hans 两套内容均可访问且无“半句英文占位”
