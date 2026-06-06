---
title: 自訂背景
weight: 40
date: '2026-06-06T00:00:00+08:00'
---

控制網站背景圖片來源和背景模糊。

支援三種提供者：直接圖片 URL、本機上傳（僅儲存在讀者的瀏覽器中）和 Pixaroa 隨機圖片服務。

## 設定位置

在網站根目錄的 `hugo.toml` 中設定：

```toml
[params.theme]
  # 注意：首次訪客的預設背景提供者。
  # 選項：
  #   - 'url'     （預設）：使用使用者填寫的圖片 URL（若有）。
  #   - 'upload'  ：使用本機上傳的圖片（僅在該瀏覽器中可見）。
  #   - 'pixaroa' ：使用 Pixaroa 隨機圖片服務。
  defaultBackgroundProvider = 'url'

  # 注意：如果你想使用 Pixaroa，請在此設定它的基礎 URL。
  # 注意：留空會停用 Pixaroa。
  # 範例：
  #   - https://pixaroa.example.com/   （建議：以斜線結尾）
  #   - /pixaroa/                      （同源反向代理；也以斜線結尾）
  pixaroaHost = 'https://your-pixaroa-api.com/'
```

## 提供者詳細資訊

### Pixaroa 進階設定

使用 Pixaroa 時，設定面板會在可展開的「進階」區段下公開額外選項：

- **等級**（`settings_tier`）：圖片品質/大小等級（auto、1–6）
- **方向**（`settings_orientation`）：自動、橫向、直向或正方形
- **格式**（`settings_format`）：auto、jxl、avif、webp、jpeg 或 png

這些參數會傳送到 Pixaroa API，影響傳回的圖片類型。

## 注意事項

- **背景模糊**：設定面板在**外觀分頁**（而非背景分頁）中提供一個專用的滑桿來模糊背景圖片。這會與亞克力模糊疊加。
- **上傳隱私**：「上傳」不會將圖片傳送到你的伺服器；它會將圖片儲存在讀者裝置的瀏覽器中（IndexedDB）。

## 優先規則

1. **使用者本機設定**：來自設定面板的 URL、上傳圖片或 Pixaroa 選擇具有最高優先權。
2. **網站設定**：`defaultBackgroundProvider` 用作預設提供者。

## 背景主題色策略

主題包含一個背景擷取模組：一旦背景提供者啟用，它會從背景圖片中擷取一個代表性顏色，並將其對應到固定的 17 種主題顏色之一（Material 500）。

### 顏色擷取演算法

設定面板讓讀者從四種擷取演算法中選擇：

| 演算法 | 行為 |
| --- | --- |
| `weighted-average` | 計算所有像素的亮度加權平均值 |
| `vibrant-pixel` | 選取飽和度最高的像素 |
| `hue-histogram` | 建置色相直方圖，並以全飽和度傳回主色相 |
| `kmeans-vibrant` | 使用 k-means 將像素分群，並傳回最鮮豔的群中心 |

### 手動覆蓋

在**外觀 → 主題顏色**中，你可以選擇是否覆蓋提供者策略：

1. **關閉**：使用提供者動態/手動主題色策略。
2. **開啟**：全域覆蓋提供者策略，然後從 17 種預設中選擇或輸入自訂的 `#RRGGBB`。

## 背景圖片歸屬

當從 Pixaroa 載入背景圖片時，Tralume 會自動在頁面底部顯示歸屬列。它會顯示：

- 圖片標題
- 攝影師名稱
- 授權資訊
- 來源連結（圖片的原始 URL）

歸屬列可以透過點擊關閉按鈕來關閉。它使用以下 i18n 金鑰：`backgroundAttributionBarFormat`、`backgroundAttributionTitle`、`backgroundAttributionPhotographer`、`backgroundAttributionLicense`、`backgroundAttributionSource` 和 `backgroundAttributionClose`。
