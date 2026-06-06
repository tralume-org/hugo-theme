---
title: AI 貢献マーカー
weight: 90
date: '2026-06-06T00:00:00+08:00'
---

AI ツールが一般的になるにつれ、執筆プロセスにおける AI の関与を開示することがますます重要になっています。この機能は折りたたみ可能な開示ウィジェットを表示します。デフォルトでは AI 関与レベル（例: 「AI 支援」）のみが表示され、読者がクリックして展開すると詳細（使用領域、レビューレベル、使用ツール）を確認できます。

ページの Front Matter の `ai` オブジェクトで設定します:

```yaml
---
title: "AI と協働した一日"
# Note: AI disclosure fields.
ai:
  # Note: Participation level (omit or set to none to hide the marker).
  level: assist

  # Note: Where AI was used (optional, multiple allowed).
  usage: [grammar, wording]

  # Note: Human review level (optional; defaults to none).
  review: edited

  # Note: Tools used (optional, multiple allowed).
  tools: [chatgpt]
---
```

## サポートされるフィールド

- `ai.level`: 関与レベル。
- `ai.usage`: 使用領域リスト（オプション）。
- `ai.review`: 人間によるレビューレベル（オプション）。
- `ai.tools`: 使用ツール（オプション）。

注意: マーカーは `ai.level` が `none` でない場合にのみ表示されます。

### ai.level

- `none`: AI 不使用（非表示）
- `assist`: AI 支援
- `coauthor`: AI 共著
- `generate`: AI 生成
- `translate`: AI 翻訳

### ai.review

- `none`: 指定なし / 人間による確認なし
- `light`: レビュー済み（通読）
- `edited`: 編集済み（行単位の修正）
- `fact_checked`: 主要な事実/データ/引用を人間が検証済み

### ai.usage（複数選択可）

- `outline`: アウトライン/構成の提案
- `rewrite`: 書き直し/再構成
- `expand`: 詳細の展開
- `summarize`: 要約/圧縮
- `tone`: トーン/スタイル調整
- `grammar`: 文法修正
- `wording`: 表現の改善
- `title`: タイトル/サブタイトルの提案
- `translate`: 翻訳
- `research`: 調査の方向性/メモ
- `citation`: 引用フォーマットの提案
- `fact_check_help`: 事実確認の補助（疑わしい箇所の指摘）
- `code`: コード生成/書き直し
- `debug`: デバッグ/ログ分析の提案
- `data`: テーブル/データの整理と変換
- `image`: 画像プロンプト/補助
- `privacy`: プライバシー/墨消しの提案
- `policy`: コンプライアンス/リスク表現の提案

### ai.tools（複数選択可）

- `chatgpt`: ChatGPT
- `claude`: Claude
- `gemini`: Gemini
- `deepseek`: DeepSeek
- `qwen`: Qwen
- `other`: その他

## 表示動作

マーカーは記事タイトルの下に折りたたみ可能な `<details>` 要素として表示されます。初期状態では関与レベルのみが表示されます（例: 「AI 支援」）。サマリーをクリックするとウィジェットが展開され、以下が表示されます:
- **使用領域**（`ai.usage` が設定されている場合）
- **人間によるレビューレベル**（マーカーが存在する場合は常に表示）
- **使用ツール**（`ai.tools` が設定されている場合）

マーカーは `ai.level` が `none` でない場合にのみ表示されます。
