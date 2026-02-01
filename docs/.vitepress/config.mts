import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: 'content',

  title: 'Tralume',
  description: 'A modern acrylic glassmorphism Hugo theme',

  // 说明：为文档站启用 i18n。
  // 约定：默认语言（English）使用根路由 /；额外语言使用小写路由前缀（/zh-hans/）。
  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
      description: 'A modern acrylic glassmorphism Hugo theme',
      themeConfig: {
        editLink: {
          pattern: 'https://forgejo.alexma.top/tralume-org/hugo-theme/_edit/main/docs/content/:path',
        },
        nav: [
          { text: 'Home', link: '/' },
          { text: 'Quick Start', link: '/quick-start' },
        ],
        sidebar: [
          {
            text: 'Getting Started',
            items: [
              { text: 'Quick Start', link: '/quick-start' },
            ],
          },
        ],
      },
    },
    'zh-hans': {
      label: '简体中文',
      lang: 'zh-Hans',
      description: '现代亚克力风格的 Hugo 主题',
      themeConfig: {
        editLink: {
          pattern: 'https://forgejo.alexma.top/tralume-org/hugo-theme/_edit/main/docs/content/:path',
        },
        nav: [
          { text: '首页', link: '/zh-hans/' },
          { text: '配置', link: '/zh-hans/config/' },
          { text: '快速开始', link: '/zh-hans/quick-start' },
        ],
        sidebar: [
          {
            text: '入门',
            items: [
              { text: '快速开始', link: '/zh-hans/quick-start' },
            ],
          },
          {
            text: '配置',
            items: [
              { text: '总览', link: '/zh-hans/config/' },
              {
                text: '设置面板',
                collapsed: true,
                items: [
                  { text: '外观模式', link: '/zh-hans/config/appearance/theme-mode' },
                  { text: '玻璃拟态', link: '/zh-hans/config/appearance/acrylic' },
                  { text: '阅读宽度', link: '/zh-hans/config/appearance/reader-width' },
                  { text: '自定义背景', link: '/zh-hans/config/appearance/background' },
                ],
              },
              { text: '站点信息与 SEO', link: '/zh-hans/config/site-info' },
              { text: '内容展示与摘要', link: '/zh-hans/config/content-display' },
              { text: '文章许可证', link: '/zh-hans/config/license' },
              { text: 'RSS 隐藏控制', link: '/zh-hans/config/rss' },
              { text: 'AI 参与度标记', link: '/zh-hans/config/ai-marker' },
              { text: '编辑此页链接', link: '/zh-hans/config/edit-source' },
              { text: '自定义页脚', link: '/zh-hans/config/footer' },
              { text: '统计分析 (Umami)', link: '/zh-hans/config/analytics' },
              { text: '友链管理', link: '/zh-hans/config/friends' },
            ],
          },
        ],
      },
    },
  },

  // 说明：按目录写作并保持路由一致：
  // - docs/content/en-us/** -> /
  // - docs/content/zh-hans/** -> /zh-hans/
  rewrites: {
    'en-us/:rest*': ':rest*',
    'zh-hans/:rest*': 'zh-hans/:rest*',
  },

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    socialLinks: [
      { icon: 'forgejo', link: 'https://forgejo.alexma.top/tralume-org/hugo-theme' },
    ],
  },
})
