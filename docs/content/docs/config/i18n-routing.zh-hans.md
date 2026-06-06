---
title: 多语言路由与智能入口
weight: 85
date: '2026-06-06T00:00:00+08:00'
---

Tralume 会把真实内容 URL 完全交给 Hugo 正常生成；"智能语言入口页"则在 Hugo 构建完成后由脚本补充生成。

## 路由模式

- `defaultContentLanguageInSubdir = true`：正式内容页使用 `/en-us/...`、`/zh-hans/...`，中立入口页使用 `/` 与 `/posts/test/`。
- `defaultContentLanguageInSubdir = false`：默认语言正式内容继续占用根路径，中立入口页改为 `/auto/` 与 `/auto/posts/test/`。
- 显式语言 URL 不会被自动改写；只有入口页会根据用户偏好跳转。
- 如果某篇 `post` / `page` 只有一个语言版本，入口页会直接跳转到唯一语言目标，不再读取 `localStorage` 或 `navigator.languages`。

## 基础配置

在 `hugo.toml` 中设置：

```toml
defaultContentLanguage = 'en-US'
defaultContentLanguageInSubdir = true
# 说明：关闭 Hugo 默认语言重定向，改由主题的入口页脚本接管。
disableDefaultLanguageRedirect = true

[params.i18nRouting]
  # 说明：开启构建后生成的智能语言入口页。
  enableAutoEntry = true
```

只有在你已经把 `python3 tools/gen_auto_entries.py` 接入实际构建流程时，才应启用这项配置；否则请保留默认关闭，并继续使用 Hugo 自带的默认语言重定向。

## 构建方式

主题会先让 Hugo 输出真实页面与 `route-manifest.json`，再由 Python 脚本生成入口页：

```bash
# 说明：先构建 Hugo 真实内容页与路由清单。
# 注意：本示例把验证产物输出到 public_test/，避免污染默认 public/。
hugo --destination public_test/hugo-auto-entry

# 说明：读取 route-manifest.json，并在构建产物目录内生成智能入口页。
# 注意：脚本会检查路径冲突，并清理上一次生成但本次已失效的入口页。
python3 tools/gen_auto_entries.py --publish-dir public_test/hugo-auto-entry
```

## 行为说明

- 入口页会优先读取固定的 `localStorage['tralume-language']`。
- 若本地没有语言记忆，会再根据 `navigator.languages` 选择匹配语言。
- 若浏览器与存储都无法命中，则回退到默认语言正式页面。
- 入口页统一带 `noindex,follow`，并把 canonical 指向正式内容页；它们不会进入 Hugo 的 sitemap 与 RSS。
- 若未启用该功能，主题默认构建仍保持 Hugo 原生行为：根路径由 Hugo 默认语言重定向接管。
