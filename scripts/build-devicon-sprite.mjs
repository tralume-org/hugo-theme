// 说明：生成 Devicon SVG sprite（单色版本）。
// 作用：从 devicons/devicon 仓库按需抓取少量 SVG，去除填充色后写入 Hugo partial，供 `<use>` 复用。
// 注意：
// 1) 这是“开发期工具脚本”，运行时需要联网；站点运行/构建不依赖联网。
// 2) 输出文件为 `layouts/partials/icons/devicon-sprite.html`，会被纳入仓库。
// 3) 单色实现策略：移除 `fill`/`stroke`/`style` 中的颜色声明，让图标继承 `currentColor`。

import { writeFile } from 'node:fs/promises';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

const DEVICON_BASE = 'https://raw.githubusercontent.com/devicons/devicon/master/icons';

// 说明：保持与 `assets/js/code-blocks.js` 的 resolveDeviconName 返回值一致。
const ICON_NAMES = [
  'bash',
  'c',
  'cplusplus',
  'csharp',
  'css3',
  'docker',
  'go',
  'graphql',
  'html5',
  'java',
  'javascript',
  'json',
  'kotlin',
  'markdown',
  'mysql',
  'nodejs',
  'php',
  'postgresql',
  'powershell',
  'python',
  'react',
  'ruby',
  'rust',
  'sqlite',
  'swift',
  'typescript',
  'vuejs',
  'yaml',
];

const candidatesFor = (name) => [
  `${name}-plain.svg`,
  `${name}-original.svg`,
  `${name}-plain-wordmark.svg`,
  `${name}-original-wordmark.svg`,
];

const fetchText = async (url) => {
  const res = await fetch(url, {
    headers: {
      // 说明：避免部分 CDN 误判为非浏览器请求。
      'User-Agent': 'tralume-devicon-sprite-builder',
    },
  });
  if (!res.ok) {
    throw new Error(`Fetch failed: ${res.status} ${res.statusText} (${url})`);
  }
  return await res.text();
};

const pickSvgSource = async (name) => {
  const base = `${DEVICON_BASE}/${name}`;
  for (const file of candidatesFor(name)) {
    const url = `${base}/${file}`;
    try {
      const svg = await fetchText(url);
      return { url, svg };
    } catch (error) {
      // 说明：逐个候选尝试，只有全部失败才报错。
    }
  }
  throw new Error(`No SVG found for ${name} under ${base}`);
};

const extractViewBox = (svg) => {
  const match = svg.match(/\bviewBox\s*=\s*"([^"]+)"/i);
  return match ? match[1] : '0 0 128 128';
};

const extractInner = (svg) => {
  const match = svg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
  return match ? match[1] : svg;
};

const stripColor = (content) => {
  // 说明：移除显式颜色/样式，让图标继承 `currentColor`。
  // 注意：这不是完整的 SVG sanitizer，但对 devicon 的 plain/original 图标足够。
  return content
    .replace(/\sfill\s*=\s*"[^"]*"/gi, '')
    .replace(/\sstroke\s*=\s*"[^"]*"/gi, '')
    .replace(/\sstroke-width\s*=\s*"[^"]*"/gi, '')
    .replace(/\sstyle\s*=\s*"[^"]*"/gi, '')
    .replace(/<defs[\s\S]*?<\/defs>/gi, '');
};

const buildSymbol = ({ name, viewBox, inner }) => {
  const cleaned = stripColor(inner).trim();
  return `  <symbol id="app-devicon-${name}" viewBox="${viewBox}">\n${cleaned}\n  </symbol>`;
};

const OUT_FILE = 'layouts/partials/icons/devicon-sprite.html';

const main = async () => {
  const symbols = [];
  const sources = [];

  for (const name of ICON_NAMES) {
    const { url, svg } = await pickSvgSource(name);
    const viewBox = extractViewBox(svg);
    const inner = extractInner(svg);
    symbols.push(buildSymbol({ name, viewBox, inner }));
    sources.push(`  - ${name}: ${url}`);
  }

  const output = [
    '{{/* 说明：Devicon SVG sprite（单色版，仅供代码块语言标识使用）。',
    '  - 作用：替代 Devicon 字体，避免字体基线/度量导致的对齐问题，并减少字体资源。',
    '  - 注意：symbol 内容由脚本批量生成；如需更新请运行：node scripts/build-devicon-sprite.mjs',
    '  - 来源：',
    ...sources,
    '*/}}',
    '',
    '<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true" focusable="false">',
    ...symbols,
    '</svg>',
    '',
  ].join('\n');

  await mkdir(dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, output, 'utf8');
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
