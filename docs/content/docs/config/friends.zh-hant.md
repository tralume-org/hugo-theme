---
title: 友站連結
weight: 140
date: '2026-06-06T00:00:00+08:00'
---

控制「友站」頁面上連結的顯示方式，包括國際化分組和手動權重排序。

## 資料檔案位置

在你的 Hugo 網站中建立 `data/friends.yaml`（也可使用 `.toml` 或 `.json`）。面向讀者的頁面通常標記為「Friends」。

## 範例資料

```yaml
- name:
    zh-Hans: "我的站点"
    en-US: "My Site"
    default: "My Site" # 選用：當前語言缺失時的回退值。
  description:
    zh-Hans: "你好"
    en-US: "Hello"
  url: "https://example.com"
  avatar: "https://example.com/avatar.png"
  # 選用：手動排序權重；數值越小越靠前，預設為 10000。
  weight: 10
  # 選用：用於「優先目前語言」分組和卡片語言標籤。
  # 注意：.lang 也可作為 language 的別名。
  language: ["zh-Hans", "en-US"]

# 注意：如果不需要國際化，可以直接使用純文字。
- name: "My Site"
  description: "Hello"
  url: "https://example.com"
  avatar: "https://example.com/avatar.png"
  # 選用：省略時主題將其視為 10000。
  weight: 100
  # 選用：用於「優先目前語言」分組和卡片語言標籤。
```

## 主要功能

- **國際化友善**：`name` 和 `description` 可以是純文字或語言對映。
- **權重排序**：`weight` 值越小越靠前；省略時主題使用 `10000`。
- **相同權重內隨機排序**：權重相同的連結在網站建置時會隨機排列。重新整理已部署的靜態頁面通常不會改變順序。
- **優先目前語言分組**：`language` 包含目前網站語言的連結會作為一個群組優先渲染，其他語言的連結則在其後渲染。
