+++
title = "Tralume 主题特性演示"
date = 2025-12-28T12:09:00+08:00
draft = false
description = "全面展示 Tralume 主题的各项特性：AI 标记、多种提示框、代码高亮、表格、数学公式等。"
tags = ["演示", "特性"]
license = "cc-by-4.0"

[ai]
  level = "assist"
  usage = ["outline", "wording", "code"]
  review = "edited"
  tools = ["claude", "chatgpt"]
+++

本文全面演示 Tralume 主题支持的各项内容特性。

## Callout 全类型展示

> [!NOTE]
> **注意** — 一般性说明信息。

> [!TIP]
> **提示** — 实用建议或最佳实践。

> [!IMPORTANT]
> **重要** — 需要读者重点关注的关键信息。

> [!WARNING]
> **警告** — 需要读者留意的事项。

> [!CAUTION]
> **小心** — 潜在风险提示。

> [!DANGER]
> **危险** — 严重警告或禁止事项。

## 自定义标题 Callout

> [!TIP]+ 试试自定义标题
> 你可以在类型后面加空格和文字来自定义标题。

## 代码高亮与复制

所有代码块右上角都有复制按钮（鼠标悬停时显示）。

```javascript
// JavaScript 示例：异步获取数据
async function fetchPosts(page = 1) {
  const res = await fetch(`/api/posts?page=${page}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.items.map(item => ({
    title: item.title,
    url: item.url,
    date: new Date(item.published_at)
  }));
}
```

```toml
# TOML 配置示例
[params.theme]
  defaultMode = 'auto'
  defaultGlassStrength = 45
  defaultReaderWidthValue = 80
```

```bash
# Shell 命令示例
hugo new site mysite
cd mysite
hugo mod init example.com/mysite
hugo mod get forgejo.alexma.top/alexma233/tralume
hugo server -D
```

## 表格

| 特性 | 状态 | 说明 |
|------|------|------|
| 深色/浅色模式 | 已支持 | auto / light / dark 三种模式 |
| 亚克力效果 | 已支持 | 可调节透明度与模糊半径 |
| 多语言 | 已支持 | en-US + zh-Hans |
| 搜索 | 已支持 | Pagefind / Meilisearch |
| 评论 | 已支持 | Giscus / Remark42 / Waline / Twikoo / Utterances |
| 统计分析 | 已支持 | Umami |
| 友链 | 已支持 | 多语言分组与权重排序 |

## 任务列表

- [x] 初始化 Hugo 站点
- [x] 安装 Tralume 主题
- [x] 配置多语言
- [ ] 部署到生产环境
- [ ] 配置评论系统

## 脚注

Hugo 支持原生的 Markdown 脚注功能[^1]。

[^1]: 这是脚注内容，会渲染在页面底部。

## 水平线

---

上面的水平线分隔了两个内容区块。
