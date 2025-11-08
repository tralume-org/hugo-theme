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

  const root = document.documentElement;
  const systemDarkQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const dynamicColorTokens = [
    '--md-sys-color-primary',
    '--md-sys-color-on-primary',
    '--md-sys-color-primary-container',
    '--md-sys-color-on-primary-container',
    '--md-sys-color-secondary',
    '--md-sys-color-on-secondary',
    '--md-sys-color-secondary-container',
    '--md-sys-color-on-secondary-container',
    '--md-sys-color-surface',
    '--md-sys-color-surface-dim',
    '--md-sys-color-surface-bright',
    '--md-sys-color-on-surface',
    '--md-sys-color-on-surface-variant',
    '--md-sys-color-background',
    '--md-sys-color-on-background',
    '--md-sys-color-outline',
    '--md-sys-color-outline-variant',
    '--md-sys-color-surface-container-lowest',
    '--md-sys-color-surface-container-low',
    '--md-sys-color-surface-container',
    '--md-sys-color-surface-container-high',
    '--md-sys-color-surface-container-highest',
  ];
  let isDynamicColorEnabled = false;
  let currentDynamicPalette = null;
  let dynamicColorTaskId = 0;
  let hasCustomBackground = false;
  let currentBackgroundValue = '';

  const resolveIsDarkMode = () => {
    const modeAttr = root.getAttribute('data-theme-mode');
    if (modeAttr === 'dark') {
      return true;
    }
    if (modeAttr === 'light') {
      return false;
    }
    return systemDarkQuery.matches;
  };

  const applyDynamicPaletteOverrides = (palette) => {
    if (!palette) {
      return;
    }
    const target = resolveIsDarkMode() ? palette.dark : palette.light;
    if (!target) {
      return;
    }
    dynamicColorTokens.forEach((token) => {
      if (typeof target[token] === 'string') {
        root.style.setProperty(token, target[token]);
      }
    });
    root.setAttribute('data-dynamic-colors', 'active');
    if (typeof palette.seed === 'string') {
      root.style.setProperty('--app-dynamic-seed-color', palette.seed);
    }
  };

  const clearDynamicPaletteOverrides = () => {
    dynamicColorTokens.forEach((token) => {
      root.style.removeProperty(token);
    });
    root.removeAttribute('data-dynamic-colors');
    root.style.removeProperty('--app-dynamic-seed-color');
  };

  const reapplyDynamicColorsIfNeeded = () => {
    if (isDynamicColorEnabled && currentDynamicPalette) {
      applyDynamicPaletteOverrides(currentDynamicPalette);
    }
  };

  const handleSystemModeChange = () => {
    const modeAttr = root.getAttribute('data-theme-mode');
    if (!modeAttr || modeAttr === 'auto') {
      reapplyDynamicColorsIfNeeded();
    }
  };

  if (systemDarkQuery) {
    if (typeof systemDarkQuery.addEventListener === 'function') {
      systemDarkQuery.addEventListener('change', handleSystemModeChange);
    } else if (typeof systemDarkQuery.addListener === 'function') {
      systemDarkQuery.addListener(handleSystemModeChange);
    }
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

  const setColorSwatchesDisabled = (shouldDisable) => {
    colorSwatches.forEach((swatch) => {
      if (swatch instanceof HTMLButtonElement) {
        swatch.disabled = shouldDisable;
        swatch.setAttribute('aria-disabled', shouldDisable ? 'true' : 'false');
      }
    });
  };

  const syncColorInterlocks = () => {
    setColorSwatchesDisabled(isDynamicColorEnabled && hasCustomBackground);
  };

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
  syncColorInterlocks();

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
    reapplyDynamicColorsIfNeeded();

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

  // 说明：玻璃效果滑动块，支持更宽透明度范围，并允许一键恢复或彻底关闭。
  const glassRange = panel.querySelector('[data-glass-strength-range]');
  const glassValueLabel = panel.querySelector('[data-glass-strength-label]');
  const glassResetButton = panel.querySelector('[data-glass-reset]');
  const glassDisableToggle = panel.querySelector('[data-glass-disable]');
  const glassStorageKey = 'tralume-glass-strength';
  const glassDisabledStorageKey = 'tralume-glass-disabled';
  const defaultGlassValue = 45;
  const defaultBlurRadius = '24px';
  const disabledBlurRadius = '0px';
  const presetGlassValues = new Map([
    ['soft', 45],
    ['balanced', 65],
    ['bold', 80],
  ]);

  const clampNumber = (value, min, max) => {
    if (!Number.isFinite(value)) {
      return min;
    }
    return Math.max(min, Math.min(max, value));
  };

  if (glassRange instanceof HTMLInputElement) {
    const sliderMin = Number.isFinite(Number(glassRange.min)) ? Number(glassRange.min) : 15;
    const sliderMax = Number.isFinite(Number(glassRange.max)) ? Number(glassRange.max) : 95;
    let currentGlassValue = defaultGlassValue;
    let glassDisabled = false;

    const updateLabel = (value) => {
      if (glassValueLabel) {
        glassValueLabel.textContent = `${value}%`;
      }
      glassRange.setAttribute('aria-valuenow', String(value));
    };

    const applyGlassVariables = (baseValue) => {
      const surface = baseValue;
      const elevated = clampNumber(baseValue + 8, sliderMin, 96);
      const strong = clampNumber(baseValue + 16, sliderMin, 99);
      const border = clampNumber(baseValue - 18, 10, 85);
      const borderStrong = clampNumber(baseValue - 6, 20, 90);
      root.style.setProperty('--app-glass-surface-alpha', `${surface}%`);
      root.style.setProperty('--app-glass-elevated-alpha', `${elevated}%`);
      root.style.setProperty('--app-glass-strong-alpha', `${strong}%`);
      root.style.setProperty('--app-glass-border-alpha', `${border}%`);
      root.style.setProperty('--app-glass-border-strong-alpha', `${borderStrong}%`);
      root.style.setProperty('--app-glass-blur-radius', defaultBlurRadius);
    };

    const applyDisabledVisuals = () => {
      root.style.setProperty('--app-glass-surface-alpha', '100%');
      root.style.setProperty('--app-glass-elevated-alpha', '100%');
      root.style.setProperty('--app-glass-strong-alpha', '100%');
      root.style.setProperty('--app-glass-border-alpha', '70%');
      root.style.setProperty('--app-glass-border-strong-alpha', '85%');
      root.style.setProperty('--app-glass-blur-radius', disabledBlurRadius);
    };

    const persistGlassValue = (value) => {
      try {
        window.localStorage.setItem(glassStorageKey, String(value));
      } catch (error) {
        // 说明：忽略存储异常，避免影响交互。
      }
    };

    const persistGlassDisabledState = (isDisabled) => {
      try {
        if (isDisabled) {
          window.localStorage.setItem(glassDisabledStorageKey, '1');
        } else {
          window.localStorage.removeItem(glassDisabledStorageKey);
        }
      } catch (error) {
        // 说明：忽略存储异常，避免影响交互。
      }
    };

    const readStoredGlassValue = () => {
      try {
        const stored = window.localStorage.getItem(glassStorageKey);
        if (stored) {
          const parsed = parseFloat(stored);
          if (!Number.isNaN(parsed)) {
            return parsed;
          }
        }
      } catch (error) {
        return null;
      }
      return null;
    };

    const readStoredGlassDisabled = () => {
      try {
        return window.localStorage.getItem(glassDisabledStorageKey) === '1';
      } catch (error) {
        return false;
      }
    };

    const resolveInitialGlassValue = () => {
      const stored = readStoredGlassValue();
      if (stored !== null) {
        return clampNumber(stored, sliderMin, sliderMax);
      }
      const preset = presetGlassValues.get(root.getAttribute('data-glass-strength') || '');
      if (typeof preset === 'number') {
        return preset;
      }
      const inputValue = parseFloat(glassRange.value);
      if (!Number.isNaN(inputValue)) {
        return clampNumber(inputValue, sliderMin, sliderMax);
      }
      return defaultGlassValue;
    };

    const applyGlassStrength = (value, shouldPersist = false) => {
      const base = clampNumber(value, sliderMin, sliderMax);
      currentGlassValue = base;
      if (!glassDisabled) {
        applyGlassVariables(base);
      }
      updateLabel(base);
      glassRange.value = String(base);
      if (shouldPersist) {
        persistGlassValue(base);
      }
    };

    const setGlassDisabled = (isDisabled, shouldPersist = true) => {
      glassDisabled = isDisabled;
      if (glassDisableToggle instanceof HTMLInputElement) {
        glassDisableToggle.checked = isDisabled;
        glassDisableToggle.setAttribute('aria-checked', isDisabled ? 'true' : 'false');
      }
      if (glassRange instanceof HTMLInputElement) {
        glassRange.disabled = isDisabled;
        glassRange.setAttribute('aria-disabled', isDisabled ? 'true' : 'false');
      }
      if (glassResetButton instanceof HTMLButtonElement) {
        glassResetButton.disabled = isDisabled;
      }
      if (isDisabled) {
        root.setAttribute('data-glass-disabled', 'true');
        applyDisabledVisuals();
      } else {
        root.removeAttribute('data-glass-disabled');
        applyGlassStrength(currentGlassValue, false);
      }
      if (shouldPersist) {
        persistGlassDisabledState(isDisabled);
      }
    };

    const initialGlassValue = resolveInitialGlassValue();
    applyGlassStrength(initialGlassValue, false);
    const initialDisabledState = readStoredGlassDisabled();
    setGlassDisabled(initialDisabledState, false);

    glassRange.addEventListener('input', (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement) {
        const value = parseFloat(target.value);
        applyGlassStrength(value, false);
      }
    });

    glassRange.addEventListener('change', (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement) {
        const value = parseFloat(target.value);
        applyGlassStrength(value, true);
      }
    });

    if (glassResetButton instanceof HTMLButtonElement) {
      glassResetButton.addEventListener('click', () => {
        applyGlassStrength(defaultGlassValue, true);
      });
    }

    if (glassDisableToggle instanceof HTMLInputElement) {
      glassDisableToggle.addEventListener('change', (event) => {
        const target = event.target;
        if (target instanceof HTMLInputElement) {
          setGlassDisabled(Boolean(target.checked), true);
        }
      });
    }
  }

  // 说明：阅读器宽度滑动条，提供更细腻的 rem 范围并持久化偏好。
  const readerWidthRange = panel.querySelector('[data-reader-width-range]');
  const readerWidthRemNode = panel.querySelector('[data-reader-width-rem]');
  const readerWidthPxNode = panel.querySelector('[data-reader-width-px]');
  const readerWidthStorageKey = 'tralume-reader-width';
  const readerWidthPresets = new Map([
    ['compact', 56],
    ['balanced', 64],
    ['wide', 80],
  ]);

  const defaultReaderBounds = { min: 52, max: 104 };
  const readerWidthBounds = {
    min: readerWidthRange instanceof HTMLInputElement ? Number.parseFloat(readerWidthRange.min) || defaultReaderBounds.min : defaultReaderBounds.min,
    max: readerWidthRange instanceof HTMLInputElement ? Number.parseFloat(readerWidthRange.max) || defaultReaderBounds.max : defaultReaderBounds.max,
  };

  const clampReaderWidth = (value) => {
    const safe = Number.isFinite(value) ? value : defaultReaderBounds.max;
    return Math.min(readerWidthBounds.max, Math.max(readerWidthBounds.min, safe));
  };

  const persistReaderWidth = (value) => {
    try {
      window.localStorage.setItem(readerWidthStorageKey, String(value));
    } catch (error) {
      // 说明：忽略本地存储失败，避免阻断交互。
    }
  };

  const readStoredReaderWidth = () => {
    try {
      const stored = window.localStorage.getItem(readerWidthStorageKey);
      if (stored) {
        const parsed = Number.parseFloat(stored);
        if (Number.isFinite(parsed)) {
          return parsed;
        }
      }
    } catch (error) {
      return null;
    }
    return null;
  };

  const resolveDefaultReaderWidth = () => {
    const presetAttr = root.getAttribute('data-reader-width');
    if (presetAttr && readerWidthPresets.has(presetAttr)) {
      return readerWidthPresets.get(presetAttr);
    }
    const explicitDefault = Number.parseFloat(root.getAttribute('data-reader-width-default') || '');
    if (Number.isFinite(explicitDefault)) {
      return explicitDefault;
    }
    return 64;
  };

  const updateReaderValueLabel = (value) => {
    if (readerWidthRemNode instanceof HTMLElement) {
      readerWidthRemNode.textContent = String(Math.round(value));
    }
    if (readerWidthPxNode instanceof HTMLElement) {
      const pxValue = Math.round(value * 16);
      readerWidthPxNode.textContent = String(pxValue);
    }
  };

  const applyReaderWidth = (value, shouldPersist = true) => {
    const nextValue = clampReaderWidth(value);
    root.style.setProperty('--reader-width-max', `${nextValue}rem`);
    if (readerWidthRange instanceof HTMLInputElement) {
      readerWidthRange.value = String(nextValue);
      readerWidthRange.setAttribute('aria-valuenow', String(Math.round(nextValue)));
    }
    updateReaderValueLabel(nextValue);
    if (shouldPersist) {
      persistReaderWidth(nextValue);
    }
  };

  const storedReaderWidth = readStoredReaderWidth();
  const initialReaderWidth = typeof storedReaderWidth === 'number' ? storedReaderWidth : resolveDefaultReaderWidth();
  applyReaderWidth(initialReaderWidth, false);

  if (readerWidthRange instanceof HTMLInputElement) {
    readerWidthRange.addEventListener('input', (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement) {
        const value = Number.parseFloat(target.value);
        applyReaderWidth(value, false);
      }
    });
    readerWidthRange.addEventListener('change', (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement) {
        const value = Number.parseFloat(target.value);
        applyReaderWidth(value, true);
      }
    });
  }

  // 说明：自定义背景图逻辑，读取用户输入的图片 URL，并在需要时触发动态配色。
  const backgroundInput = panel.querySelector('[data-background-input]');
  const backgroundApplyButton = panel.querySelector('[data-background-apply]');
  const backgroundResetButton = panel.querySelector('[data-background-reset]');
  const backgroundColorToggle = panel.querySelector('[data-background-colors-toggle]');
  const backgroundColorStatus = panel.querySelector('[data-background-colors-status]');
  const backgroundStorageKey = 'tralume-custom-background-url';
  const backgroundColorEnabledStorageKey = 'tralume-background-dynamic-colors';
  const backgroundPaletteStorageKey = 'tralume-background-dynamic-palette';

  const backgroundStatusMessages = backgroundColorStatus instanceof HTMLElement
    ? {
        idle: backgroundColorStatus.getAttribute('data-background-colors-idle') || '',
        ready: backgroundColorStatus.getAttribute('data-background-colors-ready') || '',
        disabled: backgroundColorStatus.getAttribute('data-background-colors-disabled') || '',
        working: backgroundColorStatus.getAttribute('data-background-colors-working') || '',
        error: backgroundColorStatus.getAttribute('data-background-colors-error') || '',
      }
    : null;

  const setDynamicColorStatus = (type) => {
    if (!(backgroundColorStatus instanceof HTMLElement)) {
      return;
    }
    const fallback = backgroundStatusMessages ? backgroundStatusMessages.idle : '';
    const nextMessage = backgroundStatusMessages && backgroundStatusMessages[type] ? backgroundStatusMessages[type] : fallback;
    backgroundColorStatus.textContent = nextMessage || '';
  };

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

  const updateDynamicToggleAvailability = () => {
    if (!(backgroundColorToggle instanceof HTMLInputElement)) {
      return;
    }
    const shouldDisable = !hasCustomBackground;
    backgroundColorToggle.disabled = shouldDisable;
    backgroundColorToggle.setAttribute('aria-disabled', shouldDisable ? 'true' : 'false');
    backgroundColorToggle.setAttribute('aria-checked', backgroundColorToggle.checked ? 'true' : 'false');
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

  const persistDynamicColorEnabled = (value) => {
    try {
      if (value) {
        window.localStorage.setItem(backgroundColorEnabledStorageKey, '1');
      } else {
        window.localStorage.removeItem(backgroundColorEnabledStorageKey);
      }
    } catch (error) {
      // 说明：部分浏览器在无痕模式下禁止写入，直接忽略即可。
    }
  };

  const readStoredDynamicColorEnabled = () => {
    try {
      return window.localStorage.getItem(backgroundColorEnabledStorageKey) === '1';
    } catch (error) {
      return false;
    }
  };

  const persistDynamicPalette = (payload) => {
    try {
      if (payload) {
        window.localStorage.setItem(backgroundPaletteStorageKey, JSON.stringify(payload));
      } else {
        window.localStorage.removeItem(backgroundPaletteStorageKey);
      }
    } catch (error) {
      // 说明：JSON 写入失败时静默跳过，后续可以重新生成。
    }
  };

  const readStoredDynamicPalette = () => {
    try {
      const raw = window.localStorage.getItem(backgroundPaletteStorageKey);
      if (!raw) {
        return null;
      }
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  };

  const clamp01 = (value) => {
    if (!Number.isFinite(value)) {
      return 0;
    }
    return Math.min(1, Math.max(0, value));
  };

  const normalizeHexColor = (input) => {
    if (typeof input !== 'string') {
      return null;
    }
    const hex = input.trim().replace(/^#/, '');
    if (/^[0-9a-fA-F]{3}$/.test(hex)) {
      return `#${hex.split('').map((ch) => ch + ch).join('').toUpperCase()}`;
    }
    if (/^[0-9a-fA-F]{6}$/.test(hex)) {
      return `#${hex.toUpperCase()}`;
    }
    return null;
  };

  const rgbToHex = (r, g, b) => {
    const clampChannel = (channel) => {
      const safe = Math.round(Math.min(255, Math.max(0, channel)));
      return safe.toString(16).padStart(2, '0');
    };
    return `#${clampChannel(r)}${clampChannel(g)}${clampChannel(b)}`.toUpperCase();
  };

  const hexToRgb = (hex) => {
    const normalized = normalizeHexColor(hex);
    if (!normalized) {
      return null;
    }
    const value = parseInt(normalized.slice(1), 16);
    return {
      r: (value >> 16) & 255,
      g: (value >> 8) & 255,
      b: value & 255,
    };
  };

  const rgbToHsl = (r, g, b) => {
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rn:
          h = ((gn - bn) / d + (gn < bn ? 6 : 0));
          break;
        case gn:
          h = ((bn - rn) / d + 2);
          break;
        default:
          h = ((rn - gn) / d + 4);
          break;
      }
      h *= 60;
    }
    return { h: (h + 360) % 360, s: clamp01(s), l: clamp01(l) };
  };

  const hexToHsl = (hex) => {
    const rgb = hexToRgb(hex);
    if (!rgb) {
      return null;
    }
    return rgbToHsl(rgb.r, rgb.g, rgb.b);
  };

  const hslToRgb = (h, s, l) => {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const hPrime = (h / 60) % 6;
    const x = c * (1 - Math.abs((hPrime % 2) - 1));
    let r1 = 0;
    let g1 = 0;
    let b1 = 0;
    if (hPrime >= 0 && hPrime < 1) {
      r1 = c;
      g1 = x;
    } else if (hPrime >= 1 && hPrime < 2) {
      r1 = x;
      g1 = c;
    } else if (hPrime >= 2 && hPrime < 3) {
      g1 = c;
      b1 = x;
    } else if (hPrime >= 3 && hPrime < 4) {
      g1 = x;
      b1 = c;
    } else if (hPrime >= 4 && hPrime < 5) {
      r1 = x;
      b1 = c;
    } else {
      r1 = c;
      b1 = x;
    }
    const m = l - c / 2;
    return {
      r: Math.round((r1 + m) * 255),
      g: Math.round((g1 + m) * 255),
      b: Math.round((b1 + m) * 255),
    };
  };

  const hslToHex = (h, s, l) => {
    const rgb = hslToRgb(h, s, l);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
  };

  const shiftLightness = (hex, delta) => {
    const hsl = hexToHsl(hex);
    if (!hsl) {
      return hex;
    }
    hsl.l = clamp01(hsl.l + delta);
    return hslToHex(hsl.h, hsl.s, hsl.l);
  };

  const shiftSaturation = (hex, delta) => {
    const hsl = hexToHsl(hex);
    if (!hsl) {
      return hex;
    }
    hsl.s = clamp01(hsl.s + delta);
    return hslToHex(hsl.h, hsl.s, hsl.l);
  };

  const rotateHueColor = (hex, delta) => {
    const hsl = hexToHsl(hex);
    if (!hsl) {
      return hex;
    }
    hsl.h = (hsl.h + delta + 360) % 360;
    return hslToHex(hsl.h, hsl.s, hsl.l);
  };

  const mixColors = (hexA, hexB, amount) => {
    const rgbA = hexToRgb(hexA);
    const rgbB = hexToRgb(hexB);
    if (!rgbA || !rgbB) {
      return hexA || hexB;
    }
    const t = clamp01(amount);
    const r = rgbA.r + (rgbB.r - rgbA.r) * t;
    const g = rgbA.g + (rgbB.g - rgbA.g) * t;
    const b = rgbA.b + (rgbB.b - rgbA.b) * t;
    return rgbToHex(r, g, b);
  };

  const relativeLuminance = (hex) => {
    const rgb = hexToRgb(hex);
    if (!rgb) {
      return 0;
    }
    const normalize = (channel) => {
      const value = channel / 255;
      return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    };
    const r = normalize(rgb.r);
    const g = normalize(rgb.g);
    const b = normalize(rgb.b);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const pickOnColor = (hex, light = '#ffffff', dark = '#1d1b20', threshold = 0.55) => {
    return relativeLuminance(hex) > threshold ? dark : light;
  };

  const ensureSeedStrength = (hex) => {
    const hsl = hexToHsl(hex);
    if (!hsl) {
      return '#6750A4';
    }
    if (hsl.s < 0.25) {
      hsl.s = 0.25;
    } else if (hsl.s > 0.9) {
      hsl.s = 0.9;
    }
    if (hsl.l < 0.3) {
      hsl.l = 0.35;
    } else if (hsl.l > 0.75) {
      hsl.l = 0.7;
    }
    return hslToHex(hsl.h, hsl.s, hsl.l);
  };

  const neutralLightBase = {
    '--md-sys-color-surface': '#fdf8ff',
    '--md-sys-color-surface-dim': '#ded8e1',
    '--md-sys-color-surface-bright': '#fdf8ff',
    '--md-sys-color-on-surface': '#1d1b20',
    '--md-sys-color-on-surface-variant': '#49454f',
    '--md-sys-color-background': '#fdf8ff',
    '--md-sys-color-on-background': '#1d1b20',
    '--md-sys-color-surface-container-lowest': '#ffffff',
    '--md-sys-color-surface-container-low': '#f7f2fa',
    '--md-sys-color-surface-container': '#f3edf7',
    '--md-sys-color-surface-container-high': '#ece6f0',
    '--md-sys-color-surface-container-highest': '#e6e0e9',
  };

  const neutralDarkBase = {
    '--md-sys-color-surface': '#141218',
    '--md-sys-color-surface-dim': '#141218',
    '--md-sys-color-surface-bright': '#3b383e',
    '--md-sys-color-on-surface': '#e6e0e9',
    '--md-sys-color-on-surface-variant': '#cac4d0',
    '--md-sys-color-background': '#141218',
    '--md-sys-color-on-background': '#e6e0e9',
    '--md-sys-color-surface-container-lowest': '#0f0d13',
    '--md-sys-color-surface-container-low': '#1d1b20',
    '--md-sys-color-surface-container': '#211f26',
    '--md-sys-color-surface-container-high': '#2b2930',
    '--md-sys-color-surface-container-highest': '#36343b',
  };

  const tintNeutralPalette = (basePalette, seedColor, ratio) => {
    return Object.entries(basePalette).reduce((accumulator, [token, value]) => {
      if (token.includes('-on-')) {
        accumulator[token] = value;
      } else {
        accumulator[token] = mixColors(value, seedColor, ratio);
      }
      return accumulator;
    }, {});
  };

  const analyzeImageSeed = (source) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    const width = source.width || source.naturalWidth || 0;
    const height = source.height || source.naturalHeight || 0;
    if (!context || !width || !height) {
      throw new Error('无法解析图片尺寸');
    }
    const maxEdge = 196;
    const scale = Math.min(1, maxEdge / Math.max(width, height));
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    context.drawImage(source, 0, 0, canvas.width, canvas.height);
    let imageData;
    try {
      imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    } catch (error) {
      throw new Error('无法读取像素数据，可能缺少跨域授权');
    }
    const { data } = imageData;
    let total = 0;
    let sumR = 0;
    let sumG = 0;
    let sumB = 0;
    let bestScore = 0;
    let bestColor = null;
    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3] / 255;
      if (alpha < 0.6) {
        continue;
      }
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      sumR += r;
      sumG += g;
      sumB += b;
      total += 1;
      const hsl = rgbToHsl(r, g, b);
      const vibrance = hsl.s * 0.7 + (1 - Math.abs(0.5 - hsl.l)) * 0.3;
      if (vibrance > bestScore) {
        bestScore = vibrance;
        bestColor = { r, g, b };
      }
    }
    const averageColor = total > 0
      ? {
          r: Math.round(sumR / total),
          g: Math.round(sumG / total),
          b: Math.round(sumB / total),
        }
      : { r: 103, g: 80, b: 164 };
    const finalColor = bestScore > 0.2 && bestColor ? bestColor : averageColor;
    return rgbToHex(finalColor.r, finalColor.g, finalColor.b);
  };

  const blobToImage = (blob) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.decoding = 'async';
      const objectUrl = URL.createObjectURL(blob);
      image.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(image);
      };
      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('图片解码失败'));
      };
      image.src = objectUrl;
    });
  };

  const fetchImageBlob = async (url) => {
    const response = await fetch(url, { mode: 'cors', credentials: 'omit' });
    if (!response.ok) {
      throw new Error('无法请求图片');
    }
    return response.blob();
  };

  const loadImageSource = async (url) => {
    if (!url) {
      throw new Error('缺少图片链接');
    }
    const isDataUrl = url.startsWith('data:');
    let blob;
    if (isDataUrl) {
      const dataResponse = await fetch(url);
      blob = await dataResponse.blob();
    } else {
      blob = await fetchImageBlob(url);
    }
    if (window.createImageBitmap) {
      try {
        return await window.createImageBitmap(blob);
      } catch (error) {
        // 说明：部分浏览器不支持 createImageBitmap 某些格式，降级为 <img>。
      }
    }
    return blobToImage(blob);
  };

  const buildDynamicPaletteFromSeed = (seedHex, sourceUrl) => {
    const normalizedSeed = ensureSeedStrength(seedHex);
    const enrichedSeed = shiftSaturation(normalizedSeed, 0.08);
    const primaryLight = shiftLightness(enrichedSeed, 0.05);
    const primaryDark = shiftLightness(enrichedSeed, -0.25);
    const primaryContainerLight = shiftLightness(enrichedSeed, 0.32);
    const primaryContainerDark = shiftLightness(enrichedSeed, -0.4);
    const secondaryBase = rotateHueColor(enrichedSeed, 32);
    const secondaryLight = shiftLightness(shiftSaturation(secondaryBase, -0.12), 0.12);
    const secondaryDark = shiftLightness(shiftSaturation(secondaryBase, -0.12), -0.18);
    const secondaryContainerLight = shiftLightness(secondaryLight, 0.28);
    const secondaryContainerDark = shiftLightness(secondaryDark, -0.2);
    const lightNeutrals = tintNeutralPalette(neutralLightBase, normalizedSeed, 0.06);
    const darkNeutrals = tintNeutralPalette(neutralDarkBase, normalizedSeed, 0.1);
    const outlineBase = mixColors(normalizedSeed, '#6f6f7c', 0.35);
    return {
      source: sourceUrl,
      seed: normalizedSeed,
      light: {
        '--md-sys-color-primary': primaryLight,
        '--md-sys-color-on-primary': pickOnColor(primaryLight),
        '--md-sys-color-primary-container': primaryContainerLight,
        '--md-sys-color-on-primary-container': pickOnColor(primaryContainerLight, '#1d1b20', '#ffffff', 0.75),
        '--md-sys-color-secondary': secondaryLight,
        '--md-sys-color-on-secondary': pickOnColor(secondaryLight),
        '--md-sys-color-secondary-container': secondaryContainerLight,
        '--md-sys-color-on-secondary-container': pickOnColor(secondaryContainerLight, '#1d1b20', '#ffffff', 0.75),
        '--md-sys-color-outline': mixColors(outlineBase, '#4b4b56', 0.25),
        '--md-sys-color-outline-variant': shiftLightness(mixColors(outlineBase, '#cbc6d4', 0.55), 0.05),
        ...lightNeutrals,
      },
      dark: {
        '--md-sys-color-primary': primaryDark,
        '--md-sys-color-on-primary': pickOnColor(primaryDark, '#ffffff', '#141218', 0.4),
        '--md-sys-color-primary-container': primaryContainerDark,
        '--md-sys-color-on-primary-container': pickOnColor(primaryContainerDark, '#ffffff', '#141218', 0.35),
        '--md-sys-color-secondary': secondaryDark,
        '--md-sys-color-on-secondary': pickOnColor(secondaryDark, '#ffffff', '#141218', 0.4),
        '--md-sys-color-secondary-container': secondaryContainerDark,
        '--md-sys-color-on-secondary-container': pickOnColor(secondaryContainerDark, '#ffffff', '#141218', 0.35),
        '--md-sys-color-outline': mixColors(outlineBase, '#9a96a5', 0.6),
        '--md-sys-color-outline-variant': mixColors(outlineBase, '#4a454f', 0.3),
        ...darkNeutrals,
      },
    };
  };

  const buildPaletteFromImageUrl = async (imageUrl) => {
    const source = await loadImageSource(imageUrl);
    try {
      const seedHex = analyzeImageSeed(source);
      return buildDynamicPaletteFromSeed(seedHex, imageUrl);
    } finally {
      if (source && typeof source.close === 'function') {
        source.close();
      }
    }
  };

  const cancelDynamicColorRequest = () => {
    dynamicColorTaskId += 1;
  };

  const requestDynamicColorUpdate = async (imageUrl) => {
    if (!imageUrl) {
      return;
    }
    const taskId = ++dynamicColorTaskId;
    setDynamicColorStatus('working');
    try {
      const palette = await buildPaletteFromImageUrl(imageUrl);
      if (taskId !== dynamicColorTaskId) {
        return;
      }
      currentDynamicPalette = palette;
      persistDynamicPalette(palette);
      applyDynamicPaletteOverrides(palette);
      setDynamicColorStatus('ready');
    } catch (error) {
      if (taskId !== dynamicColorTaskId) {
        return;
      }
      console.error('[Tralume] 动态取色失败', error);
      currentDynamicPalette = null;
      persistDynamicPalette(null);
      clearDynamicPaletteOverrides();
      setDynamicColorStatus('error');
    }
  };

  const handleDynamicColorForCurrentBackground = () => {
    syncColorInterlocks();
    if (!hasCustomBackground) {
      clearDynamicPaletteOverrides();
      setDynamicColorStatus('idle');
      return;
    }
    if (!isDynamicColorEnabled) {
      clearDynamicPaletteOverrides();
      setDynamicColorStatus('disabled');
      return;
    }
    if (currentDynamicPalette && currentDynamicPalette.source === currentBackgroundValue) {
      applyDynamicPaletteOverrides(currentDynamicPalette);
      setDynamicColorStatus('ready');
      return;
    }
    requestDynamicColorUpdate(currentBackgroundValue);
  };

  const applyBackgroundImage = (rawUrl, shouldPersist = true) => {
    const trimmed = typeof rawUrl === 'string' ? rawUrl.trim() : '';
    cancelDynamicColorRequest();
    if (!trimmed) {
      root.style.setProperty('--app-custom-background-image', 'none');
      root.style.setProperty('--app-custom-background-opacity', '0');
      hasCustomBackground = false;
      currentBackgroundValue = '';
      currentDynamicPalette = null;
      persistDynamicPalette(null);
      clearDynamicPaletteOverrides();
      if (shouldPersist) {
        persistBackgroundValue('');
      }
      updateBackgroundButtons();
      updateDynamicToggleAvailability();
      setDynamicColorStatus('idle');
      syncColorInterlocks();
      return;
    }

    const sanitized = JSON.stringify(trimmed);
    root.style.setProperty('--app-custom-background-image', `url(${sanitized})`);
    root.style.setProperty('--app-custom-background-opacity', '1');
    hasCustomBackground = true;
    currentBackgroundValue = trimmed;
    if (shouldPersist) {
      persistBackgroundValue(trimmed);
    }
    updateBackgroundButtons();
    updateDynamicToggleAvailability();
    syncColorInterlocks();
    handleDynamicColorForCurrentBackground();
  };

  isDynamicColorEnabled = readStoredDynamicColorEnabled();
  if (backgroundColorToggle instanceof HTMLInputElement) {
    backgroundColorToggle.checked = isDynamicColorEnabled;
    backgroundColorToggle.setAttribute('aria-checked', isDynamicColorEnabled ? 'true' : 'false');
  }
  const storedPalette = readStoredDynamicPalette();
  if (storedPalette && typeof storedPalette === 'object' && storedPalette.light && storedPalette.dark) {
    currentDynamicPalette = storedPalette;
  }

  const initialBackgroundImage = readStoredBackgroundImage() || '';
  if (backgroundInput instanceof HTMLInputElement) {
    backgroundInput.value = initialBackgroundImage;
  }
  applyBackgroundImage(initialBackgroundImage, false);
  updateBackgroundButtons();
  updateDynamicToggleAvailability();

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

  if (backgroundColorToggle instanceof HTMLInputElement) {
    backgroundColorToggle.addEventListener('change', () => {
      isDynamicColorEnabled = Boolean(backgroundColorToggle.checked);
      backgroundColorToggle.setAttribute('aria-checked', backgroundColorToggle.checked ? 'true' : 'false');
      persistDynamicColorEnabled(isDynamicColorEnabled);
      syncColorInterlocks();
      if (!hasCustomBackground) {
        if (!isDynamicColorEnabled) {
          clearDynamicPaletteOverrides();
        }
        setDynamicColorStatus('idle');
        return;
      }
      if (isDynamicColorEnabled) {
        handleDynamicColorForCurrentBackground();
      } else {
        cancelDynamicColorRequest();
        clearDynamicPaletteOverrides();
        setDynamicColorStatus('disabled');
      }
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
