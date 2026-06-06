---
title: アナリティクス (Umami)
weight: 120
date: '2026-06-06T00:00:00+08:00'
---

軽量でプライバシーに配慮した分析システムである Umami を統合します。オプションの「ブロックされたスクリプト」通知、ページごとのビュー数表示、テーマコンポーネントの組み込みインタラクションイベントを備えています。

## Umami スクリプトの注入

`hugo.toml` に設定します:

```toml
[params.analytics]
  provider = 'umami'

  [params.analytics.providers.umami]
    # Note: Umami script URL.
    scriptUrl = 'https://analytics.example.com/script.js'
    # Note: Website ID from your Umami dashboard.
    websiteId = 'your-website-id'

    # Optional: show a friendly notice if the script is blocked by an ad blocker.
    # When enabled, a multi-step dialog guides the reader through:
    #   1. A greeting explaining why Umami is used
    #   2. What data is collected
    #   3. Why the script may be blocked
    #   4. How to whitelist the site in common ad blockers
    blockNotice = true
```

## ページビュー

Umami の公開 API を呼び出して、記事タイトルの下にページビュー数を表示します。

```toml
[params.analytics.providers.umami.pageviews]
  # Note: Umami instance base URL (do not include /script.js).
  host = 'https://analytics.example.com'

  # Note: Share ID for this site.
  # Note: Enable "share URL" in Umami; the last random string in the link is the ID.
  shareId = 'your-share-id'
```

## 組み込みインタラクションイベント

スクリプトが注入された後、テーマは追加のテンプレート設定なしで一般的なインタラクションの Umami カスタムイベントを自動的に報告します。

- **読書フロー**: `scroll_depth`, `open_outline`, `close_outline`, `click_outline_item`
- **コンテンツ操作**: `copy_code`, `copy_permalink`, `click_outbound_link`, `click_tag`
- **グローバルナビゲーション**: `open_mobile_menu`, `close_mobile_menu`, `open_pages_menu`, `click_nav_link`
- **UI 設定**: `open_settings_panel`, `change_theme_mode`, `change_glass_strength`, `change_reader_width`, `change_background_provider`
- **リストとサイドモジュール**: `load_more_posts`, `reach_list_end`, `click_article_card`, `view_comments`, `click_edit_source`, `view_pageviews_widget`

## イベントリファレンス

以下のリストは、テーマが現在発行するすべての組み込み Umami カスタムイベントを網羅しています。

### ページと読書

| イベント | 意味 | 主な追加フィールド |
| --- | --- | --- |
| `scroll_depth` | 読者が深さのしきい値に到達したときに発火。現在のしきい値は 25 / 50 / 75 / 100 で、同じページに複数のエントリが表示されるのは正常です。 | `depth` |
| `open_outline` | モバイル記事アウトラインオーバーレイが開かれたときに発火。 | `heading_count` |
| `close_outline` | モバイル記事アウトラインオーバーレイが閉じられたときに発火。 | なし |
| `click_outline_item` | 記事アウトライン内の見出しリンクがクリックされたときに発火。 | `heading_id`, `heading_level` |
| `view_pageviews_widget` | ページビューウィジェットがデータとともに正常に表示された後に発火。 | なし |
| `view_comments` | コメントセクションがビューポートに入り、可視しきい値を満たしたときに発火。 | `provider` |

### コンテンツ操作

| イベント | 意味 | 主な追加フィールド |
| --- | --- | --- |
| `copy_code` | コードブロックが正常にコピーされた後に発火。 | `lang`, `line_count` |
| `copy_permalink` | 記事のパーマリンクが正常にコピーされた後に発火。 | `title` |
| `click_outbound_link` | 記事コンテンツ内の外部リンクがクリックされたときに発火。 | `target_url`, `target_host`, `link_text`, `link_position` |
| `click_edit_source` | 「このページを編集」またはソースリンクがクリックされたときに発火。 | `target_url`, `target_host` |
| `click_tag` | タグエントリがクリックされたときに発火。 | `tag` |

### ナビゲーションとリスト

| イベント | 意味 | 主な追加フィールド |
| --- | --- | --- |
| `open_mobile_menu` | モバイルメニューが開かれたときに発火。 | `position` |
| `close_mobile_menu` | モバイルメニューが閉じられたときに発火。 | `position` |
| `open_pages_menu` | トップバーの Pages パネルが開かれたときに発火。 | `position` |
| `click_nav_link` | テーマのナビゲーションリンクがクリックされたときに発火。 | `label`, `target_path`, `position` |
| `click_article_card` | 記事カードがクリックされて詳細ページが開かれたときに発火。 | `target_path`, `title`, `position` |
| `load_more_posts` | 無限スクロールが次のページの投稿を正常に読み込んだときに発火。 | `feed`, `current_page`, `next_page` |
| `reach_list_end` | 無限スクロールがリストの終端に達したときに発火。 | `feed`, `page` |

### 設定と環境設定

| イベント | 意味 | 主な追加フィールド |
| --- | --- | --- |
| `open_settings_panel` | 設定パネルが開かれたときに発火。 | なし |
| `change_theme_mode` | テーマモードが自動、ライト、ダークに変更されたときに発火。 | `mode` |
| `change_glass_strength` | アクリル強度の値が変更されたときに発火。 | `strength` |
| `change_reader_width` | 読書幅が変更されたときに発火。 | `width` |
| `change_background_provider` | 背景プロバイダーが URL、アップロード、Pixaroa の間で変更されたときに発火。 | `provider` |

## Umami エントリの読み方

- `/zh-hans/pages/affiliates/` のような単純なパスは Umami の組み込みページビュー記録であり、テーマ定義のカスタムイベントではありません。
- `Visitor from ... using ...` は、場所、ブラウザ、オペレーティングシステム、デバイスタイプの Umami セッションサマリーです。
- `view_pageviews_widget on /...` は、ページビューウィジェットが正常に表示されたことを意味します。
- `view_comments on /...` は、コメントセクションがビューポート内で可視になったことを意味します。
- 同じページに複数の `scroll_depth` エントリがある場合、通常は読者が 25%、50%、75%、100% のしきい値を順に超えたことを意味します。

## 注意事項

- **プライバシーファースト**: 分析は Umami が処理します。テーマは有効な場合にのみ結果を表示します。
- **グレースフルデグラデーション**: リクエストがブロックされた場合（ネットワーク/広告ブロッカー）、ページビュー項目は壊れた UI を表示する代わりに非表示になります。
- **一貫したコンテキスト**: 各イベントには、Umami でのフィルタリングを容易にするために、ページパス、ロケール、ページタイプが自動的に含まれます。
