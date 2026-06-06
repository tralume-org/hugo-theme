---
title: アクリル効果
weight: 20
date: '2026-06-06T00:00:00+08:00'
---

主要なサーフェス（カード、ナビゲーションなど）で使用されるアクリル（すりガラス）効果を制御します。

## 設定場所

サイトルートの `hugo.toml` に設定します:

```toml
[params.theme]
  # Note: Default acrylic opacity (percentage).
  # Range: number between 0 and 95.
  # Higher = more opaque; lower = more transparent.
  defaultGlassStrength = 45
```

## 設定パネルのコントロール

設定パネルの外観タブには3つのスライダーがあります:

1. **不透明度** (`settingsPanelGlassRangeLabel`): アクリルサーフェスの透明度を制御します。範囲: 0%–95%、デフォルト: `defaultGlassStrength`。
2. **ぼかし半径** (`settingsPanelGlassBlurLabel`): 背景ぼかしの強度を制御します。範囲: 0px–48px、デフォルト: 24px。
3. **背景ぼかし** (`settingsPanelBackgroundBlurLabel`): カスタム背景画像に適用されるぼかしを制御します。範囲: 0px–40px、デフォルト: 0px。

読者はこれら3つをリアルタイムで調整でき、選択内容はローカルに保存されます。

## 優先順位ルール

1. **ユーザー調整**: 読者は設定パネルで両方の値を変更できます。保存された値が最も高い優先度を持ちます。
2. **サイト設定**: 新規訪問者には、`defaultGlassStrength` が初期不透明度値として使用されます。
