---
title: 分析（Umami）
weight: 120
date: '2026-06-06T00:00:00+08:00'
---

整合 Umami，一個輕量且注重隱私的分析系統，支援選用的「被阻止的指令碼」通知、逐頁瀏覽量顯示，以及主題元件的內建互動事件。

## 注入 Umami 指令碼

在 `hugo.toml` 中設定：

```toml
[params.analytics]
  provider = 'umami'

  [params.analytics.providers.umami]
    # 注意：Umami 指令碼 URL。
    scriptUrl = 'https://analytics.example.com/script.js'
    # 注意：來自 Umami 儀表板的網站 ID。
    websiteId = 'your-website-id'

    # 選用：若指令碼被廣告攔截器阻止，顯示友善的通知。
    # 啟用後，會顯示多步驟對話框引導讀者：
    #   1. 說明為什麼使用 Umami 的問候語
    #   2. 收集了哪些資料
    #   3. 為什麼指令碼可能被阻止
    #   4. 如何在常見的廣告攔截器中將網站加入白名單
    blockNotice = true
```

## 頁面瀏覽量

呼叫 Umami 的公開 API 在文章標題下方顯示頁面瀏覽量。

```toml
[params.analytics.providers.umami.pageviews]
  # 注意：Umami 實例的基礎 URL（不包含 /script.js）。
  host = 'https://analytics.example.com'

  # 注意：此網站的分享 ID。
  # 注意：在 Umami 中啟用「分享 URL」；連結中最後一段隨機字串即為 ID。
  shareId = 'your-share-id'
```

## 內建互動事件

注入指令碼後，主題會自動回報常見互動的 Umami 自訂事件，無需額外的範本接線。

- **閱讀流程**：`scroll_depth`、`open_outline`、`close_outline`、`click_outline_item`
- **內容操作**：`copy_code`、`copy_permalink`、`click_outbound_link`、`click_tag`
- **全域導覽**：`open_mobile_menu`、`close_mobile_menu`、`open_pages_menu`、`click_nav_link`
- **UI 偏好設定**：`open_settings_panel`、`change_theme_mode`、`change_glass_strength`、`change_reader_width`、`change_background_provider`
- **列表與側邊模組**：`load_more_posts`、`reach_list_end`、`click_article_card`、`view_comments`、`click_edit_source`、`view_pageviews_widget`

## 事件參考

以下列表涵蓋主題目前發出的所有內建 Umami 自訂事件。

### 頁面與閱讀

| 事件 | 含義 | 主要附加欄位 |
| --- | --- | --- |
| `scroll_depth` | 當讀者達到深度閾值時觸發。目前閾值為 25 / 50 / 75 / 100，因此同一頁面上看到多筆記錄是正常的。 | `depth` |
| `open_outline` | 當開啟行動版文章大綱覆蓋層時觸發。 | `heading_count` |
| `close_outline` | 當關閉行動版文章大綱覆蓋層時觸發。 | 無 |
| `click_outline_item` | 當點擊文章大綱中的標題連結時觸發。 | `heading_id`、`heading_level` |
| `view_pageviews_widget` | 當頁面瀏覽量小工具成功渲染並載入資料後觸發。 | 無 |
| `view_comments` | 當評論區塊進入可視區域並符合可見度閾值時觸發。 | `provider` |

### 內容操作

| 事件 | 含義 | 主要附加欄位 |
| --- | --- | --- |
| `copy_code` | 程式碼區塊成功複製後觸發。 | `lang`、`line_count` |
| `copy_permalink` | 文章永久連結成功複製後觸發。 | `title` |
| `click_outbound_link` | 當點擊文章內容中的外部連結時觸發。 | `target_url`、`target_host`、`link_text`、`link_position` |
| `click_edit_source` | 當點擊「編輯此頁」或原始碼連結時觸發。 | `target_url`、`target_host` |
| `click_tag` | 當點擊標籤項目時觸發。 | `tag` |

### 導覽與列表

| 事件 | 含義 | 主要附加欄位 |
| --- | --- | --- |
| `open_mobile_menu` | 當開啟行動版選單時觸發。 | `position` |
| `close_mobile_menu` | 當關閉行動版選單時觸發。 | `position` |
| `open_pages_menu` | 當開啟頂欄 Pages 面板時觸發。 | `position` |
| `click_nav_link` | 當點擊主題導覽連結時觸發。 | `label`、`target_path`、`position` |
| `click_article_card` | 當點擊文章卡片開啟其詳細頁面時觸發。 | `target_path`、`title`、`position` |
| `load_more_posts` | 當無限滾動成功載入下一頁文章時觸發。 | `feed`、`current_page`、`next_page` |
| `reach_list_end` | 當無限滾動到達列表末尾時觸發。 | `feed`、`page` |

### 設定與偏好

| 事件 | 含義 | 主要附加欄位 |
| --- | --- | --- |
| `open_settings_panel` | 當開啟設定面板時觸發。 | 無 |
| `change_theme_mode` | 當主題模式變更為自動、淺色或深色時觸發。 | `mode` |
| `change_glass_strength` | 當亞克力強度值變更時觸發。 | `strength` |
| `change_reader_width` | 當閱讀寬度變更時觸發。 | `width` |
| `change_background_provider` | 當背景提供者在 URL、上傳和 Pixaroa 之間切換時觸發。 | `provider` |

## 如何解讀 Umami 條目

- 純路徑如 `/zh-hans/pages/affiliates/` 是 Umami 內建的頁面瀏覽記錄，而非主題定義的自訂事件。
- `Visitor from ... using ...` 是 Umami 的工作階段摘要，用於位置、瀏覽器、作業系統和裝置類型。
- `view_pageviews_widget on /...` 表示頁面瀏覽量小工具已成功渲染。
- `view_comments on /...` 表示評論區塊已在可視區域中可見。
- 同一頁面上出現多筆 `scroll_depth` 記錄通常表示讀者依序通過了 25%、50%、75% 和 100% 的閾值。

## 注意事項

- **隱私優先**：分析由 Umami 處理；主題僅在啟用時顯示結果。
- **優雅降級**：若請求被阻止（網路/廣告攔截），頁面瀏覽量項目會隱藏而非顯示損壞的 UI。
- **一致的上下文**：每個事件會自動包含頁面路徑、語系和頁面類型，方便在 Umami 中篩選。
