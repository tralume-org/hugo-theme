---
title: 自定义背景
weight: 40
date: '2026-06-06T00:00:00+08:00'
---

控制整个站点的背景图片来源及模糊半径。

支持三种来源：直接使用图片链接、本地上传（仅保存在用户浏览器本地）、以及 Pixaroa 随机图服务。

## 配置位置

在站点根目录的 `hugo.toml` 中设置：

```toml
[params.theme]
  # 说明：设置首次访问时默认使用的背景来源。
  # 可选值：
  #   - 'url'   (默认)：使用用户填写的图片链接（如有）。
  #   - 'upload'：使用用户上传的本地图片（仅限该用户浏览器可见）。
  #   - 'pixaroa'：使用 Pixaroa 随机图服务。
  defaultBackgroundProvider = 'url'

  # 说明：如果你想使用 Pixaroa 服务，需要在这里设置服务地址（base URL）。
  # 注意：留空将无法使用 Pixaroa。
  # 你可以填写：
  #   - https://pixaroa.example.com/   （推荐：以 / 结尾）
  #   - /pixaroa/                      （同域反向代理路径；同样建议以 / 结尾）
  pixaroaHost = 'https://your-pixaroa-api.com/'

  # 说明：Pixaroa 自动刷新策略。
  #   - 'session'（默认）：每个浏览器会话首次访问刷新一次，站内切换页面不刷新。
  #   - 'persist'：复用上次拉取的随机图。
  pixaroaRefreshMode = 'session'
```

## Provider 详情

### Pixaroa 高级设置

使用 Pixaroa 时，设置面板会在可展开的"高级"区域中提供以下额外选项：

- **分级**（`settings_tier`）：图片质量/尺寸等级（auto、1–6）
- **方向**（`settings_orientation`）：auto、landscape（横版）、portrait（竖版）、square（方形）
- **格式**（`settings_format`）：auto、jxl、avif、webp、jpeg、png

这些参数会发送到 Pixaroa API 并影响返回的图片。

### Pixaroa 刷新策略

如果你希望读者每次打开站点都看到新的随机背景，但在同一次访问中切换页面不换图，请设置：

```toml
[params.theme]
  defaultBackgroundProvider = 'pixaroa'
  pixaroaHost = 'https://your-pixaroa-api.com/'
  pixaroaRefreshMode = 'session'
```

`session` 使用浏览器的 `sessionStorage` 记录本次访问是否已经刷新；刷新成功后仍会把图片 URL 写入本地缓存，用于同一次访问内的页面跳转恢复。

## 功能说明

- **背景模糊**：设置面板在**外观（Appearance）标签页**中提供了专门的滑动条来调节背景图本身的模糊半径（不在"自定义背景"标签页）。这与"亚克力效果"的模糊半径会叠加生效。
- **上传功能**：这里的"上传"并不会把图片发到你的服务器，而是利用浏览器的本地数据库（IndexedDB）保存在用户自己的电脑上，保护隐私且不占服务器流量。

## 优先级规则

1. **用户本地配置**：用户在面板里填写的 URL、上传的图或选择的 Pixaroa 设置优先级最高。
2. **站点配置**：默认来源由 `defaultBackgroundProvider` 决定。

## 背景主题色策略

主题内置了背景提取模块：当背景 provider 生效后，会从背景图提取代表色并匹配到固定的 17 个主题色（Material 500）。

### 取色算法

设置面板允许读者从四种提取算法中选择：

| 算法 | 行为 |
| --- | --- |
| `weighted-average` | 计算所有像素的亮度加权平均值 |
| `vibrant-pixel` | 选取饱和度最高的像素 |
| `hue-histogram` | 构建色相直方图，取主导色相并返回满饱和度颜色 |
| `kmeans-vibrant` | 使用 k-means 聚类像素，返回最鲜艳的聚类中心 |

### 手动覆盖

你可以在 **外观 → 主题色** 中控制是否覆盖背景策略：

1. **开关关闭**：使用背景 provider 的动态/手动主题色策略。
2. **开关打开**：全局覆盖背景策略，你可以手动选择 17 色预设或输入 `#RRGGBB`。

## 背景图片来源归属

当背景图片来自 Pixaroa 时，Tralume 会自动在页面底部显示来源归属条，包含：

- 图片标题
- 摄影师名称
- 许可信息
- 来源链接（图片原始地址）

归属条可以通过点击关闭按钮隐藏。它使用以下 i18n 键：`backgroundAttributionBarFormat`、`backgroundAttributionTitle`、`backgroundAttributionPhotographer`、`backgroundAttributionLicense`、`backgroundAttributionSource`、`backgroundAttributionClose`。
