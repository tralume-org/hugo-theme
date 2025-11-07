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

  // 说明：自定义背景图逻辑，读取用户输入的图片 URL 并通过 CSS 变量注入伪元素。
  const backgroundInput = panel.querySelector('[data-background-input]');
  const backgroundApplyButton = panel.querySelector('[data-background-apply]');
  const backgroundResetButton = panel.querySelector('[data-background-reset]');
  const backgroundStorageKey = 'tralume-custom-background-url';
  let hasCustomBackground = false;

  const readBackgroundInputValue = () => {
    if (backgroundInput instanceof HTMLInputElement) {
      return backgroundInput.value.trim();
    }
    return '';
  };

  const updateBackgroundButtons = () => {
    const hasTypedValue = readBackgroundInputValue().length > 0;
    if (backgroundApplyButton instanceof HTMLButtonElement) {
      backgroundApplyButton.disabled = !(hasTypedValue || hasCustomBackground);
    }
    if (backgroundResetButton instanceof HTMLButtonElement) {
      backgroundResetButton.disabled = !hasCustomBackground;
    }
  };

  const persistBackgroundValue = (value) => {
    try {
      if (value) {
        window.localStorage.setItem(backgroundStorageKey, value);
      } else {
        window.localStorage.removeItem(backgroundStorageKey);
      }
    } catch (error) {
      // 说明：忽略本地存储失败，防止隐身模式报错。
    }
  };

  const readStoredBackgroundImage = () => {
    try {
      return window.localStorage.getItem(backgroundStorageKey);
    } catch (error) {
      return null;
    }
  };

  const applyBackgroundImage = (rawUrl, shouldPersist = true) => {
    const trimmed = typeof rawUrl === 'string' ? rawUrl.trim() : '';
    if (!trimmed) {
      root.style.setProperty('--app-custom-background-image', 'none');
      root.style.setProperty('--app-custom-background-opacity', '0');
      hasCustomBackground = false;
      if (shouldPersist) {
        persistBackgroundValue('');
      }
      updateBackgroundButtons();
      return;
    }

    const sanitized = JSON.stringify(trimmed);
    root.style.setProperty('--app-custom-background-image', `url(${sanitized})`);
    root.style.setProperty('--app-custom-background-opacity', '1');
    hasCustomBackground = true;
    if (shouldPersist) {
      persistBackgroundValue(trimmed);
    }
    updateBackgroundButtons();
  };

  const initialBackgroundImage = readStoredBackgroundImage() || '';
  if (backgroundInput instanceof HTMLInputElement) {
    backgroundInput.value = initialBackgroundImage;
  }
  applyBackgroundImage(initialBackgroundImage, false);
  updateBackgroundButtons();

  const handleBackgroundApply = () => {
    const nextValue = readBackgroundInputValue();
    applyBackgroundImage(nextValue, true);
  };

  if (backgroundApplyButton instanceof HTMLButtonElement) {
    backgroundApplyButton.addEventListener('click', handleBackgroundApply);
  }

  if (backgroundInput instanceof HTMLInputElement) {
    backgroundInput.addEventListener('input', () => {
      updateBackgroundButtons();
    });
    backgroundInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleBackgroundApply();
      }
    });
  }

  if (backgroundResetButton instanceof HTMLButtonElement) {
    backgroundResetButton.addEventListener('click', () => {
      if (backgroundInput instanceof HTMLInputElement) {
        backgroundInput.value = '';
      }
      applyBackgroundImage('', true);
    });
  }
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

// 说明：文章阅读增强逻辑，负责生成大纲、同步滚动高亮与阅读进度条。
const setupArticleOutline = () => {
  const root = document.querySelector('[data-article-root]');
  if (!root) {
    return;
  }

  const content = root.querySelector('[data-article-content]');
  const outline = root.querySelector('[data-article-outline]');
  const list = outline ? outline.querySelector('[data-article-outline-list]') : null;
  const emptyHint = outline ? outline.querySelector('[data-article-outline-empty]') : null;
  const layout = root.querySelector('[data-article-layout]');
  const progressHost = document.querySelector('[data-article-progress-floating]');
  const progressMeter = progressHost ? progressHost.querySelector('[data-article-progress-floating-meter]') : null;
  const progressLabel = progressHost ? progressHost.querySelector('[data-article-progress-floating-label]') : null;

  if (!content || !outline || !list || !progressMeter || !progressLabel) {
    return;
  }

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const lerp = (min, max, t) => min + (max - min) * t;

  let progressCircumference = 1;
  if (progressMeter instanceof SVGCircleElement) {
    const radius = progressMeter.r.baseVal.value || 16;
    progressCircumference = radius > 0 ? 2 * Math.PI * radius : 1;
    const dashArray = `${progressCircumference} ${progressCircumference}`;
    progressMeter.style.strokeDasharray = dashArray;
    progressMeter.style.strokeDashoffset = `${progressCircumference}`;
  }

  const headingElements = Array.from(content.querySelectorAll('h2, h3, h4, h5, h6')).filter(
    (heading) => heading instanceof HTMLElement
  );

  const normalizedHeadings = headingElements
    .map((heading, index) => {
      const level = Number.parseInt(heading.tagName.replace(/^H/i, ''), 10);
      const text = (heading.textContent || '').trim();
      if (!text) {
        return null;
      }

      if (!heading.id) {
        let baseSlug = text
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w\u4e00-\u9fff-]+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '');
        if (!baseSlug) {
          baseSlug = `section-${index + 1}`;
        }
        let candidate = baseSlug;
        let attempts = 1;
        while (document.getElementById(candidate)) {
          candidate = `${baseSlug}-${attempts++}`;
        }
        heading.id = candidate;
      }

      return {
        element: heading,
        id: heading.id,
        level: Number.isFinite(level) ? level : 2,
        text
      };
    })
    .filter(Boolean);

  let outlineEntries = [];
  const outlineHeader = outline.querySelector('.article__outline-header');
  const prefersReducedMotion =
    typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  const getScrollBehavior = () => (prefersReducedMotion && prefersReducedMotion.matches ? 'auto' : 'smooth');

  const readOutlineGap = () => {
    if (!(outline instanceof HTMLElement)) {
      return 0;
    }
    const styles = window.getComputedStyle(outline);
    const raw = styles.getPropertyValue('row-gap') || styles.getPropertyValue('gap') || '0';
    const parsed = Number.parseFloat(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const ensureOutlineVisibility = (link) => {
    if (!(outline instanceof HTMLElement) || !(link instanceof HTMLElement)) {
      return;
    }
    const headerHeight = outlineHeader instanceof HTMLElement ? outlineHeader.offsetHeight : 0;
    const outlineGap = readOutlineGap();
    const containerRect = outline.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    const padding = 12;
    const topBoundary = containerRect.top + headerHeight + outlineGap + padding;
    const bottomBoundary = containerRect.bottom - padding;

    if (linkRect.top < topBoundary || linkRect.bottom > bottomBoundary) {
      try {
        link.scrollIntoView({
          block: 'center',
          inline: 'nearest',
          behavior: getScrollBehavior()
        });
      } catch (error) {
        link.scrollIntoView(true);
      }
    }
  };

  if (normalizedHeadings.length) {
    if (layout) {
      layout.classList.remove('article__layout--single');
    }
    const baseLevel = normalizedHeadings.reduce(
      (min, item) => Math.min(min, item.level),
      normalizedHeadings[0].level
    );

    list.innerHTML = '';

    outlineEntries = normalizedHeadings.map((item) => {
      const listItem = document.createElement('li');
      listItem.className = 'article__outline-item';
      const relativeLevel = Math.max(item.level - baseLevel, 0);
      listItem.dataset.outlineLevel = String(relativeLevel);

      const link = document.createElement('a');
      link.className = 'article__outline-link';
      link.href = `#${item.id}`;
      link.textContent = item.text;

      listItem.appendChild(link);
      list.appendChild(listItem);

      return {
        element: item.element,
        id: item.id,
        link
      };
    });

    outline.setAttribute('data-outline-state', 'ready');
    if (emptyHint) {
      emptyHint.setAttribute('aria-hidden', 'true');
    }
  } else {
    outline.setAttribute('data-outline-state', 'hidden');
    if (layout) {
      layout.classList.add('article__layout--single');
    }
    if (progressHost instanceof HTMLElement) {
      progressHost.setAttribute('hidden', 'hidden');
    }
    return;
  }

  const applyAdaptiveSpacing = (count) => {
    const safeCount = Math.max(count, 1);
    const minCount = 4;
    const maxCount = 24;
    const normalized = clamp((safeCount - minCount) / (maxCount - minCount), 0, 1);
    const relaxed = 1 - normalized;

    const outlineFont = lerp(0.78, 0.92, relaxed);
    const outlineGap = lerp(0.55, 0.85, relaxed);
    const outlineItemGap = lerp(0.08, 0.2, relaxed);
    const outlinePaddingBlock = lerp(0.16, 0.26, relaxed);
    const outlinePaddingInline = lerp(0.38, 0.6, relaxed);
    const outlineLineHeight = outlineFont + lerp(0.28, 0.36, relaxed);

    const sectionGap = lerp(0.55, 1.0, relaxed);
    const headingMarginTop = lerp(0.85, 1.25, relaxed);
    const headingMarginBottom = lerp(0.24, 0.45, relaxed);
    const paragraphMargin = lerp(0.28, 0.45, relaxed);
    const dividerMargin = lerp(1.0, 1.6, relaxed);

    root.style.setProperty('--article-outline-font-size', `${outlineFont.toFixed(3)}rem`);
    root.style.setProperty('--article-outline-line-height', `${outlineLineHeight.toFixed(3)}rem`);
    root.style.setProperty('--article-outline-gap', `${outlineGap.toFixed(3)}rem`);
    root.style.setProperty('--article-outline-item-gap', `${outlineItemGap.toFixed(3)}rem`);
    root.style.setProperty('--article-outline-link-padding-block', `${outlinePaddingBlock.toFixed(3)}rem`);
    root.style.setProperty('--article-outline-link-padding-inline', `${outlinePaddingInline.toFixed(3)}rem`);
    root.style.setProperty('--article-section-gap', `${sectionGap.toFixed(3)}rem`);
    root.style.setProperty('--article-heading-margin-top', `${headingMarginTop.toFixed(3)}rem`);
    root.style.setProperty('--article-heading-margin-bottom', `${headingMarginBottom.toFixed(3)}rem`);
    root.style.setProperty('--article-paragraph-margin', `${paragraphMargin.toFixed(3)}rem`);
    root.style.setProperty('--article-divider-margin', `${dividerMargin.toFixed(3)}rem`);
  };

  applyAdaptiveSpacing(normalizedHeadings.length);

  const applyProgressVisuals = (value) => {
    const safeValue = clamp(value, 0, 1);
    const percent = Math.round(safeValue * 100);
    progressLabel.textContent = `${percent}%`;
    if (progressMeter instanceof SVGCircleElement) {
      const offset = progressCircumference * (1 - safeValue);
      progressMeter.style.strokeDashoffset = `${offset}`;
    }

    if (progressHost instanceof HTMLElement) {
      progressHost.setAttribute('aria-valuenow', String(percent));
      if (percent > 0) {
        progressHost.removeAttribute('hidden');
      } else {
        progressHost.setAttribute('hidden', 'hidden');
      }
    }
  };

  applyProgressVisuals(0);

  let activeId = '';

  // 说明：同步激活态样式，保证仅一个标题高亮，同时保持大纲视窗内可见。
  const applyActiveId = (nextId) => {
    if (!outlineEntries.length || !nextId) {
      return;
    }
    activeId = nextId;
    let activeEntry = null;
    outlineEntries.forEach((entry) => {
      const isActive = entry.id === activeId;
      entry.link.classList.toggle('is-active', isActive);
      if (isActive) {
        activeEntry = entry;
      }
    });

    if (activeEntry) {
      ensureOutlineVisibility(activeEntry.link);
    }
  };

  const metrics = {
    contentTop: 0,
    contentBottom: 0,
    totalScrollable: 1,
    headingOffsets: []
  };

  // 说明：重新计算内容高度与各标题的绝对位置，便于滚动时高亮准确。
  const recalcMetrics = () => {
    const contentRect = content.getBoundingClientRect();
    metrics.contentTop = contentRect.top + window.scrollY;
    metrics.contentBottom = metrics.contentTop + content.scrollHeight;
    metrics.headingOffsets = outlineEntries.map((entry) => {
      const rect = entry.element.getBoundingClientRect();
      return rect.top + window.scrollY;
    });

    const rawScrollable = metrics.contentBottom - metrics.contentTop - window.innerHeight;
    metrics.totalScrollable = rawScrollable > 0 ? rawScrollable : 1;
  };

  // 说明：根据滚动位置更新进度条宽度与无障碍信息。
  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const reachedBottom = scrollTop + window.innerHeight >= metrics.contentBottom - 1;
    let progressValue = 0;

    if (metrics.contentBottom - metrics.contentTop <= window.innerHeight) {
      progressValue = scrollTop >= metrics.contentTop ? 1 : 0;
    } else if (reachedBottom) {
      progressValue = 1;
    } else {
      progressValue = clamp(
        (scrollTop - metrics.contentTop) / metrics.totalScrollable,
        0,
        1
      );
    }

    applyProgressVisuals(progressValue);
  };

  // 说明：定位当前视口内最接近的标题，驱动大纲高亮。
  const updateActiveHeading = () => {
    if (!outlineEntries.length) {
      return;
    }

    const scrollTop = window.scrollY;
    const viewportHeight = window.innerHeight;
    const anchorLine = scrollTop + viewportHeight * 0.3;
    const offsets = metrics.headingOffsets;

    let nextActiveId = outlineEntries[0].id;

    for (let index = 0; index < offsets.length; index += 1) {
      if (anchorLine >= offsets[index] - 1) {
        nextActiveId = outlineEntries[index].id;
      } else {
        break;
      }
    }

    if (scrollTop + viewportHeight >= metrics.contentBottom - 1) {
      nextActiveId = outlineEntries[outlineEntries.length - 1].id;
    }

    applyActiveId(nextActiveId);
  };

  let ticking = false;

  // 说明：滚动与进度更新节流，避免频繁计算。
  const handleScroll = () => {
    if (ticking) {
      return;
    }
    ticking = true;
    window.requestAnimationFrame(() => {
      updateProgress();
      updateActiveHeading();
      ticking = false;
    });
  };

  const syncLayouts = () => {
    recalcMetrics();
    updateProgress();
    updateActiveHeading();
  };

  syncLayouts();

  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', () => {
    syncLayouts();
  });
  window.addEventListener('load', () => {
    syncLayouts();
  });

  const mediaNodes = Array.from(content.querySelectorAll('img, video, iframe'));
  mediaNodes.forEach((node) => {
    node.addEventListener('load', syncLayouts, { once: true });
  });

  outlineEntries.forEach((entry) => {
    entry.link.addEventListener('focus', () => {
      applyActiveId(entry.id);
    });
  });

  if (progressHost instanceof HTMLElement) {
    progressHost.addEventListener('click', () => {
      const behavior = prefersReducedMotion && prefersReducedMotion.matches ? 'auto' : 'smooth';
      window.scrollTo({ top: 0, left: 0, behavior });
    });
  }
};

// 说明：集中触发初始化逻辑，确保各个组件在 DOM 就绪后挂载事件。
const bootstrap = () => {
  setupAppNavigation();
  setupSettingsPanel();
  setupCodeBlocks();
  setupArticleOutline();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
