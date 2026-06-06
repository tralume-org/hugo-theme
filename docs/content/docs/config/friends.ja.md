---
title: フレンドリンク
weight: 140
date: '2026-06-06T00:00:00+08:00'
---

「Friends」ページでのリンク表示方法を制御します。i18n グループ化と手動の重み順序付けを含みます。

## データファイルの場所

Hugo サイトに `data/friends.yaml` を作成します（`.toml` や `.json` も使用可能です）。読者向けのページは通常「Friends」というラベルになります。

## データ例

```yaml
- name:
    zh-Hans: "我的站点"
    en-US: "My Site"
    default: "My Site" # Optional: fallback value when the current language is missing.
  description:
    zh-Hans: "你好"
    en-US: "Hello"
  url: "https://example.com"
  avatar: "https://example.com/avatar.png"
  # Optional: manual sort weight; smaller values appear first, and the default is 10000.
  weight: 10
  # Optional: used for the "prefer current language" grouping and card language tags.
  # Note: .lang is also accepted as an alias for language.
  language: ["zh-Hans", "en-US"]

# Note: If you do not need i18n, you can use plain strings directly.
- name: "My Site"
  description: "Hello"
  url: "https://example.com"
  avatar: "https://example.com/avatar.png"
  # Optional: when omitted, the theme treats it as 10000.
  weight: 100
  # Optional: used for the "prefer current language" grouping and card language tags.
```

## 主な機能

- **i18n 対応**: `name` と `description` はプレーン文字列または言語マップにできます。
- **重み順序付け**: 小さい `weight` 値が先に表示されます。省略された場合、テーマは `10000` を使用します。
- **同じ重み内でのランダム**: 同じ `weight` のリンクはサイトビルド時にシャッフルされます。デプロイされた静的ページを更新しても通常は順序が変わりません。
- **現在の言語をグループとして優先**: `language` に現在のサイト言語が含まれるリンクが最初に1つのグループとして表示され、その後で他の言語のリンクが表示されます。
