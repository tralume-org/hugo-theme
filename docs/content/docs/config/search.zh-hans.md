---
title: 搜索
weight: 125
date: '2026-06-06T00:00:00+08:00'
---

配置站点搜索弹窗。Tralume 支持使用 `pagefind` 做静态本地搜索，也支持使用 `meilisearch` 接入托管的容错搜索后端。

## 支持的 provider

| Provider | 后端 | 必填配置 |
| --- | --- | --- |
| `pagefind` | 静态 Pagefind 索引 | 主题配置中无需额外参数 |
| `meilisearch` | 自托管或 Meilisearch Cloud | `host`、`indexUid` |

## Pagefind

Pagefind 是默认 provider：

```toml
[params.search]
  # 说明：启用搜索按钮与搜索弹窗。
  enable = true
  # 说明：加载构建流程生成的 /pagefind/<language>/pagefind.js。
  provider = 'pagefind'
```

主题只负责加载生成后的 Pagefind 脚本。你仍然需要在站点构建流程中把 Pagefind 索引生成到部署产物内。

## Meilisearch

当你需要托管搜索后端、拼写容错、过滤、排序规则，或希望多个部署共享同一套搜索服务时，可以使用 Meilisearch。

```toml
[params.search]
  # 说明：启用搜索弹窗。
  enable = true
  # 说明：把前端搜索 provider 切换为 Meilisearch REST 搜索。
  provider = 'meilisearch'

  [params.search.meilisearch]
    # 说明：公开的 Meilisearch 访问地址，不要带结尾斜杠。
    host = 'https://search.example.com'
    # 说明：只能使用 Search API Key，禁止在前端暴露 master key 或 admin key。
    apiKey = 'search-only-public-key'
    # 说明：存放当前站点或当前语言文档的索引 UID。
    indexUid = 'tralume_posts_zh'
```

前端会调用 `POST /indexes/{index_uid}/search`。不需要额外引入 Meilisearch JavaScript SDK 或 CDN 脚本。

## 文档字段

默认情况下，Tralume 假定每条 Meilisearch 文档包含这些字段：

| 字段 | 用途 |
| --- | --- |
| `id` | Meilisearch 主键 |
| `title` | 搜索结果标题 |
| `url` | 结果链接 |
| `content` | 用于生成摘要的正文 |
| `summary` 或 `description` | 可选的摘要备用字段 |
| `section` | 可选的结果元信息 |

如果你的索引字段不同，可以手动映射：

```toml
[params.search.meilisearch]
  # 说明：把结果标题映射到你的索引字段。
  titleAttribute = 'headline'
  # 说明：把结果链接映射到你的索引字段。
  urlAttribute = 'permalink'
  # 说明：映射显示在标题下方的简短元信息。
  metaAttribute = 'category'
  # 说明：让 Meilisearch 从这些字段中裁剪摘要。
  excerptAttributes = ['body', 'summary']
```

## 搜索参数

Tralume 暴露了搜索弹窗常用的 Meilisearch 搜索参数：

```toml
[params.search.meilisearch]
  # 说明：搜索弹窗最多展示多少条结果。
  limit = 20
  # 说明：Meilisearch 返回摘要时最多保留多少个词。
  cropLength = 24
  # 说明：限制返回字段；这些字段必须属于 Meilisearch 的 displayedAttributes。
  attributesToRetrieve = ['title', 'url', 'content', 'section']
  # 说明：限制参与搜索的字段；这些字段必须属于 Meilisearch 的 searchableAttributes。
  attributesToSearchOn = ['title', 'content']
  # 说明：可选过滤表达式；被过滤字段必须属于 Meilisearch 的 filterableAttributes。
  filter = 'lang = "zh-Hans"'
  # 说明：可选排序规则；被排序字段必须属于 Meilisearch 的 sortableAttributes。
  sort = ['date:desc']
  # 说明：可选查询匹配策略，取值需由 Meilisearch 支持。
  matchingStrategy = 'last'
  # 说明：可选高亮字段；匹配到的词条会被 <em> 标签包裹。
  highlightAttributes = ['title', 'content']
```

Meilisearch 需要先配置索引设置，过滤和排序才能生效。用于过滤的字段要加入 `filterableAttributes`，用于排序的字段要加入 `sortableAttributes`。

## 多语言站点

多语言站点可以选择“每种语言一个索引”，也可以选择“共用一个索引并通过语言字段过滤”。

```toml
[params.search.meilisearch]
  # 说明：当每个 Hugo 语言都有独立 params 覆盖时，可使用语言专属索引。
  indexUid = 'tralume_posts_zh'
```

```toml
[params.search.meilisearch]
  # 说明：共用同一索引，并用文档中的 lang 字段过滤当前语言。
  indexUid = 'tralume_posts'
  filter = 'lang = "zh-Hans"'
```

如果使用 Meilisearch 的 `locales` 参数，请传入 Meilisearch 支持的 ISO 语言代码，例如 `en` 或 `zh`：

```toml
[params.search.meilisearch]
  # 说明：帮助 Meilisearch 为查询选择预期的语言分析器。
  locales = ['zh']
```

## 安全

`apiKey` 会下发到浏览器。只能使用限制在目标索引和 `search` 动作内的 Search API Key。不要暴露 master key、默认 admin key，或任何可以写入文档、修改设置的密钥。

```bash
# 说明：为单个索引创建权限收窄的 Search API Key。
# 注意：这条命令只能在可信机器上配合 master key 执行，不能放进浏览器代码。
curl -X POST "${MEILISEARCH_URL}/keys" \
  -H "Authorization: Bearer ${MEILISEARCH_MASTER_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Tralume frontend search",
    "actions": ["search"],
    "indexes": ["tralume_posts_zh"],
    "expiresAt": null
  }'
```

## 行为说明

- Tralume 只实现前端查询 UI，不负责把 Hugo 内容上传到 Meilisearch。
- Meilisearch 的 `host` 必须允许站点来源发起浏览器请求，可通过 CORS 或反向代理实现。
- 只有当 Meilisearch 端点有意公开且不启用鉴权时，才可以省略 `apiKey`。
- 缺少 `host` 或 `indexUid` 时，搜索弹窗会显示常规“搜索暂不可用”状态。
