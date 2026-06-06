---
title: 內容授權
weight: 80
date: '2026-06-06T00:00:00+08:00'
---

告訴讀者你的內容可以如何使用（商業使用、衍生作品、署名等）。

Tralume 支援常見的 Creative Commons 授權和「保留所有權利」。

## 支援的授權金鑰（完整列表）

| 金鑰               | 授權名稱        | 備註                                | 官方連結                                                |
| ----------------- | --------------- | ------------------------------------ | ------------------------------------------------------ |
| `cc-by-4.0`       | CC BY 4.0       | 署名                                 | <https://creativecommons.org/licenses/by/4.0/>         |
| `cc-by-sa-4.0`    | CC BY-SA 4.0    | 署名 + 相同方式分享                   | <https://creativecommons.org/licenses/by-sa/4.0/>      |
| `cc-by-nd-4.0`    | CC BY-ND 4.0    | 署名 + 禁止衍生                       | <https://creativecommons.org/licenses/by-nd/4.0/>      |
| `cc-by-nc-4.0`    | CC BY-NC 4.0    | 署名 + 非商業性                       | <https://creativecommons.org/licenses/by-nc/4.0/>      |
| `cc-by-nc-sa-4.0` | CC BY-NC-SA 4.0 | 署名 + 非商業性 + 相同方式分享         | <https://creativecommons.org/licenses/by-nc-sa/4.0/> |
| `cc-by-nc-nd-4.0` | CC BY-NC-ND 4.0 | 署名 + 非商業性 + 禁止衍生            | <https://creativecommons.org/licenses/by-nc-nd/4.0/> |
| `cc0-1.0`         | CC0 1.0         | 公眾領域貢獻                          | <https://creativecommons.org/publicdomain/zero/1.0/>   |
| `arr`             | ARR             | 保留所有權利                          |                                                        |

## 1. 網站預設值

在 `hugo.toml` 中設定全站的預設授權：

```toml
[params]
  # 注意：預設授權金鑰。
  # 注意：支援的金鑰為 CC 4.0 系列 + cc0-1.0 + arr。
  contentLicense = 'cc-by-nc-4.0'
```

## 2. 逐頁覆蓋

在頁面的 Front Matter 中覆蓋：

```yaml
---
title: "我的私人文章"
# 注意：此頁面覆蓋網站預設值，使用保留所有權利。
license: "arr"
---
```

## 回退規則

- 若未設定 `license`：使用 `params.contentLicense`。
- 若 `params.contentLicense` 也未設定：回退到 `arr`。
- 若提供了不支援的金鑰：回退到 `arr`（避免渲染未知標籤）。
