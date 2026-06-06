---
title: テーマモードとテーマカラー
weight: 10
date: '2026-06-06T00:00:00+08:00'
---

サイトのデフォルトカラーモードとデフォルトテーマシードカラーを制御します。システム設定への追従、ライト/ダークの強制、デフォルトアクセントカラーの設定をサポートします。

## 設定場所

サイトルートの `hugo.toml`（または `config.toml`）に設定します:

```toml
[params.theme]
  # Note: Default mode for first-time visitors.
  # Options:
  #   - 'auto'  (recommended): follow the system/browser preference.
  #   - 'light': force light mode.
  #   - 'dark' : force dark mode.
  defaultMode = 'auto'

  # Note: Default theme seed color in #RRGGBB format.
  # If unset, the theme defaults to #1f2329.
  # Readers can override this via the settings panel (Appearance → Theme color).
  defaultSeed = '#1f2329'
```

`defaultSeed` パラメータは Material Design 3 で使用されるサイトのアクセントカラーを設定します。6桁の16進数カラーコードを受け付けます。無効な値は黙って無視され、組み込みのデフォルトにフォールバックします。

## 設定パネルのコントロール

外観タブでは以下を提供します:

- **テーマモード**: 自動 / ライト / ダーク トグル
- **テーマカラー**: 17色の Material 500 パレットとカスタム `#RRGGBB` 入力

## 優先順位ルール

1. **ユーザー選択**: 読者が設定パネルでモードまたはシードカラーを変更した場合、ローカルに保存され最優先されます。
2. **サイト設定**: 初回訪問者には `defaultMode` と `defaultSeed` が使用されます。
3. **フォールバック**: 未設定の場合、モードは `auto`、シードは `#1f2329` にデフォルト設定されます。
