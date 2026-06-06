---
title: AI 参与度标记
weight: 90
date: '2026-06-06T00:00:00+08:00'
---

随着 AI 工具的普及，透明地告知读者 AI 在创作过程中的参与程度变得越来越重要。该功能会生成一个可折叠的声明组件：默认折叠时仅显示 AI 参与程度（如"AI 辅助"），读者点击展开后可查看完整详情（用途、复核程度、使用工具）。

在文章开头的参数（Front Matter）中通过 `ai` 对象进行设置：

```yaml
---
title: "AI 协作的一天"
# 说明：AI 参与度声明字段。
ai:
  # 说明：参与程度（不写或写 none 时，页面不显示该标记）。
  level: assist

  # 说明：AI 具体用在了哪些环节（可选，可填多个）。
  usage: [grammar, wording]

  # 说明：人类复核程度（可选；不写时默认 none）。
  review: edited

  # 说明：使用的工具（可选，可填多个）。
  tools: [chatgpt]
---
```

## 支持的字段

- `ai.level`：AI 参与程度。
- `ai.usage`：AI 用途列表（可选）。
- `ai.review`：人类复核程度（可选）。
- `ai.tools`：使用过的工具列表（可选）。

注意：只有当 `ai.level` 不为 `none` 时，主题才会在文章标题下方显示该标记。

### ai.level

- `none`：未使用 AI（不显示标记）
- `assist`：AI 辅助
- `coauthor`：AI 协作撰写
- `generate`：AI 生成
- `translate`：AI 翻译

### ai.review

- `none`：未说明/未做人工检查
- `light`：已通读检查
- `edited`：已逐段校对与修订
- `fact_checked`：关键事实/数据/引用已人工核对来源

### ai.usage（可填多个）

- `outline`：提纲/结构建议
- `rewrite`：改写/重组段落
- `expand`：扩写（补充细节）
- `summarize`：摘要/压缩
- `tone`：语气/风格调整
- `grammar`：语法纠错
- `wording`：措辞优化/同义替换
- `title`：标题/小标题建议
- `translate`：翻译
- `research`：资料搜集方向/整理
- `citation`：引用格式/引用建议
- `fact_check_help`：核对辅助（提示可疑点）
- `code`：代码生成/改写
- `debug`：排错/日志分析建议
- `data`：表格/数据整理与转换
- `image`：图片/插图提示词或生成辅助
- `privacy`：隐私/脱敏建议
- `policy`：合规/措辞风险提示

### ai.tools（可填多个）

- `chatgpt`：ChatGPT
- `claude`：Claude
- `gemini`：Gemini
- `deepseek`：DeepSeek
- `qwen`：Qwen
- `other`：其他

## 显示行为

标记以可折叠的 `<details>` 组件形式渲染在文章标题下方。默认仅显示参与程度（如"AI 辅助"），点击展开后可见：
- **AI 用途**（若设置了 `ai.usage`）
- **人类复核程度**（存在标记时始终显示）
- **使用工具**（若设置了 `ai.tools`）

仅当 `ai.level` 不为 `none` 时，主题才会显示该标记。
