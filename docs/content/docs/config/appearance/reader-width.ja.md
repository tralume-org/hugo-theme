---
title: 読書幅
weight: 30
date: '2026-06-06T00:00:00+08:00'
---

画面によって最適な行の長さは異なります。この設定では、読書エリアの快適なデフォルト最大幅（ビューポート幅に対するパーセンテージ）を選択できます。

## 設定場所

サイトルートの `hugo.toml` に設定します:

```toml
[params.theme]
  # Note: Default max reading width (vw = % of viewport width).
  # Range: number between 60 and 92.
  # Example: 80 means the content area is at most 80% wide.
  defaultReaderWidthValue = 80
```

## 注意事項

- **クランプ範囲**: テーマは異なる画面での読みやすさを確保するため、値を 60%–92% にクランプします。
- **レスポンシブ**: 狭い画面（スマートフォンなど）では、コンテンツが全幅を使用できるように、この設定は無視されます。

## 優先順位ルール

1. **ユーザー調整**: 設定パネルで選択された幅はローカルに保存されます。
2. **サイト設定**: 新規訪問者には `defaultReaderWidthValue` が使用されます。
