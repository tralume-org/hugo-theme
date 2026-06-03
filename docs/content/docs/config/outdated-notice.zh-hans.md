---
title: 过时内容提醒
weight: 150
---

Tralume 可以在文章页面自动显示提醒横幅，当内容超过可配置的天数时告知读者信息可能不再适用。

## 默认行为

默认情况下，任何超过 **180 天**（约半年）的文章会在标题下方显示内联提醒：

> ⚠ 本文发布于 180 天前，部分信息可能已不再适用。

默认阈值定义在主题局部模板中（`layouts/partials/outdated-notice.html`），适用于**所有 section**（posts、pages 等）。

## 全站阈值

要修改全站默认阈值，在站点配置的 `[params]` 下添加 `outdatedThresholdDays`：

```toml
[params]
  # 说明：文章距今天数超过此值时显示过时提醒。
  # 调大以放宽限制，调小以收紧限制。
  outdatedThresholdDays = 365
```

## 单页覆盖

可以通过 Front Matter 为特定页面覆盖阈值：

```yaml
---
# 说明：为此页面单独设置提醒阈值。
outdatedThresholdDays: 90
---
```

要在特定页面完全禁用提醒：

```yaml
---
# 说明：强制隐藏此页面的过时提醒。
showOutdatedWarning: false
---
```

将 `outdatedThresholdDays` 设为 `0` 可实际禁用提醒（任何正数天数都会超过阈值）。

## 日期判定逻辑

文章年龄由**最近的**有效日期计算：

1. 若页面有 `lastmod` 且与 `date` 不同，优先使用 `lastmod`。
2. 否则使用 `date`。

这意味着一篇 3 年前发布但**上周刚更新过**的文章不会显示过时提醒。

## 国际化

提醒文案通过 i18n 键 `outdatedWarning` 管理，接受 `{{ .Days }}` 占位符：

| 语言 | 键 | 默认翻译 |
|---|---|---|
| 英文 (`en-US`) | `outdatedWarning` | `This article was published over {{ .Days }} days ago. The information may no longer be applicable.` |
| 简体中文 (`zh-Hans`) | `outdatedWarning` | `本文发布于 {{ .Days }} 天前，部分信息可能已不再适用。` |

要自定义文案，在站点的 `i18n/` 目录中覆盖对应键即可。

## 小贴士

- **善用 `lastmod`**：定期更新文章时同步更新 `lastmod`，可以自动抑制刚审阅过的文章的提醒。
- **按 section 调优**：如果站点各 section 内容时效不同（如新闻 vs. 参考资料），可按页面或 section `_index.md` 分别调整 `outdatedThresholdDays`。
- **配合 `showOutdatedWarning: false`**：在永久性页面（如"关于"页或"隐私政策"）上关闭提醒。
- **周期性审阅**：将过时提醒与定期内容审阅流程结合——浏览自己站点时看到提醒横幅，即表示该刷新内容了。
