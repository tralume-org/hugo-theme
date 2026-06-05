# 说明：Tralume 示例站点

这是 [Tralume Hugo 主题](https://forgejo.alexma.top/tralume-org/hugo-theme) 的示例站点。克隆后可直接运行。

## 运行方式

```bash
# 进入示例站点目录
cd exampleSite

# 初始化 Hugo 模块（首次运行）
hugo mod tidy

# 启动本地预览
hugo server -D

# 构建生产版本
hugo --minify
```

预览地址默认是 `http://localhost:1313/zh-hans/`。

## 目录结构

```
exampleSite/
├── hugo.toml                 # 站点配置（含详细注释）
├── content/
│   ├── _index.md            # 英文首页
│   ├── _index.zh-Hans.md    # 中文首页
│   ├── posts/
│   │   ├── hello-world/     # 入门文章（中英双语）
│   │   └── features-demo/   # 特性演示（中英双语）
│   ├── pages/
│   │   └── about/           # 关于页面（中英双语）
│   └── friends/
│       ├── _index.md        # 友链页（英文）
│       └── _index.zh-Hans.md # 友链页（中文）
├── data/
│   └── friends.yaml         # 友链数据
├── i18n/
│   ├── zh-Hans.yaml         # 站点级中文 i18n 覆盖
│   └── en-US.yaml           # 站点级英文 i18n 覆盖
└── static/
    └── site.webmanifest     # PWA 清单
```

## 配置要点

`hugo.toml` 中已通过注释标注了所有可选/必填配置项。关键步骤：

1. 将 `baseURL` 改为你的域名
2. 根据需要启用评论/统计/搜索等模块
3. 添加你的文章内容

更多配置说明请参阅 [Tralume 文档](https://tralume.org/docs/)。
