---
title: 期限切れコンテンツ通知
weight: 150
date: '2026-06-06T00:00:00+08:00'
---

Tralume は、コンテンツが設定可能な日数を超えて古い場合に、記事ページに自動的に警告バナーを表示できます。これにより、読者は情報が最新でない可能性があることを理解できます。

## デフォルト動作

デフォルトでは、**180 日**（約6ヶ月）以上経過した記事には、タイトルの下にインラインコールアウトが表示されます:

> ⚠ この記事は180日以上前に公開されました。情報が最新でない可能性があります。

デフォルトのしきい値はテーマパーシャル（`layouts/partials/outdated-notice.html`）で定義され、**すべてのセクション**（posts、pages など）に適用されます。

## サイト全体のしきい値

サイト全体のデフォルトしきい値を変更するには、サイト設定の `[params]` の下に `outdatedThresholdDays` を追加します:

```toml
[params]
  # Note: Articles older than this many days will show the outdated notice.
  # Set to a larger value to be more lenient, or smaller for stricter aging.
  outdatedThresholdDays = 365
```

## ページごとの上書き

Front Matter を通じて個別のページのしきい値を上書きできます:

```yaml
---
# Note: Override the threshold for this specific page.
outdatedThresholdDays: 90
---
```

特定のページで通知を完全に無効にするには:

```yaml
---
# Note: Force-hide the outdated notice on this page.
showOutdatedWarning: false
---
```

`outdatedThresholdDays` を `0` に設定すると、実質的に通知が無効になります（任意の経過日数がしきい値を超えるため）。

## 日付の決定方法

経過日数は**最も最近の**意味のある日付から計算されます:

1. ページに `date` と異なる `lastmod` フィールドがある場合、`lastmod` が使用されます。
2. それ以外の場合は `date` が使用されます。

つまり、3年前に公開された記事でも**先週更新された**場合は、期限切れ警告は表示されません。

## i18n

警告テキストは i18n キー `outdatedWarning` で管理され、`{{ .Days }}` プレースホルダーを受け付けます:

| 言語 | キー | デフォルト翻訳 |
|---|---|---|
| 英語 (`en-US`) | `outdatedWarning` | `This article was published over {{ .Days }} days ago. The information may no longer be applicable.` |
| 簡体字中国語 (`zh-Hans`) | `outdatedWarning` | `本文发布于 {{ .Days }} 天前，部分信息可能已不再适用。` |

メッセージをカスタマイズするには、サイトの `i18n/` ディレクトリでキーを上書きします。

## ヒント

- **`lastmod` を積極的に使用する**: コンテンツを改訂する際は `lastmod` フィールドを最新に保ってください。これにより、新しく確認された記事の警告が自動的に抑制されます。
- **セクションごとに調整**: サイトに異なるコンテンツライフタイムを持つセクション（ニュースとリファレンスなど）がある場合、ページまたはセクションの `_index.md` ごとに `outdatedThresholdDays` を調整します。
- **`showOutdatedWarning: false` と組み合わせる**: 警告が不要な永続的なページ（「About」や「プライバシーポリシー」など）で使用します。
- **編集レビュー**: 期限切れ通知と定期的なレビューワークフローを組み合わせることを検討してください。自分のサイトを閲覧中にバナーを見かけたら、コンテンツを更新するタイミングです。
