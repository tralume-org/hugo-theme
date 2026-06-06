---
title: 搜尋
weight: 125
date: '2026-06-06T00:00:00+08:00'
---

設定網站搜尋對話框。Tralume 支援 `pagefind` 進行靜態本機搜尋，以及 `meilisearch` 進行託管的容錯搜尋。

## 支援的提供者

| 提供者 | 後端 | 必要金鑰 |
| --- | --- | --- |
| `pagefind` | 靜態 Pagefind 索引 | 主題設定中無需金鑰 |
| `meilisearch` | 自架或 Meilisearch Cloud | `host`、`indexUid` |

## Pagefind

Pagefind 是預設提供者：

```toml
[params.search]
  # 注意：啟用搜尋按鈕和對話框。
  enable = true
  # 注意：載入由你的 Pagefind 建置步驟產生的 /pagefind/<language>/pagefind.js。
  provider = 'pagefind'
```

主題僅載入產生的 Pagefind 指令碼。你的建置流程仍須將 Pagefind 索引產生到部署的網站輸出中。

## Meilisearch

當你需要託管的搜尋後端、拼字錯誤容忍、篩選器、排序規則或跨多個部署共用搜尋時，使用 Meilisearch。

```toml
[params.search]
  # 注意：啟用搜尋對話框。
  enable = true
  # 注意：將前端提供者切換為 Meilisearch REST 搜尋。
  provider = 'meilisearch'

  [params.search.meilisearch]
    # 注意：公開的 Meilisearch 端點，不含結尾斜線。
    host = 'https://search.example.com'
    # 注意：僅使用 Search API Key。切勿在前端程式碼中使用 master key 或 admin key。
    apiKey = 'search-only-public-key'
    # 注意：包含目前網站或語言文件的索引 UID。
    indexUid = 'tralume_posts_en'
```

前端會呼叫 `POST /indexes/{index_uid}/search`。無需 Meilisearch JavaScript SDK 或 CDN 指令碼。

## 文件結構

預設情況下，Tralume 預期每個 Meilisearch 文件公開以下欄位：

| 欄位 | 用途 |
| --- | --- |
| `id` | Meilisearch 中的主鍵 |
| `title` | 搜尋結果標題 |
| `url` | 結果連結 |
| `content` | 用於截取摘錄的主要文字 |
| `summary` 或 `description` | 選用的備用摘錄 |
| `section` | 選用的結果詮釋資料 |

你可以對映不同的欄位名稱：

```toml
[params.search.meilisearch]
  # 注意：將結果標題對映到你索引的欄位。
  titleAttribute = 'headline'
  # 注意：將結果 URL 對映到你索引的欄位。
  urlAttribute = 'permalink'
  # 注意：對映顯示在結果標題下方的小型詮釋資料。
  metaAttribute = 'category'
  # 注意：Meilisearch 用於截取摘錄的欄位。
  excerptAttributes = ['body', 'summary']
```

## 搜尋參數

Tralume 公開對話框使用的常見 Meilisearch 搜尋參數：

```toml
[params.search.meilisearch]
  # 注意：對話框中顯示的最大命中數。
  limit = 20
  # 注意：Meilisearch 傳回的每個截取摘錄中的最大字詞數。
  cropLength = 24
  # 注意：限制傳回的欄位。這些欄位必須是 Meilisearch 中的可顯示屬性。
  attributesToRetrieve = ['title', 'url', 'content', 'section']
  # 注意：限制可搜尋的欄位。這些欄位必須是 Meilisearch 中的可搜尋屬性。
  attributesToSearchOn = ['title', 'content']
  # 注意：選用的篩選表達式。篩選的欄位必須是 Meilisearch 中的可篩選屬性。
  filter = 'lang = "en-US"'
  # 注意：選用的排序規則。排序的欄位必須是 Meilisearch 中的可排序屬性。
  sort = ['date:desc']
  # 注意：選用的查詢匹配策略，由 Meilisearch 支援。
  matchingStrategy = 'last'
  # 注意：選用的醒目提示屬性。這些欄位中的匹配字詞會被 <em> 標籤包裹。
  highlightAttributes = ['title', 'content']
```

Meilisearch 需要在篩選器或排序規則生效前設定索引。將每個篩選欄位加入 `filterableAttributes`，並將每個排序欄位加入 `sortableAttributes`。

## 多語言網站

對於多語言網站，可以使用每個語言一個索引，或一個共用索引搭配語言篩選器。

```toml
[params.search.meilisearch]
  # 注意：當每個 Hugo 語言有自己的 params 覆蓋時，使用語言特定的索引。
  indexUid = 'tralume_posts_en'
```

```toml
[params.search.meilisearch]
  # 注意：如果你的文件包含 lang 欄位，使用共用索引並篩選目前語言。
  indexUid = 'tralume_posts'
  filter = 'lang = "en-US"'
```

如果你使用 Meilisearch `locales`，傳入 Meilisearch 支援的 ISO 語言標籤，例如 `en` 或 `zh`：

```toml
[params.search.meilisearch]
  # 注意：幫助 Meilisearch 為查詢選擇預期的語言分析器。
  locales = ['en']
```

## 安全性

`apiKey` 值會被發送到瀏覽器。僅使用限制於所需索引和 `search` 操作的 Search API Key。絕不公開 master key、預設 admin key 或任何可以寫入文件或變更設定的金鑰。

```bash
# 注意：為一個索引建立範圍受限的 Search API Key。
# 注意：在受信任的機器上使用你的 master key 執行，而非在瀏覽器程式碼中。
curl -X POST "${MEILISEARCH_URL}/keys" \
  -H "Authorization: Bearer ${MEILISEARCH_MASTER_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Tralume frontend search",
    "actions": ["search"],
    "indexes": ["tralume_posts_en"],
    "expiresAt": null
  }'
```

## 注意事項

- Tralume 僅實現前端查詢 UI，不會將 Hugo 內容上傳到 Meilisearch。
- Meilisearch `host` 必須透過 CORS 或反向代理允許來自你網站來源的瀏覽器請求。
- 僅當你的 Meilisearch 端點是刻意公開且無需驗證時，才可以省略 `apiKey`。
- 缺少 `host` 或 `indexUid` 會使對話框顯示正常的不可用狀態。
