---
name: release-note
description: 生成 Tralume 发布说明并用 fj 发布 Release（无 Breaking changes 时省略该小节）
---

# 用途

在执行“发版、打标签、发布 Release”相关任务时调用本技能。

目标：基于最近一个版本标签到当前 HEAD 的提交，生成统一格式的发布说明，写入仓库根目录 `release-note.md`，再通过 `fj` 创建 Forgejo Release 和同名标签。

# 强制规则

1. 输出文件固定为 `release-note.md`，不再使用 `version.md`。
2. 标题顺序固定为：`## Summary` → （可选）`## Breaking changes` → `## Changes`。
3. 若不存在破坏性变更，必须完整省略 `## Breaking changes` 小节，禁止写 `None.`。
4. `## Changes` 列表格式固定为：`- <commit subject> (<short-sha>)`。
5. `## Summary` 仅保留 1-3 条，强调用户可感知影响与改动价值。
6. 提交范围仅统计“最近语义化标签（如 `v0.10.0`）之后到 HEAD”的提交。
7. 写入方式为覆盖写入 `release-note.md`；该文件被 `.gitignore` 忽略，禁止提交它。
8. `release-note.md` 正文一律使用美式英语（American English），包括 Summary/Breaking changes/Changes 的描述。
9. 发版默认使用 `fj`，目标远端为 `origin`，目标分支为 `main`，Release 必须标记为 Pre-release。
10. 用户已给出版本号（如“发布 v0.16.2”）时，直接使用该版本；未给出时再询问。
11. 本地未提交改动不阻止发布，但必须确认 `HEAD` 与 `origin/main` 一致；发布只基于远端 `main`。
12. 若目标 tag 或 release 已存在，禁止覆盖或删除，先汇报并询问。

# 执行步骤

1. 读取本技能与 `release-template.md`。
2. 做发布前检查：
   - `command -v fj` 与 `fj whoami`
   - `git status --short`
   - `git rev-parse HEAD` 与 `git rev-parse origin/main`
   - `git tag --list '<version>'` 与 `git ls-remote --tags origin 'refs/tags/<version>*'`
3. 识别最近语义化标签（`v*`）。
4. 收集 `tag..HEAD` 的提交标题与短 SHA，默认包含 merge commit，保持 `git log --format='%h%x09%s' tag..HEAD` 的顺序。
5. 归纳 1-3 条 Summary（优先描述行为变化和收益）。
6. 判断是否存在 Breaking changes：
   - 有：写入 `## Breaking changes`，列出具体破坏点与影响对象。
   - 无：删除该小节。
7. 按模板生成完整内容并覆盖写入 `release-note.md`。
8. 使用 `fj` 创建 Release 与同名 tag：

   ```sh
   fj release create -R origin --create-tag=<version> -B main -p --body "$(cat release-note.md)" <version>
   ```

9. 验证结果：

   ```sh
   git ls-remote --tags origin 'refs/tags/<version>*'
   fj release view -R origin <version>
   ```

10. 若已误发为正式 Release，使用以下命令改为 Pre-release：

   ```sh
   fj release edit -R origin --prerelease true <version>
   ```

11. 最终回复必须包含：版本号、tag 指向的短 SHA、Pre-release 已创建或已修正、`release-note.md` 未提交、本地剩余未提交改动（如有）。

# 输出模板

使用同目录下的 `release-template.md` 作为基准模板；实际输出时按规则删除无关占位内容。
