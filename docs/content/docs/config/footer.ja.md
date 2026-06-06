---
title: カスタムフッター
weight: 110
date: '2026-06-06T00:00:00+08:00'
---

サイトフッターの著作権表示と RSS リンクの後に独自の項目を追加します。

ICP 备案番号、プライバシーポリシーリンク、フレンドページへの入り口などを追加するのに便利です。項目は `|` で区切られ、RSS リンクの後に表示されます。

## 設定場所

`hugo.toml` に設定します:

```toml
[params.footer]
  # Note: Items appended after the RSS link.
  afterRss = [
    # Example 1: Plain text
    { text = 'ICP 12345678' },

    # Example 2: Linked item
    { text = 'Privacy Policy', url = '/privacy/' },

    # Example 3: Use an i18n key (for multilingual sites)
    { i18n = 'footerLinkContact' , url = '/contact/' }
  ]
```
