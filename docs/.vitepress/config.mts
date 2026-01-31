import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: 'content',

  title: 'Tralume',
  description: 'A modern acrylic glassmorphism Hugo theme',

  // 说明：为文档站启用 i18n。
  // 约定：所有语言都使用小写路由前缀（/en-us/、/zh-hans/），根路由 / 仅作为语言选择页。
  locales: {
    root: {
      label: 'Language',
      lang: 'en',
      link: '/en-us/',
    },
    'en-us': {
      label: 'English',
      lang: 'en-US',
      description: 'A modern acrylic glassmorphism Hugo theme',
      themeConfig: {
        editLink: {
          pattern: 'https://forgejo.alexma.top/tralume-org/hugo-theme/_edit/main/docs/content/:path',
        },
        nav: [
          { text: 'Home', link: '/en-us/' },
          { text: 'Quick Start', link: '/en-us/quick-start' },
        ],
        sidebar: [
          {
            text: 'Getting Started',
            items: [
              { text: 'Quick Start', link: '/en-us/quick-start' },
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
          { text: '快速开始', link: '/zh-hans/quick-start' },
        ],
        sidebar: [
          {
            text: '入门',
            items: [
              { text: '快速开始', link: '/zh-hans/quick-start' },
            ],
          },
        ],
      },
    },
  },

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    socialLinks: [
      { icon: 'forgejo', link: 'https://forgejo.alexma.top/tralume-org/hugo-theme' },
    ],
  },
})
