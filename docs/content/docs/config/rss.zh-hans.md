---
title: RSS 隐藏控制
weight: 80
---

默认行为：

- `content/posts/`：默认会进入 RSS。
- `content/pages/`：默认不会进入 RSS（适合关于、留言板等"站点页面"）。

你可以在页面的 Front Matter 中控制是否进入 RSS：

```yaml
---
title: "关于"
# 说明：pages 分区默认不进 RSS；设为 false 可强制包含进 RSS。
rssHidden: false
---
```

如果你想把某篇文章（通常是 `content/posts/`）从 RSS 中排除：

```yaml
---
title: "测试页面"
# 说明：设为 true 则该页面不会出现在 RSS（index.xml）订阅源中。
rssHidden: true
---
```
