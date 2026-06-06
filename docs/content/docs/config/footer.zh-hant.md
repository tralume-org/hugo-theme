---
title: 自訂頁尾
weight: 110
date: '2026-06-06T00:00:00+08:00'
---

在網站頁尾的版權宣告和 RSS 連結之後附加你自己的項目。

這適用於加入 ICP 備案號碼、隱私權政策連結或友站頁面的入口。項目以 `|` 分隔，顯示在 RSS 連結之後。

## 設定位置

在 `hugo.toml` 中設定：

```toml
[params.footer]
  # 注意：在 RSS 連結之後附加的項目。
  afterRss = [
    # 範例 1：純文字
    { text = 'ICP 12345678' },

    # 範例 2：連結項目
    { text = 'Privacy Policy', url = '/privacy/' },

    # 範例 3：使用 i18n 金鑰（用於多語言網站）
    { i18n = 'footerLinkContact' , url = '/contact/' }
  ]
```
