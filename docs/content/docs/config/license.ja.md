---
title: コンテンツライセンス
weight: 80
date: '2026-06-06T00:00:00+08:00'
---

コンテンツの利用方法（商用利用、改変、帰属表示など）を読者に伝えます。

Tralume は一般的なクリエイティブ・コモンズライセンスと「All rights reserved」をサポートします。

## サポートされるライセンスキー（全リスト）

| キー              | ライセンス名    | 備考                                | 公式リンク                                              |
| ----------------- | --------------- | ------------------------------------ | ------------------------------------------------------ |
| `cc-by-4.0`       | CC BY 4.0       | 表示                                  | <https://creativecommons.org/licenses/by/4.0/>         |
| `cc-by-sa-4.0`    | CC BY-SA 4.0    | 表示 + 継承                           | <https://creativecommons.org/licenses/by-sa/4.0/>      |
| `cc-by-nd-4.0`    | CC BY-ND 4.0    | 表示 + 改変禁止                       | <https://creativecommons.org/licenses/by-nd/4.0/>      |
| `cc-by-nc-4.0`    | CC BY-NC 4.0    | 表示 + 非営利                         | <https://creativecommons.org/licenses/by-nc/4.0/>      |
| `cc-by-nc-sa-4.0` | CC BY-NC-SA 4.0 | 表示 + 非営利 + 継承                    | <https://creativecommons.org/licenses/by-nc-sa/4.0/> |
| `cc-by-nc-nd-4.0` | CC BY-NC-ND 4.0 | 表示 + 非営利 + 改変禁止                | <https://creativecommons.org/licenses/by-nc-nd/4.0/> |
| `cc0-1.0`         | CC0 1.0         | パブリックドメイン提供                  | <https://creativecommons.org/publicdomain/zero/1.0/>   |
| `arr`             | ARR             | 全著作権所有                           |                                                        |

## 1. サイトデフォルト

`hugo.toml` にサイト全体のデフォルトライセンスを設定します:

```toml
[params]
  # Note: Default license key.
  # Note: Supported keys are CC 4.0 series + cc0-1.0 + arr.
  contentLicense = 'cc-by-nc-4.0'
```

## 2. ページごとの上書き

ページの Front Matter で上書きします:

```yaml
---
title: "My private post"
# Note: This page overrides the site default and uses all rights reserved.
license: "arr"
---
```

## フォールバックルール

- `license` が未設定の場合: `params.contentLicense` を使用。
- `params.contentLicense` も未設定の場合: `arr` にフォールバック。
- サポートされていないキーが指定された場合: `arr` にフォールバック（不明なラベルの表示を回避）。
