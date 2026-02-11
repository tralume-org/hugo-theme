import { defineConfig } from 'vitepress'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// 说明：文档站的线上根地址（同时用于 sitemap 与 canonical/hreflang）。
// 注意：不要以 / 结尾，避免出现双斜杠。
const SITE_URL = 'https://docs.tralume.org'

// 说明：从当前配置文件位置推导 docs 根目录，用于检查多语言页面是否存在。
const DOCS_ROOT_DIR = fileURLToPath(new URL('..', import.meta.url))
const CONTENT_DIR = path.join(DOCS_ROOT_DIR, 'content')

// 说明：把 markdown 的“文档相对路径”转换为站点 URL 路径。
// - index.md -> / 或 /foo/
// - other.md -> /other.html 或 /foo/bar.html
function docRelPathToUrlPath(docRelPath: string, routePrefix = '') {
  const normalized = docRelPath.replace(/\\/g, '/').replace(/^\/+/, '')
  const prefix = routePrefix ? `/${routePrefix.replace(/^\/+|\/+$/g, '')}` : ''

  if (normalized === 'index.md') return `${prefix}/`
  if (normalized.endsWith('/index.md')) {
    const dir = normalized.slice(0, -'/index.md'.length)
    return `${prefix}/${dir}/`
  }

  return `${prefix}/${normalized.replace(/\.md$/, '.html')}`
}

// 说明：从 pageData.relativePath 推导“当前语言”和“去语言前缀后的文档路径”。
function parseI18nRelativePath(relativePath: string) {
  const p = relativePath.replace(/\\/g, '/').replace(/^\/+/, '')

  if (p.startsWith('zh-hans/')) {
    return { localeKey: 'zh-hans', docRelPath: p.slice('zh-hans/'.length) }
  }

  // 说明：English 目录（en-us）通过 rewrites 映射到根路由；某些钩子里可能已被剥离前缀。
  if (p.startsWith('en-us/')) {
    return { localeKey: 'root', docRelPath: p.slice('en-us/'.length) }
  }

  return { localeKey: 'root', docRelPath: p }
}

// 说明：判断某语言版本的页面源文件是否存在，避免生成指向 404 的 hreflang。
function hasLocalePage(sourceDir: string, docRelPath: string) {
  return existsSync(path.join(CONTENT_DIR, sourceDir, docRelPath))
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: 'content',

  // 说明：为文档站生成 sitemap.xml（用于搜索引擎收录）。
  // 注意：hostname 必须是线上可访问的 docs 域名，否则生成的 URL 不正确。
  sitemap: {
    hostname: SITE_URL,
  },

  // 说明：为 docs 文档站注入 Umami 统计脚本。
  // 注意：使用 defer 避免阻塞首屏渲染；此配置对所有 locales 生效。
  head: [
    [
      'script',
      {
        defer: '',
        src: 'https://umami.alexma.top/script.js',
        'data-website-id': 'bf8787e9-d608-447c-a787-80535c42cb00',
      },
    ],
  ],

  title: 'Tralume',
  description: 'A modern acrylic glassmorphism Hugo theme',

  // 说明：为每个页面注入 canonical 与多语言 hreflang。
  // 注意：通过 frontmatter.head 注入，确保 dev 与 build 均生效。
  transformPageData(pageData, { siteConfig }) {
    const base = (siteConfig.site.base || '/').replace(/\/+$/, '/')
    const { localeKey, docRelPath } = parseI18nRelativePath(pageData.relativePath)

    // 说明：仅移除本配置生成的 link，避免误删手写的 head。
    pageData.frontmatter.head ??= []
    pageData.frontmatter.head = (pageData.frontmatter.head as any[]).filter((entry) => {
      return !(
        Array.isArray(entry) &&
        entry[0] === 'link' &&
        entry[1] &&
        typeof entry[1] === 'object' &&
        entry[1]['data-tralume-seo'] === '1'
      )
    })

    const urlPath = docRelPathToUrlPath(docRelPath, localeKey === 'zh-hans' ? 'zh-hans' : '')
    const canonicalUrl = `${SITE_URL}${base === '/' ? '' : base.replace(/\/+$/g, '')}${urlPath}`

    ;(pageData.frontmatter.head as any[]).push([
      'link',
      {
        rel: 'canonical',
        href: canonicalUrl,
        'data-tralume-seo': '1',
      },
    ])

    // 说明：仅在对应源文件存在时生成 hreflang。
    const enExists = hasLocalePage('en-us', docRelPath)
    const zhExists = hasLocalePage('zh-hans', docRelPath)
    const enUrl = enExists
      ? `${SITE_URL}${base === '/' ? '' : base.replace(/\/+$/g, '')}${docRelPathToUrlPath(docRelPath)}`
      : ''
    const zhUrl = zhExists
      ? `${SITE_URL}${base === '/' ? '' : base.replace(/\/+$/g, '')}${docRelPathToUrlPath(docRelPath, 'zh-hans')}`
      : ''

    if (enExists) {
      ;(pageData.frontmatter.head as any[]).push([
        'link',
        {
          rel: 'alternate',
          hreflang: 'en-US',
          href: enUrl,
          'data-tralume-seo': '1',
        },
      ])
      ;(pageData.frontmatter.head as any[]).push([
        'link',
        {
          rel: 'alternate',
          hreflang: 'x-default',
          href: enUrl,
          'data-tralume-seo': '1',
        },
      ])
    }

    if (zhExists) {
      ;(pageData.frontmatter.head as any[]).push([
        'link',
        {
          rel: 'alternate',
          hreflang: 'zh-Hans',
          href: zhUrl,
          'data-tralume-seo': '1',
        },
      ])
    }
  },

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
          { text: 'Config', link: '/config/' },
          { text: 'Quick Start', link: '/quick-start' },
          { text: 'Terminology', link: '/terminology' },
        ],
        sidebar: [
          {
            text: 'Getting Started',
            items: [
              { text: 'Quick Start', link: '/quick-start' },
              { text: 'Terminology', link: '/terminology' },
            ],
          },
          {
            text: 'Configuration',
            items: [
              { text: 'Overview', link: '/config/' },
              {
                text: 'Settings Panel',
                collapsed: true,
                items: [
                  { text: 'Theme Mode', link: '/config/appearance/theme-mode' },
                  { text: 'Acrylic Effect', link: '/config/appearance/acrylic' },
                  { text: 'Reading Width', link: '/config/appearance/reader-width' },
                  { text: 'Custom Background', link: '/config/appearance/background' },
                ],
              },
              { text: 'Site Info & SEO', link: '/config/site-info' },
              { text: 'Content Display & Summaries', link: '/config/content-display' },
              { text: 'Content License', link: '/config/license' },
              { text: 'RSS Visibility', link: '/config/rss' },
              { text: 'AI Contribution Marker', link: '/config/ai-marker' },
              { text: 'Edit this Page Link', link: '/config/edit-source' },
              { text: 'Custom Footer', link: '/config/footer' },
              { text: 'Analytics (Umami)', link: '/config/analytics' },
              { text: 'Friends Links', link: '/config/friends' },
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
          { text: '术语表', link: '/zh-hans/terminology' },
        ],
        sidebar: [
          {
            text: '入门',
            items: [
              { text: '快速开始', link: '/zh-hans/quick-start' },
              { text: '术语表', link: '/zh-hans/terminology' },
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
                  { text: '亚克力效果', link: '/zh-hans/config/appearance/acrylic' },
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
