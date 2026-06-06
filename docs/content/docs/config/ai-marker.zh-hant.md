---
title: AI 貢獻標記
weight: 90
date: '2026-06-06T00:00:00+08:00'
---

隨著 AI 工具日益普及，揭露 AI 如何參與你的寫作過程變得越來越重要。此功能會呈現一個可折疊的揭露小工具：預設只顯示 AI 參與等級（例如「AI 輔助」），讀者可以點擊展開查看完整詳細資訊（使用範圍、審查等級、使用的工具）。

透過頁面 Front Matter 中的 `ai` 物件設定：

```yaml
---
title: "與 AI 協作的一天"
# 注意：AI 揭露欄位。
ai:
  # 注意：參與等級（省略或設為 none 可隱藏標記）。
  level: assist

  # 注意：AI 使用範圍（選填，可多選）。
  usage: [grammar, wording]

  # 注意：人工審查等級（選填；預設為 none）。
  review: edited

  # 注意：使用的工具（選填，可多選）。
  tools: [chatgpt]
---
```

## 支援的欄位

- `ai.level`：參與等級。
- `ai.usage`：使用範圍列表（選填）。
- `ai.review`：人工審查等級（選填）。
- `ai.tools`：使用的工具（選填）。

注意：僅當 `ai.level` 不為 `none` 時才會顯示標記。

### ai.level

- `none`：無 AI（隱藏）
- `assist`：AI 輔助
- `coauthor`：AI 協作
- `generate`：AI 生成
- `translate`：AI 翻譯

### ai.review

- `none`：未指定 / 無人工檢查
- `light`：已審查（通讀）
- `edited`：已編輯（逐行修訂）
- `fact_checked`：關鍵事實/資料/引文已由人工驗證

### ai.usage（可多選）

- `outline`：大綱/結構建議
- `rewrite`：重寫/重新架構
- `expand`：擴充細節
- `summarize`：摘要/精簡
- `tone`：語氣/風格調整
- `grammar`：文法修正
- `wording`：措辭改善
- `title`：標題/副標題建議
- `translate`：翻譯
- `research`：研究方向/筆記
- `citation`：引文格式建議
- `fact_check_help`：事實查核協助（標記可疑部分）
- `code`：程式碼生成/重寫
- `debug`：除錯/日誌分析建議
- `data`：表格/資料清理與轉換
- `image`：圖片提示/協助
- `privacy`：隱私/遮蔽建議
- `policy`：合規/風險措辭建議

### ai.tools（可多選）

- `chatgpt`：ChatGPT
- `claude`：Claude
- `gemini`：Gemini
- `deepseek`：DeepSeek
- `qwen`：Qwen
- `other`：其他

## 顯示行為

標記以可折疊的 `<details>` 元素呈現在文章標題下方。初始狀態僅顯示參與等級（例如「AI 輔助」）。點擊摘要可展開小工具，顯示：
- **使用範圍**（若已設定 `ai.usage`）
- **人工審查等級**（標記存在時一律顯示）
- **使用的工具**（若已設定 `ai.tools`）

標記僅在 `ai.level` 不為 `none` 時出現。
