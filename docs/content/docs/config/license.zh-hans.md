---
title: 文章许可证
weight: 80
date: '2026-06-06T00:00:00+08:00'
---

告知读者你的内容如何被授权使用（例如是否允许商用、是否允许演绎、是否要求署名等）。

Tralume 支持常用的 Creative Commons 系列以及 "保留所有权利" 许可证。

## 支持的许可证 Key（完整列表）

| key               | 协议名称        | 说明                               | 官方链接                                             |
| ----------------- | --------------- | ---------------------------------- | ---------------------------------------------------- |
| `cc-by-4.0`       | CC BY 4.0       | 署名                               | <https://creativecommons.org/licenses/by/4.0/>       |
| `cc-by-sa-4.0`    | CC BY-SA 4.0    | 署名 + 相同方式共享                | <https://creativecommons.org/licenses/by-sa/4.0/>    |
| `cc-by-nd-4.0`    | CC BY-ND 4.0    | 署名 + 禁止演绎                    | <https://creativecommons.org/licenses/by-nd/4.0/>    |
| `cc-by-nc-4.0`    | CC BY-NC 4.0    | 署名 + 非商业性使用                | <https://creativecommons.org/licenses/by-nc/4.0/>    |
| `cc-by-nc-sa-4.0` | CC BY-NC-SA 4.0 | 署名 + 非商业性使用 + 相同方式共享 | <https://creativecommons.org/licenses/by-nc-sa/4.0/> |
| `cc-by-nc-nd-4.0` | CC BY-NC-ND 4.0 | 署名 + 非商业性使用 + 禁止演绎     | <https://creativecommons.org/licenses/by-nc-nd/4.0/> |
| `cc0-1.0`         | CC0 1.0         | 放弃著作权（公共领域贡献）         | <https://creativecommons.org/publicdomain/zero/1.0/> |
| `arr`             | ARR             | 保留所有权利                       |                                                      |

## 1. 站点默认

在 `hugo.toml` 中设置全站默认协议：

```toml
[params]
  # 说明：默认使用的许可证 key。
  # 注意：仅支持 CC 4.0 系列（见上表）+ cc0-1.0 + arr。
  contentLicense = 'cc-by-nc-4.0'
```

## 2. 单篇文章覆盖

在文章开头的参数（Front Matter）中设置：

```yaml
---
title: "我的私有文章"
# 说明：这篇文章不遵循站点默认协议，标记为保留所有权利。
license: "arr"
---
```

## 回退规则

- 未设置 `license` 时：使用 `params.contentLicense`。
- `params.contentLicense` 也未设置时：回退为 `arr`。
- 填写了不支持的 key：同样回退为 `arr`（避免渲染出未知标识）。
