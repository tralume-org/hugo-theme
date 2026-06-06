---
title: 亞克力效果
weight: 20
date: '2026-06-06T00:00:00+08:00'
---

控制主要表面（例如卡片、導覽列）所使用的亞克力（毛玻璃）效果。

## 設定位置

在網站根目錄的 `hugo.toml` 中設定：

```toml
[params.theme]
  # 注意：預設亞克力透明度（百分比）。
  # 範圍：0 到 95 之間的數字。
  # 數值越大越不透明；越小越透明。
  defaultGlassStrength = 45
```

## 設定面板控制項

設定面板中的外觀分頁提供三個滑桿：

1. **透明度**（`settingsPanelGlassRangeLabel`）：控制亞克力表面的透明度。範圍：0%–95%，預設值：`defaultGlassStrength`。
2. **模糊半徑**（`settingsPanelGlassBlurLabel`）：控制背景模糊的強度。範圍：0px–48px，預設值：24px。
3. **背景模糊**（`settingsPanelBackgroundBlurLabel`）：控制套用到自訂背景圖片的模糊程度。範圍：0px–40px，預設值：0px。

讀者可以即時調整這三項，他們的選擇會儲存在本機。

## 優先規則

1. **使用者調整**：讀者可以在設定面板中變更這些值；已儲存的值具有最高優先權。
2. **網站設定**：對於新訪客，`defaultGlassStrength` 將用作初始透明度值。
