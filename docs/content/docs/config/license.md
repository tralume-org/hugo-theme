---
title: Content License
weight: 70
---

Tell readers how your content may be used (commercial use, derivatives, attribution, etc.).

Tralume supports common Creative Commons licenses and "All rights reserved".

## Supported license keys (full list)

| key               | License name    | Notes                                | Official link                                          |
| ----------------- | --------------- | ------------------------------------ | ------------------------------------------------------ |
| `cc-by-4.0`       | CC BY 4.0       | Attribution                          | <https://creativecommons.org/licenses/by/4.0/>         |
| `cc-by-sa-4.0`    | CC BY-SA 4.0    | Attribution + ShareAlike              | <https://creativecommons.org/licenses/by-sa/4.0/>      |
| `cc-by-nd-4.0`    | CC BY-ND 4.0    | Attribution + NoDerivatives           | <https://creativecommons.org/licenses/by-nd/4.0/>      |
| `cc-by-nc-4.0`    | CC BY-NC 4.0    | Attribution + NonCommercial           | <https://creativecommons.org/licenses/by-nc/4.0/>      |
| `cc-by-nc-sa-4.0` | CC BY-NC-SA 4.0 | Attribution + NonCommercial + ShareAlike | <https://creativecommons.org/licenses/by-nc-sa/4.0/> |
| `cc-by-nc-nd-4.0` | CC BY-NC-ND 4.0 | Attribution + NonCommercial + NoDerivatives | <https://creativecommons.org/licenses/by-nc-nd/4.0/> |
| `cc0-1.0`         | CC0 1.0         | Public domain dedication              | <https://creativecommons.org/publicdomain/zero/1.0/>   |
| `arr`             | ARR             | All rights reserved                   |                                                        |

## 1. Site default

Set the site-wide default license in `hugo.toml`:

```toml
[params]
  # Note: Default license key.
  # Note: Supported keys are CC 4.0 series + cc0-1.0 + arr.
  contentLicense = 'cc-by-nc-4.0'
```

## 2. Per-page override

Override in a page's Front Matter:

```yaml
---
title: "My private post"
# Note: This page overrides the site default and uses all rights reserved.
license: "arr"
---
```

## Fallback rules

- If `license` is unset: use `params.contentLicense`.
- If `params.contentLicense` is also unset: fall back to `arr`.
- If an unsupported key is provided: fall back to `arr` (avoid rendering an unknown label).
