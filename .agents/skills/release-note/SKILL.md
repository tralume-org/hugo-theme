---
name: release-note
description: 生成 Tralume 发布说明并写入 release-note.md（无 Breaking changes 时省略该小节）
---

# 用途

在执行“发版、打标签、发布 Release”相关任务时调用本技能。

目标：基于最近一个版本标签到当前 HEAD 的提交，生成统一格式的发布说明，并写入仓库根目录 `release-note.md`。

# 强制规则

1. 输出文件固定为 `release-note.md`，不再使用 `version.md`。
2. 标题顺序固定为：`## Summary` → （可选）`## Breaking changes` → `## Changes`。
3. 若不存在破坏性变更，必须完整省略 `## Breaking changes` 小节，禁止写 `None.`。
4. `## Changes` 列表格式固定为：`- <commit subject> (<short-sha>)`。
5. `## Summary` 仅保留 1-3 条，强调用户可感知影响与改动价值。
6. 提交范围仅统计“最近语义化标签（如 `v0.10.0`）之后到 HEAD”的提交。
7. 写入方式为覆盖写入 `release-note.md`。
8. `release-note.md` 正文一律使用美式英语（American English），包括 Summary/Breaking changes/Changes 的描述。

# 执行步骤

1. 识别最近语义化标签（`v*`）。
2. 收集 `tag..HEAD` 的提交标题与短 SHA。
3. 归纳 1-3 条 Summary（优先描述行为变化和收益）。
4. 判断是否存在 Breaking changes：
   - 有：写入 `## Breaking changes`，列出具体破坏点与影响对象。
   - 无：删除该小节。
5. 按模板生成完整内容并覆盖写入 `release-note.md`。

# 输出模板

使用同目录下的 `release-template.md` 作为基准模板；实际输出时按规则删除无关占位内容。
