---
title: 評論
weight: 130
date: '2026-06-05T00:00:00+08:00'
---

設定文章評論小工具。Tralume 支援 `remark42`、`giscus`、`utterances`、`waline` 和 `twikoo`，並在提供者支援的情況下讓小工具跟隨目前的網站主題和頁面語言。預設情況下，評論串使用預設語言的形式 URL，而非按語言特定的 URL 分割。

## 支援的提供者

| 提供者 | 後端 | 必要金鑰 |
| --- | --- | --- |
| `remark42` | 自架 Remark42 | `host` |
| `giscus` | GitHub Discussions | `repo`、`repoId`、`category`、`categoryId` |
| `utterances` | GitHub Issues | `repo` |
| `waline` | Waline 伺服器 | `serverURL` |
| `twikoo` | Twikoo 環境 | `envId` |

## 基本設定

在 `hugo.toml` 中設定一個提供者：

```toml
[params.comments]
  provider = 'remark42'
  # 注意：用於合併評論串的策略。
  # 注意：defaultLanguage 使用預設語言的形式 URL；這是主題的預設值。
  mergeStrategy = 'defaultLanguage'

  [params.comments.providers.remark42]
    # 注意：Remark42 服務 URL，必須與後端設定中的 REMARK_URL 相符。
    host = 'https://remark42.example.com'
    # 注意：網站 ID，必須與 Remark42 後端啟動設定中的 SITE 相符。
    siteId = 'my-site'
```

只會渲染選定的提供者。如果該提供者的必要金鑰缺失，評論卡片不會被渲染。

## Giscus

```toml
[params.comments]
  provider = 'giscus'
  # 注意：defaultLanguage 會在翻譯頁面之間共用同一個討論串。
  mergeStrategy = 'defaultLanguage'

  [params.comments.providers.giscus]
    # 注意：已安裝 Giscus 的 GitHub 儲存庫。
    repo = 'owner/repo'
    # 注意：來自 Giscus 設定頁面的儲存庫 ID。
    repoId = 'R_kgDOExample'
    # 注意：GitHub Discussions 分類名稱。
    category = 'Announcements'
    # 注意：來自 Giscus 設定頁面的分類 ID。
    categoryId = 'DIC_kwDOExample'
```

選用的 Giscus 參數：

```toml
[params.comments.providers.giscus]
  # 注意：對應模式。主題預設為 specific，使用共用的討論串 URL 作為 term。
  mapping = 'specific'
  # 注意：自訂 term。留空則使用 mergeStrategy 產生的 URL。
  term = 'custom-thread-id'
  # 注意：啟用嚴格的標題比對。
  strict = false
  # 注意：顯示反應控制項。
  reactionsEnabled = true
  # 注意：發送討論串詮釋資料事件。
  emitMetadata = false
  # 注意：評論輸入位置。
  inputPosition = 'bottom'
  # 注意：用於 Tralume 淺色/深色模式的 Giscus 主題。
  lightTheme = 'light'
  darkTheme = 'dark'
```

## Utterances

```toml
[params.comments]
  provider = 'utterances'
  mergeStrategy = 'defaultLanguage'

  [params.comments.providers.utterances]
    # 注意：已安裝 Utterances 的 GitHub 儲存庫。
    repo = 'owner/repo'
```

選用的 Utterances 參數：

```toml
[params.comments.providers.utterances]
  # 注意：自訂 issue term。留空則使用 mergeStrategy 產生的 URL。
  issueTerm = 'custom-thread-id'
  # 注意：套用到 Utterances 所建立 issue 上的標籤。
  label = 'comments'
  # 注意：用於 Tralume 淺色/深色模式的 Utterances 主題。
  lightTheme = 'github-light'
  darkTheme = 'github-dark'
```

## Waline

```toml
[params.comments]
  provider = 'waline'
  mergeStrategy = 'defaultLanguage'

  [params.comments.providers.waline]
    # 注意：Waline 伺服器 URL。
    serverURL = 'https://waline.example.com'
```

選用的 Waline 參數：

```toml
[params.comments.providers.waline]
  # 注意：自訂語言代碼。留空則跟隨目前頁面語言。
  lang = 'en-US'
  # 注意：發佈評論前必填的詮釋資料欄位。
  requiredMeta = ['nick', 'mail']
  # 注意：若你的 Waline 伺服器支援，啟用反應、頁面瀏覽量和評論計數器。
  reaction = true
  pageview = true
  comment = true
```

## Twikoo

```toml
[params.comments]
  provider = 'twikoo'
  mergeStrategy = 'defaultLanguage'

  [params.comments.providers.twikoo]
    # 注意：Twikoo 環境 ID 或伺服器 URL，取決於你的部署目標。
    envId = 'https://twikoo.example.com'
```

選用的 Twikoo 參數：

```toml
[params.comments.providers.twikoo]
  # 注意：騰訊雲區域，僅在騰訊 CloudBase 部署時需要。
  region = 'ap-shanghai'
  # 注意：自訂語言代碼。留空則跟隨目前頁面語言。
  lang = 'en'
```

## Remark42 選用參數

```toml
[params.comments.providers.remark42]
  # 注意：行動裝置上預設顯示的最大評論數。
  maxShownComments = 20
  # 注意：是否向訪客顯示電子郵件訂閱入口。
  showEmailSubscription = true
  # 注意：是否向訪客顯示 RSS 訂閱入口。
  showRssSubscription = true
  # 注意：是否啟用更簡潔的介面。
  simpleView = false
  # 注意：是否隱藏 Remark42 頁尾。預設隱藏（true）；設為 false 則重新顯示。
  noFooter = true
```

## 注意事項

- 評論小工具會在文章詮釋資料卡片之後，以一個專用卡片的形式渲染。
- Remark42、Giscus、Utterances 和 Waline 會自動跟隨目前網站的淺色/深色模式。Twikoo 則使用自己的前端主題行為。
- 提供者語言在支援的情況下會跟隨目前頁面語言。主題會將 `zh-Hans` 對應到 `zh-CN`；英文對應到 `en`，但 Waline 使用 `en-US`。
- `mergeStrategy = 'smartPath'`：將 `/zh-hans/posts/test/` 和 `/en-us/posts/test/` 合併為一個中立的討論串；當 `defaultContentLanguageInSubdir = true` 時，討論串 URL 保持為 `/posts/test/`；當 `defaultContentLanguageInSubdir = false` 且 `params.i18nRouting.enableAutoEntry = true` 時，則變為 `/auto/posts/test/`，以便通知郵件也先到達智慧入口頁。
- `mergeStrategy = 'defaultLanguage'`：始終使用預設語言的形式 URL 作為共用的討論串識別碼。這是主題的預設值。請將預設語言保持在最低的 `weight`，讓 Hugo 的語言順序保持一致。
- `mergeStrategy = 'none'`：為每個語言 URL 保留獨立的討論串。
- Giscus 預設為 `mapping = 'specific'`，Utterances 預設為自訂 issue term，而 Waline/Twikoo 使用 `path`；三者均使用 `mergeStrategy` 產生的 URL，除非你覆蓋了提供者特定的 term/path 設定。
