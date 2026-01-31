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
        nav: [
          { text: 'Home', link: '/en-us/' },
          { text: 'Examples', link: '/en-us/markdown-examples' },
        ],
        sidebar: [
          {
            text: 'Examples',
            items: [
              { text: 'Markdown Examples', link: '/en-us/markdown-examples' },
              { text: 'Runtime API Examples', link: '/en-us/api-examples' },
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
        nav: [
          { text: '首页', link: '/zh-hans/' },
          { text: '示例', link: '/zh-hans/markdown-examples' },
        ],
        sidebar: [
          {
            text: '示例',
            items: [
              { text: 'Markdown 示例', link: '/zh-hans/markdown-examples' },
              { text: '运行时 API 示例', link: '/zh-hans/api-examples' },
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
