// 说明：控制主导航在小屏幕下的折叠/展开行为，保持键盘与触控可用性。
const setupAppNavigation = () => {
  const navRoot = document.querySelector('[data-app-nav]');
  if (!navRoot) {
    return;
  }

  const toggle = navRoot.querySelector('[data-app-nav-toggle]');
  const list = navRoot.querySelector('[data-app-nav-list]');
  if (!toggle || !list) {
    return;
  }

  const desktopQuery = window.matchMedia('(min-width: 48rem)');
  let isOpen = false;

  // 说明：挂载 data-nav-ready 属性以便样式只在脚本完成初始化后生效。
  navRoot.setAttribute('data-nav-ready', 'true');

  const closeNav = ({ focusToggle = false } = {}) => {
    if (isOpen) {
      isOpen = false;
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('pointerdown', handlePointerDown);
    }

    list.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');

    if (desktopQuery.matches) {
      list.setAttribute('aria-hidden', 'false');
    } else {
      list.setAttribute('aria-hidden', 'true');
    }

    if (focusToggle) {
      window.requestAnimationFrame(() => {
        toggle.focus({ preventScroll: true });
      });
    }
  };

  const openNav = () => {
    if (desktopQuery.matches || isOpen) {
      return;
    }

    isOpen = true;
    list.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    list.setAttribute('aria-hidden', 'false');

    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('pointerdown', handlePointerDown);
  };

  // 说明：Esc 键关闭折叠菜单，并将焦点返回到触发按钮。
  const handleKeydown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeNav({ focusToggle: true });
    }
  };

  // 说明：点击导航外部区域时自动收起菜单。
  const handlePointerDown = (event) => {
    const path = typeof event.composedPath === 'function' ? event.composedPath() : [];
    if (!path.includes(navRoot) && !navRoot.contains(event.target)) {
      closeNav();
    }
  };

  // 说明：按钮点击时在展开与收起之间切换。
  toggle.addEventListener('click', () => {
    if (isOpen) {
      closeNav();
    } else {
      openNav();
    }
  });

  // 说明：点击导航链接后自动收起，避免遮挡内容。
  list.addEventListener('click', (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.matches('a')) {
      closeNav();
    }
  });

  // 说明：屏幕尺寸变化时同步适配状态。
  const handleMediaChange = (event) => {
    if (event.matches) {
      closeNav();
      list.setAttribute('aria-hidden', 'false');
    } else if (!isOpen) {
      list.setAttribute('aria-hidden', 'true');
    }
  };

  desktopQuery.addEventListener('change', handleMediaChange);

  if (desktopQuery.matches) {
    list.setAttribute('aria-hidden', 'false');
  } else {
    list.setAttribute('aria-hidden', 'true');
  }
};

// 说明：封装设置面板交互逻辑，确保按钮与卡片之间状态同步。
const setupSettingsPanel = () => {
  const panel = document.querySelector('[data-component="settings-panel"]');
  if (!panel) {
    return;
  }

  const toggleButton = panel.querySelector('[data-settings-toggle]');
  const surface = panel.querySelector('[data-settings-surface]');
  const closeButton = panel.querySelector('[data-settings-close]');

  if (!toggleButton || !surface || !closeButton) {
    return;
  }

  let isOpen = false;

  // 说明：打开面板后允许 Esc 和点击外部关闭，聚焦卡片内容以支持键盘操作。
  const openPanel = () => {
    if (isOpen) return;

    isOpen = true;
    panel.classList.add('is-open');
    toggleButton.setAttribute('aria-expanded', 'true');
    surface.setAttribute('aria-hidden', 'false');

    window.requestAnimationFrame(() => {
      if (closeButton instanceof HTMLElement) {
        closeButton.focus({ preventScroll: true });
      } else {
        surface.focus({ preventScroll: true });
      }
    });

    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('pointerdown', handlePointerDown);
  };

  // 说明：关闭面板后撤销事件监听，并将焦点归还触发按钮。
  const closePanel = () => {
    if (!isOpen) return;

    isOpen = false;
    panel.classList.remove('is-open');
    toggleButton.setAttribute('aria-expanded', 'false');
    surface.setAttribute('aria-hidden', 'true');

    document.removeEventListener('keydown', handleKeydown);
    document.removeEventListener('pointerdown', handlePointerDown);

    window.requestAnimationFrame(() => {
      toggleButton.focus({ preventScroll: true });
    });
  };

  // 说明：监听 Esc 键关闭卡片。
  const handleKeydown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closePanel();
    }
  };

  // 说明：点击卡片外任意区域时关闭。
  const handlePointerDown = (event) => {
    const path = event.composedPath ? event.composedPath() : [event.target];
    if (!path.includes(panel) && !panel.contains(event.target)) {
      closePanel();
    }
  };

  toggleButton.addEventListener('click', openPanel);
  closeButton.addEventListener('click', closePanel);

  // 说明：语言下拉选单切换后立即跳转至目标页面。
  const languageSelect = panel.querySelector('[data-language-select]');
  if (languageSelect instanceof HTMLSelectElement) {
    languageSelect.addEventListener('change', (event) => {
      const target = event.target;
      if (target instanceof HTMLSelectElement) {
        const destination = target.value;
        if (destination) {
          window.location.href = destination;
        }
      }
    });
  }

  // 说明：主题颜色按钮组，切换后更新根节点属性并持久化本地偏好。
  const colorSwatches = Array.from(panel.querySelectorAll('[data-color-option]'));
  const colorStorageKey = 'tralume-theme-color';
  const root = document.documentElement;

  const updateSwatchState = (activeId) => {
    colorSwatches.forEach((swatch) => {
      const swatchId = swatch.getAttribute('data-color-option');
      const isActive = Boolean(swatchId && swatchId === activeId);
      swatch.classList.toggle('is-active', isActive);
      swatch.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  };

  const applyThemeColor = (colorId, shouldPersist = true) => {
    if (!colorId) {
      return;
    }
    root.setAttribute('data-theme-color', colorId);
    updateSwatchState(colorId);
    if (shouldPersist) {
      try {
        window.localStorage.setItem(colorStorageKey, colorId);
      } catch (error) {
        // 说明：忽略存储失败，避免在受限环境下抛出异常。
      }
    }
  };

  const readStoredThemeColor = () => {
    try {
      return window.localStorage.getItem(colorStorageKey);
    } catch (error) {
      return null;
    }
  };

  const initialThemeColor = readStoredThemeColor() || root.getAttribute('data-theme-color') || 'indigo';
  applyThemeColor(initialThemeColor, false);

  colorSwatches.forEach((swatch) => {
    swatch.addEventListener('click', () => {
      const colorId = swatch.getAttribute('data-color-option');
      if (colorId) {
        applyThemeColor(colorId, true);
      }
    });
  });

  // 说明：主题模式按钮组，允许在自动、浅色与深色之间切换。
  const modeButtons = Array.from(panel.querySelectorAll('[data-theme-mode-option]'));
  const modeStorageKey = 'tralume-theme-mode';
  const supportedModes = new Set(['auto', 'light', 'dark']);

  const updateModeState = (activeId) => {
    modeButtons.forEach((button) => {
      const modeId = button.getAttribute('data-theme-mode-option');
      const isActive = Boolean(modeId && modeId === activeId);
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  };

  const applyThemeMode = (modeId, shouldPersist = true) => {
    const finalMode = supportedModes.has(modeId) ? modeId : 'auto';
    if (finalMode === 'auto') {
      root.removeAttribute('data-theme-mode');
    } else {
      root.setAttribute('data-theme-mode', finalMode);
    }
    updateModeState(finalMode);

    if (shouldPersist) {
      try {
        window.localStorage.setItem(modeStorageKey, finalMode);
      } catch (error) {
        // 说明：忽略存储异常，保障功能在受限环境继续运行。
      }
    }
  };

  const readStoredThemeMode = () => {
    try {
      return window.localStorage.getItem(modeStorageKey);
    } catch (error) {
      return null;
    }
  };

  const initialThemeMode = readStoredThemeMode() || root.getAttribute('data-theme-mode') || 'auto';
  applyThemeMode(initialThemeMode, false);

  modeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const modeId = button.getAttribute('data-theme-mode-option');
      applyThemeMode(modeId, true);
    });
  });
};

// 说明：Markdown 代码块增强逻辑，负责构建 MD3 外观并注入复制按钮。
const setupCodeBlocks = () => {
  const container = document.querySelector('#main-content');
  if (!container) {
    return;
  }

  const copyLabel = container.getAttribute('data-code-copy-label') || 'Copy code';
  const copiedLabel = container.getAttribute('data-code-copied-label') || 'Copied';

  // 说明：从 code 元素的类名或 data-lang 属性中解析语言名称。
  const readLanguage = (codeElement) => {
    if (!(codeElement instanceof HTMLElement)) {
      return '';
    }
    const direct = codeElement.getAttribute('data-lang');
    if (direct) {
      return direct;
    }
    const classList = (codeElement.className || '').split(/\s+/);
    const languageClass = classList.find((item) => item.startsWith('language-') || item.startsWith('lang-'));
    if (!languageClass) {
      return '';
    }
    return languageClass.replace(/^language-/, '').replace(/^lang-/, '');
  };

  // 说明：语言名称做简单格式化，避免全小写影响可读性。
  const formatLanguage = (raw) => {
    if (!raw) {
      return '';
    }
    const trimmed = raw.trim();
    if (trimmed.length <= 3) {
      return trimmed.toUpperCase();
    }
    if (trimmed.includes('-') || trimmed.includes('_')) {
      return trimmed
        .split(/[-_]/g)
        .map((segment) => segment ? segment[0].toUpperCase() + segment.slice(1).toLowerCase() : segment)
        .join(' ');
    }
    return trimmed[0].toUpperCase() + trimmed.slice(1);
  };

  // 说明：复制逻辑同时支持 Clipboard API 与传统命令，提升兼容性。
  const copyText = async (text) => {
    if (!text) {
      return false;
    }
    const normalized = text.replace(/\u00A0/g, ' ');
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(normalized);
        return true;
      }
    } catch (error) {
      // 说明：忽略 Clipboard API 的失败，继续尝试后备方案。
    }

    const textarea = document.createElement('textarea');
    textarea.value = normalized;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    document.body.appendChild(textarea);
    textarea.select();
    let succeeded = false;
    try {
      succeeded = document.execCommand('copy');
    } catch (error) {
      succeeded = false;
    }
    textarea.remove();
    return succeeded;
  };

  // 说明：构建复制按钮并绑定状态更新。
  const createCopyButton = (codeElement) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'md3-code-block__copy-button';
    button.dataset.copyLabel = copyLabel;
    button.dataset.copiedLabel = copiedLabel;
    button.textContent = copyLabel;
    button.title = copyLabel;
    button.setAttribute('aria-label', copyLabel);

    let revertTimer = 0;
    const resetState = () => {
      button.classList.remove('is-copied');
      button.textContent = copyLabel;
      button.title = copyLabel;
      button.setAttribute('aria-label', copyLabel);
    };

    button.addEventListener('click', async () => {
      if (codeElement instanceof HTMLElement) {
        const text = codeElement.textContent || '';
        const success = await copyText(text);
        window.clearTimeout(revertTimer);
        if (success) {
          button.classList.add('is-copied');
          button.textContent = copiedLabel;
          button.title = copiedLabel;
          button.setAttribute('aria-label', copiedLabel);
          revertTimer = window.setTimeout(resetState, 2000);
        } else {
          resetState();
        }
      }
    });

    return button;
  };

  // 说明：统一构建代码块的 DOM 结构。
  const buildCodeBlock = (preElement, mountTarget) => {
    if (!(preElement instanceof HTMLElement)) {
      return;
    }
    if (preElement.dataset.md3CodeProcessed === 'true') {
      return;
    }

    const codeElement = preElement.querySelector('code') || preElement;
    const language = formatLanguage(readLanguage(codeElement));

    const wrapper = document.createElement('div');
    wrapper.className = 'md3-code-block';
    wrapper.setAttribute('data-md3-code-block', 'true');

    const toolbar = document.createElement('div');
    toolbar.className = 'md3-code-block__toolbar';

    if (language) {
      const badge = document.createElement('span');
      badge.className = 'md3-code-block__language';
      badge.textContent = language;
      toolbar.appendChild(badge);
    }

    const copyButton = createCopyButton(codeElement);
    toolbar.appendChild(copyButton);

    const body = document.createElement('div');
    body.className = 'md3-code-block__body';

    const originalParent = preElement.parentElement;
    const referenceNode = preElement.nextSibling;

    body.appendChild(preElement);
    wrapper.appendChild(toolbar);
    wrapper.appendChild(body);

    preElement.dataset.md3CodeProcessed = 'true';

    if (mountTarget && mountTarget !== preElement && mountTarget.parentElement) {
      mountTarget.replaceWith(wrapper);
    } else if (originalParent) {
      originalParent.insertBefore(wrapper, referenceNode);
    }
  };

  const highlightBlocks = Array.from(container.querySelectorAll('.highlight'));
  highlightBlocks.forEach((highlight) => {
    const preElement = highlight.querySelector('pre');
    if (preElement) {
      buildCodeBlock(preElement, highlight);
    }
  });

  const loosePreBlocks = Array.from(container.querySelectorAll('pre')).filter((preElement) => {
    if (!(preElement instanceof HTMLElement)) {
      return false;
    }
    if (preElement.dataset.md3CodeProcessed === 'true') {
      return false;
    }
    if (preElement.closest('.md3-code-block')) {
      return false;
    }
    return true;
  });

  loosePreBlocks.forEach((preElement) => {
    buildCodeBlock(preElement, null);
  });
};

// 说明：集中触发初始化逻辑，确保各个组件在 DOM 就绪后挂载事件。
const bootstrap = () => {
  setupAppNavigation();
  setupSettingsPanel();
  setupCodeBlocks();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
