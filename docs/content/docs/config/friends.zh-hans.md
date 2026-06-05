---
title: 友链管理
weight: 140
---

控制前台"朋友们"页面的链接展示。本文档与数据配置统一使用术语"友链"，支持多语言分组与手动权重排序。

## 数据文件位置

在你的站点目录下创建：`data/friends.yaml` (也可以是 `.toml` 或 `.json`)。

## 数据格式示例

```yaml
- name:
    zh-Hans: "我的站点"
    en-US: "My Site"
    default: "My Site" # 可选，缺失当前语言时的兜底
  description:
    zh-Hans: "你好"
    en-US: "Hello"
  url: "https://example.com"
  avatar: "https://example.com/avatar.png"
  # 可选，手动排序权重；数值越小越靠前，默认值为 10000。
  weight: 10
  # 可选，用于"当前语言优先"分组 + 卡片语言标签。
  # 注意：.lang 也可以作为 language 的别名使用。
  language: ["zh-Hans", "en-US"]

# 如果不需要 i18n
- name: "我的站点"
  description: "你好"
  url: "https://example.com"
  avatar: "https://example.com/avatar.png"
  # 可选，未填写时按 10000 处理。
  weight: 100
  # 可选，用于"当前语言优先"分组 + 卡片语言标签。
```

## 关键特性

- **多语言适配**：`name` 和 `description` 可以是简单的字符串，也可以是按语言代码区分的地图（Map）。
- **权重排序**：`weight` 数值越小越靠前；未填写时默认按 `10000` 处理。
- **同权重随机**：如果多个友链的 `weight` 相同，它们会在站点生成时随机排列；静态站点部署后，读者单纯刷新页面通常不会改变顺序。
- **当前语言优先分组**：如果友链标记的 `language` 包含当前站点的语言，它会先进入"当前语言"组并优先整体展示；其他语言组会排在后面。
