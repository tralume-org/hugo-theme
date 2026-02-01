# AI 参与度标记

随着 AI 工具的普及，透明地告知读者 AI 在创作过程中的参与程度变得越来越重要。该功能可以帮你生成一个标准、美观的声明条，无需你自己手动在正文里写说明。

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
