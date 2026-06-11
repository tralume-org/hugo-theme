---
title: カスタム背景
weight: 40
date: '2026-06-06T00:00:00+08:00'
---

サイトの背景画像ソースと背景ぼかしを制御します。

3つのプロバイダーがサポートされています: 直接画像 URL、ローカルアップロード（読者のブラウザにのみ保存）、Pixaroa ランダム画像サービス。

## 設定場所

サイトルートの `hugo.toml` に設定します:

```toml
[params.theme]
  # Note: Default background provider for first-time visitors.
  # Options:
  #   - 'url'    (default): use the image URL filled in by the user (if any).
  #   - 'upload' : use a locally uploaded image (only visible in that browser).
  #   - 'pixaroa': use the Pixaroa random image service.
  defaultBackgroundProvider = 'url'

  # Note: If you want to use Pixaroa, set its base URL here.
  # Note: Leaving it empty disables Pixaroa.
  # Examples:
  #   - https://pixaroa.example.com/   (recommended: end with a slash)
  #   - /pixaroa/                      (same-origin reverse proxy; also end with a slash)
  pixaroaHost = 'https://your-pixaroa-api.com/'

  # Note: Pixaroa automatic refresh strategy.
  #   - 'session' (default): refresh once per browser session; page navigation keeps the same image.
  #   - 'persist': reuse the last fetched random image.
  pixaroaRefreshMode = 'session'
```

## プロバイダーの詳細

### Pixaroa 詳細設定

Pixaroa を使用する場合、設定パネルには折りたたみ可能な「詳細」セクションの下に追加オプションが表示されます:

- **ティア** (`settings_tier`): 画像の品質/サイズティア（auto、1–6）
- **向き** (`settings_orientation`): auto、landscape、portrait、square
- **形式** (`settings_format`): auto、jxl、avif、webp、jpeg、png

これらのパラメータは Pixaroa API に送信され、返される画像に影響します。

### Pixaroa 更新戦略

読者がサイトを開くたびに新しいランダム背景を表示し、同じ訪問中のページ移動では同じ画像を維持したい場合は、次のように設定します:

```toml
[params.theme]
  defaultBackgroundProvider = 'pixaroa'
  pixaroaHost = 'https://your-pixaroa-api.com/'
  pixaroaRefreshMode = 'session'
```

`session` はブラウザの `sessionStorage` を使って、現在の訪問ですでに更新したかを記録します。更新に成功すると画像 URL はローカルにも保存されるため、同じ訪問中のページ読み込みでは復元できます。

## 注意事項

- **背景ぼかし**: 設定パネルには、**外観タブ**（背景タブではありません）で背景画像をぼかすための専用スライダーがあります。これはアクリルぼかしと重なります。
- **アップロードのプライバシー**: 「アップロード」は画像をサーバーに送信しません。読者のデバイス上のブラウザ（IndexedDB）に保存します。

## 優先順位ルール

1. **ユーザーローカル設定**: 設定パネルの URL、アップロード画像、または Pixaroa の選択が最も高い優先度を持ちます。
2. **サイト設定**: `defaultBackgroundProvider` がデフォルトプロバイダーとして使用されます。

## 背景テーマカラー戦略

テーマには背景抽出モジュールが含まれています。背景プロバイダーがアクティブになると、背景画像から代表色を抽出し、固定の 17 色のテーマカラー（Material 500）のいずれかにマッチさせます。

### 色抽出アルゴリズム

設定パネルでは、読者が4つの抽出アルゴリズムから選択できます:

| アルゴリズム | 動作 |
| --- | --- |
| `weighted-average` | 全ピクセルの輝度加重平均を計算 |
| `vibrant-pixel` | 最も彩度の高いピクセルを選択 |
| `hue-histogram` | 色相ヒストグラムを構築し、最大彩度での支配的な色相を返す |
| `kmeans-vibrant` | k-means でピクセルをクラスタリングし、最も鮮やかなクラスター中心を返す |

### 手動上書き

**外観 → テーマカラー** で、プロバイダー戦略を上書きするかどうかを選択できます:

1. **オフ**: プロバイダーの動的/手動テーマカラー戦略を使用。
2. **オン**: プロバイダー戦略をグローバルに上書きし、17 のプリセットから選択するか、カスタム `#RRGGBB` を入力。

## 背景画像の帰属表示

Pixaroa から背景画像が読み込まれた場合、Tralume はページ下部に帰属表示バーを自動的に表示します。表示内容:

- 画像タイトル
- 撮影者名
- ライセンス情報
- ソースリンク（画像の提供元 URL）

帰属表示バーは閉じるボタンをクリックして閉じることができます。以下の i18n キーを使用します: `backgroundAttributionBarFormat`、`backgroundAttributionTitle`、`backgroundAttributionPhotographer`、`backgroundAttributionLicense`、`backgroundAttributionSource`、`backgroundAttributionClose`。
