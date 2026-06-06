---
title: コンテンツ表示とサマリー
weight: 60
date: '2026-06-06T00:00:00+08:00'
---

ホームページの投稿制限、`/posts` と `/pages` のページネーション、リストカードのサマリーの長さを制御します。

## ホームページの最近の投稿制限

ホームページをすっきり保つために、表示する最近の投稿数を制限できます。追加の投稿は「もっと見る」ボタンからアクセスできます。

### 設定場所

`hugo.toml` に設定します:

```toml
[params.home]
  # Note: Number of recent posts shown on the homepage.
  recentPostsLimit = 6
```

## サマリーの切り詰め長

投稿リストにおいて、ページに明示的な説明がない場合、テーマはコンテンツの先頭から抜粋を抽出してサマリーとします。最大長を制御できます。

`hugo.toml` に設定します:

```toml
[params]
  # Note: Summary length for the homepage and list cards, in characters.
  articleCardSummaryLength = 160
```

## /posts と /pages のページサイズ

`/posts` と `/pages` のエントリページは、まったく同じ概要 UI（水平カードリスト、一致するページャー UI、同じページネーション/無限スクロール切り替え動作）を共有するようになりました。

`hugo.toml` に設定します:

```toml
[params.posts]
  # Note: Controls the number of items shown per page for both /posts and /pages; the total list paginates automatically.
  # Note: Values less than or equal to 0 fall back to the default value of 10.
  pageSize = 10
```

## ヒント

- **手動サマリー分割**: コンテンツ内で `<!--more-->` を使用してサマリー領域を定義します（テーマ推奨）。
- **`description` を優先**: ページに `description` が設定されている場合、テーマはそれをホームページ、`/posts`、`/pages` のリストカードのサマリーとして使用します。
- **モバイルページネーション**: 小画面では、ページャーは前 / 現在 / 次のみを表示する1つのバーに統合されます。
- **スクロールモードは両方のリストに適用**: 設定パネルのページネーション/無限スクロール切り替えが `/posts` と `/pages` の両方に影響するようになりました。

## 記事カードのカバー画像

リストビューの記事カードは、利用可能な場合に自動的にカバー画像を表示します。テーマは以下の Front Matter フィールドを順にチェックします:

`image` > `featuredImage` > `featured_image` > `cover` > `thumbnail` > `banner`

いずれも一致しない場合、テーマは Page Bundle 内の最初の画像リソースにフォールバックします。カバー画像が見つかった場合、カードは `article-card--with-cover` クラスを取得し、タイトルの上に画像を表示します。

## コンテンツタイプのマッチング

`/posts` と `/pages` セクションは、Front Matter の `type` が `posts` または `pages` に設定されているコンテンツもマッチします。つまり、ページの Front Matter に `type: posts` を設定すると、そのページが `/posts/` コンテンツディレクトリの外にあっても、投稿リスト UI に含まれます。
