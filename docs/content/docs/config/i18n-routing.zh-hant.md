---
title: 國際化路由與自動入口頁
weight: 85
date: '2026-06-06T00:00:00+08:00'
---

Tralume 讓 Hugo 正常生成每個正式的內容 URL，然後在建置後步驟中新增「智慧語言入口頁」。

## 路由模式

- `defaultContentLanguageInSubdir = true`：正式內容 URL 保持在 `/en-us/...` 和 `/zh-hans/...` 下，而中立入口頁使用 `/` 和 `/posts/test/`。
- `defaultContentLanguageInSubdir = false`：預設語言保留根路徑 URL，而中立入口頁移到 `/auto/` 和 `/auto/posts/test/`。
- 明確的語言 URL 不會被自動重寫；只有入口頁會執行基於語言的重導向。
- 如果一篇文章或頁面只存在於一種語言，入口頁會直接重導向到該單一目標，而不檢查 `localStorage` 或 `navigator.languages`。

## 基本設定

在 `hugo.toml` 中設定：

```toml
defaultContentLanguage = 'en-US'
defaultContentLanguageInSubdir = true
# 注意：停用 Hugo 內建的預設語言重導向，讓主題的入口頁指令碼處理。
disableDefaultLanguageRedirect = true

[params.i18nRouting]
  # 注意：啟用在建置後產生的智慧語言入口頁。
  enableAutoEntry = true
```

僅在你已將 `python3 tools/gen_auto_entries.py` 實際整合到正式建置流程後才啟用此功能。否則請保持停用，讓 Hugo 內建的預設語言重導向處理。

## 建置流程

主題首先讓 Hugo 渲染正式頁面和 `route-manifest.json`，然後執行 Python 產生器：

```bash
# 注意：首先建置 Hugo 的正式內容頁面和路由清單。
# 注意：此範例將驗證輸出寫入 public_test/ 以避免污染預設的 public/ 目錄。
hugo --destination public_test/hugo-auto-entry

# 注意：讀取 route-manifest.json 並在發佈目錄內產生智慧入口頁。
# 注意：指令碼會檢查路徑衝突並移除先前執行所產生的過時入口頁。
python3 tools/gen_auto_entries.py --publish-dir public_test/hugo-auto-entry
```

## 注意事項

- 入口頁首先讀取固定的 `localStorage['tralume-language']` 金鑰。
- 如果沒有已儲存的語言，則回退到 `navigator.languages`。
- 如果沒有匹配的項目，則重導向到預設語言的形式頁面。
- 入口頁始終使用 `noindex,follow`，並將 canonical 指向正式內容頁面；它們不會進入 Hugo 的 sitemap 或 RSS 輸出。
- 如果此功能未啟用，主題會保持 Hugo 的原生行為，讓 Hugo 處理根路徑的預設語言重導向。
