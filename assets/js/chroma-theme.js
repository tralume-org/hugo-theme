// 说明：根据当前主题模式切换 Chroma stylesheet，避免浅色/深色语法高亮 CSS 无条件双加载。
const chromaThemeStorageKey = 'tralume-theme-mode';

const getPreferredChromaTheme = (root, mediaQuery) => {
  const mode = root.getAttribute('data-theme-mode');
  if (mode === 'light' || mode === 'dark') {
    return mode;
  }
  return mediaQuery && mediaQuery.matches ? 'dark' : 'light';
};

const applyChromaTheme = (link, themeId, themes) => {
  const theme = themes && themes[themeId];
  if (!theme || !theme.href) {
    return;
  }

  // 说明：生产环境带 SRI，必须先更新 integrity，再替换 href，避免用旧 hash 校验新 CSS。
  if (theme.integrity) {
    link.setAttribute('integrity', theme.integrity);
    link.setAttribute('crossorigin', 'anonymous');
  } else {
    link.removeAttribute('integrity');
    link.removeAttribute('crossorigin');
  }

  if (link.getAttribute('href') !== theme.href) {
    link.setAttribute('href', theme.href);
  }

  link.setAttribute('data-chroma-theme', themeId);
};

export const setupChromaTheme = () => {
  const root = document.documentElement;
  const link = document.querySelector('[data-chroma-theme-stylesheet]');
  const themes = window.__tralumeChromaThemeStyles;

  if (!root || !link || !themes) {
    return;
  }

  const mediaQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  const syncChromaTheme = () => {
    applyChromaTheme(link, getPreferredChromaTheme(root, mediaQuery), themes);
  };

  syncChromaTheme();

  new MutationObserver((mutations) => {
    if (mutations.some((mutation) => mutation.attributeName === 'data-theme-mode')) {
      syncChromaTheme();
    }
  }).observe(root, {
    attributes: true,
    attributeFilter: ['data-theme-mode'],
  });

  if (mediaQuery && typeof mediaQuery.addEventListener === 'function') {
    mediaQuery.addEventListener('change', syncChromaTheme);
  } else if (mediaQuery && typeof mediaQuery.addListener === 'function') {
    mediaQuery.addListener(syncChromaTheme);
  }

  window.addEventListener('storage', (event) => {
    if (event.key === chromaThemeStorageKey) {
      syncChromaTheme();
    }
  });
};
